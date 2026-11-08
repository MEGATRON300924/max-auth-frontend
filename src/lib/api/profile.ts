import { apiClient } from "./client";
import type { MaxUser, AIProfile } from "@/types/api";

export const profileApi = {
  async uploadAvatar(file: File) {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Choose a JPG, PNG, WebP or AVIF image up to 5 MB.");
    const signed = await apiClient.post<{ cloudName: string; apiKey: string; uploadUrl: string; folder: string; publicId: string; signature: string; timestamp: number; uploadParams: Record<string, string> }>("/profile/avatar/sign", {});
    const form = new FormData();
    Object.entries(signed.uploadParams).forEach(([key, value]) => form.append(key, value));
    form.append("api_key", signed.apiKey); form.append("signature", signed.signature); form.append("file", file);
    const response = await fetch(signed.uploadUrl, { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok || !result?.public_id) throw new Error(result?.error?.message || "Cloudinary upload failed.");
    return apiClient.post<{ avatarUrl: string; user: MaxUser }>("/profile/avatar/complete", { publicId: result.public_id });
  },
  get() {
    return apiClient.get<{ user: MaxUser }>("/profile");
  },

  update(data: {
    displayName?: string;
    avatarUrl?: string;
    country?: string;
    language?: string;
    timezone?: string;
  }) {
    return apiClient.patch<{ user: MaxUser }>("/profile", data);
  },

  getAIProfile() {
    return apiClient.get<{ aiProfile: AIProfile }>("/profile/ai");
  },

  updateAIProfile(data: {
    interests?: string[];
    preferences?: Record<string, unknown>;
    languages?: string[];
    connectedServices?: string[];
  }) {
    return apiClient.patch<{ aiProfile: AIProfile }>("/profile/ai", data);
  },
};
