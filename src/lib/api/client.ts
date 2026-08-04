import { ApiError } from "./ApiError";
import { tokenStore } from "./tokenStore";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

let csrfToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${API_URL}/security/csrf-token`, { credentials: "include" });
  const json = await res.json();
  csrfToken = json?.data?.csrfToken ?? "";
  return csrfToken as string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Cookie-based routes (refresh/logout) require a CSRF header. */
  needsCsrf?: boolean;
  /** Skip attaching the Authorization header (used for register/login/public routes). */
  skipAuth?: boolean;
  /** Internal — prevents infinite refresh retry loops. */
  _retried?: boolean;
}

async function rawRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (!opts.skipAuth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  if (opts.needsCsrf) {
    headers["x-csrf-token"] = await getCsrfToken();
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    credentials: "include", // send the httpOnly refresh cookie
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  let json: ApiResponse<T> | undefined;
  try {
    json = await res.json();
  } catch {
    // no body (e.g. some 204s) — fall through to status-based handling
  }

  if (res.ok && json?.success) {
    return json.data;
  }

  const code = json && !json.success ? json.error.code : "UNKNOWN_ERROR";
  const message =
    json && !json.success ? json.error.message : `Request failed with status ${res.status}`;
  const details = json && !json.success ? json.error.details : undefined;

  // Access token expired mid-session — try one silent refresh, then retry the original call.
  if (res.status === 401 && !opts.skipAuth && !opts._retried && path !== "/auth/refresh") {
    const newToken = await silentRefresh();
    if (newToken) {
      return rawRequest<T>(path, { ...opts, _retried: true });
    }
  }

  throw new ApiError(message, code, res.status, details);
}

/**
 * Coalesces concurrent 401s into a single refresh call so a burst of
 * simultaneous requests doesn't trigger a refresh storm.
 */
function silentRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = rawRequest<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      needsCsrf: true,
      skipAuth: true,
    })
      .then((data) => {
        tokenStore.set(data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        tokenStore.set(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) =>
    rawRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    rawRequest<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    rawRequest<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    rawRequest<T>(path, { ...opts, method: "DELETE" }),
  silentRefresh,
};
