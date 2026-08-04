import { apiClient } from "./client";
import { tokenStore } from "./tokenStore";
import type { MaxUser } from "@/types/api";

export interface AuthPayload {
  user: MaxUser;
  accessToken: string;
}

export const authApi = {
  async register(input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) {
    const data = await apiClient.post<AuthPayload>("/auth/register", input, { skipAuth: true });
    tokenStore.set(data.accessToken);
    return data;
  },

  async login(identifier: string, password: string) {
    const data = await apiClient.post<AuthPayload>(
      "/auth/login",
      { identifier, password },
      { skipAuth: true }
    );
    tokenStore.set(data.accessToken);
    return data;
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout", undefined, { needsCsrf: true, skipAuth: true });
    } finally {
      tokenStore.set(null);
    }
  },

  me() {
    return apiClient.get<{ user: MaxUser }>("/auth/me");
  },

  sendVerificationEmail() {
    return apiClient.post<{ message: string }>("/auth/email/send-verification");
  },

  verifyEmail(token: string) {
    return apiClient.post<{ message: string }>(
      "/auth/email/verify",
      { token },
      { skipAuth: true }
    );
  },

  forgotPassword(email: string) {
    return apiClient.post<{ message: string }>(
      "/auth/password/forgot",
      { email },
      { skipAuth: true }
    );
  },

  resetPassword(token: string, newPassword: string) {
    return apiClient.post<{ message: string }>(
      "/auth/password/reset",
      { token, newPassword },
      { skipAuth: true }
    );
  },

  changePassword(currentPassword: string, newPassword: string) {
    return apiClient.post<{ message: string }>("/auth/password/change", {
      currentPassword,
      newPassword,
    });
  },

  deleteAccount(password: string) {
    return apiClient.delete<{ message: string }>("/auth/account", {
      body: { password },
    });
  },
};
