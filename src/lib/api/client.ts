import { ApiError } from "./ApiError";
import { tokenStore } from "./tokenStore";
import type { ApiResponse } from "@/types/api";

// MAX Auth frontend is hosted on api.max-ai.name.ng; the MAX Auth backend/API
// is hosted on auth.max-ai.name.ng.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://auth.max-ai.name.ng/api/v1";

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
  needsCsrf?: boolean;
  skipAuth?: boolean;
  _retried?: boolean;
}

async function rawRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const accessToken = opts.skipAuth ? null : tokenStore.get();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (opts.needsCsrf) headers["x-csrf-token"] = await getCsrfToken();
  const res = await fetch(`${API_URL}${path}`, { method: opts.method ?? "GET", headers, credentials: "include", body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined });
  const requestId = res.headers.get("x-request-id") ?? undefined;
  let json: ApiResponse<T> | undefined;
  try { json = await res.json(); } catch {}
  if (res.ok && json?.success) return json.data;
  const code = json && !json.success ? json.error.code : "UNKNOWN_ERROR";
  const message = json && !json.success ? json.error.message : `Request failed with status ${res.status}`;
  const details = json && !json.success ? json.error.details : undefined;
  // Only renew a session when this request actually carried an access token.
  // Unauthenticated 401s must not fan out into refresh-cookie requests; the
  // initial session bootstrap calls silentRefresh explicitly.
  if (res.status === 401 && accessToken && !opts._retried && path !== "/auth/refresh") { const newToken = await silentRefresh(); if (newToken) return rawRequest<T>(path, { ...opts, _retried: true }); }
  throw new ApiError(message, code, res.status, details, requestId);
}

const ROTATION_RETRY_DELAYS_MS = [180, 360, 600];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshWithRecovery(attempt = 0): Promise<string | null> {
  try {
    const data = await rawRequest<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      skipAuth: true,
    });
    tokenStore.set(data.accessToken);
    return data.accessToken;
  } catch (error) {
    // A different tab or MAX product may have rotated the shared httpOnly
    // cookie first. Give that response time to update the cookie, then retry.
    if (error instanceof ApiError && error.code === "REFRESH_TOKEN_ROTATED" && attempt < ROTATION_RETRY_DELAYS_MS.length) {
      await wait(ROTATION_RETRY_DELAYS_MS[attempt]);
      return refreshWithRecovery(attempt + 1);
    }

    tokenStore.set(null);
    return null;
  }
}

function silentRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    const refresh = () => refreshWithRecovery();

    // Web Locks serialize refreshes across tabs on this origin. MAX Auth's
    // backend also handles collisions from other MAX product origins.
    const lockManager = typeof navigator !== "undefined"
      ? (navigator as Navigator & {
          locks?: { request<T>(name: string, callback: () => Promise<T>): Promise<T> };
        }).locks
      : undefined;
    const coordinatedRefresh = lockManager
      ? lockManager.request("max-auth-refresh", refresh).catch(() => refresh())
      : refresh();

    refreshPromise = coordinatedRefresh.finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) => rawRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => rawRequest<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => rawRequest<T>(path, { ...opts, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => rawRequest<T>(path, { ...opts, method: "PUT", body }),
  delete: <T>(path: string, opts?: RequestOptions) => rawRequest<T>(path, { ...opts, method: "DELETE" }),
  silentRefresh,
};
