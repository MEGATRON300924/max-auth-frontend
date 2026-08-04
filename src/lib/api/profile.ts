import { apiClient } from "./client";
import type { MaxUser, AIProfile } from "@/types/api";

export const profileApi = {
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
