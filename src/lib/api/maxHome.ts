"use client";

import { apiClient } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/tokenStore";

const API_URL = process.env.NEXT_PUBLIC_MAX_HOME_API_URL || "https://max-home-backend.onrender.com/api/v1";

export interface MaxHome {
  id: string;
  name: string;
  role: string;
  timezone?: string | null;
  city?: string | null;
  country?: string | null;
  family_banner_data?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  state_region?: string | null;
  postal_code?: string | null;
}

export interface MaxHomeLink extends Pick<MaxHome, "id" | "name" | "role" | "timezone" | "city" | "country"> { linked: boolean; }

export interface MaxHomeLinks { homes: MaxHomeLink[]; linkAll: boolean; }

export interface MaxHomeMember {
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
}

export interface MaxHomeRoom {
  id: string;
  home_id: string;
  name: string;
  room_type?: string | null;
  sort_order?: number;
}

export interface MaxHomeDevice {
  id: string;
  name: string;
  device_type: string;
  manufacturer?: string | null;
  model?: string | null;
  status?: string | null;
  connection_state?: string | null;
  last_seen_at?: string | null;
  room_id?: string | null;
}

type MaxHomeResponse<T> =
  | { success: true; data: T }
  | { success: false; error?: { message?: string } };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Access tokens are intentionally memory-only, so a page reload clears
  // tokenStore. Restore the MAX Auth session before calling MAX Home.
  let token = tokenStore.get() || await apiClient.silentRefresh();
  if (!token) {
    throw new Error("Your MAX Account session could not be restored. Please sign in again.");
  }

  const send = (accessToken: string) => fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  let response = await send(token);

  // MAX Home validates every access token against MAX Auth userinfo. If the
  // access token expired between page bootstrap and this request, rotate it
  // once through MAX Auth and retry rather than showing a false sign-in error.
  if (response.status === 401) {
    const refreshedToken = await apiClient.silentRefresh();
    if (refreshedToken && refreshedToken !== token) {
      token = refreshedToken;
      response = await send(token);
    }
  }

  const payload = await response.json().catch(() => null) as MaxHomeResponse<T> | null;
  if (!response.ok || !payload || !payload.success) {
    throw new Error(payload && !payload.success
      ? payload.error?.message || "MAX Home could not be reached."
      : `MAX Home request failed (${response.status}).`);
  }
  return payload.data;
}

export const maxHomeApi = {
  getHomes: () => request<{ homes: MaxHome[] }>("/homes"),
  getAccountLinks: () => request<MaxHomeLinks>("/account-links"),
  updateAccountLinks: (data: { mode: "all" } | { mode: "selected"; homeIds: string[] }) => request<{ mode: "all" | "selected"; linkedCount: number | null }>("/account-links", { method: "PUT", body: JSON.stringify(data) }),
  unlinkAccountHomes: () => request<{ unlinked: boolean }>("/account-links", { method: "DELETE" }),
  getMembers: (homeId: string) => request<{ members: MaxHomeMember[] }>(`/homes/${encodeURIComponent(homeId)}/members`),
  getRooms: (homeId: string) => request<{ rooms: MaxHomeRoom[] }>(`/homes/${encodeURIComponent(homeId)}/rooms`),
  getDevices: (homeId: string) => request<{ devices: MaxHomeDevice[] }>(`/homes/${encodeURIComponent(homeId)}/devices`),
};
