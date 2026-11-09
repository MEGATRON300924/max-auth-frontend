"use client";

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

async function request<T>(path: string): Promise<T> {
  const token = tokenStore.get();
  if (!token) throw new Error("Your MAX Auth session is still loading. Please try again.");
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as
    | { success: true; data: T }
    | { success: false; error?: { message?: string } }
    | null;
  if (!response.ok || !payload || !payload.success) {
    throw new Error(payload && !payload.success ? payload.error?.message || "MAX Home could not be reached." : `MAX Home request failed (${response.status}).`);
  }
  return payload.data;
}

export const maxHomeApi = {
  getHomes: () => request<{ homes: MaxHome[] }>("/homes"),
  getMembers: (homeId: string) => request<{ members: MaxHomeMember[] }>(`/homes/${encodeURIComponent(homeId)}/members`),
  getRooms: (homeId: string) => request<{ rooms: MaxHomeRoom[] }>(`/homes/${encodeURIComponent(homeId)}/rooms`),
  getDevices: (homeId: string) => request<{ devices: MaxHomeDevice[] }>(`/homes/${encodeURIComponent(homeId)}/devices`),
};
