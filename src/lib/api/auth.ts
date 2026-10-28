import { apiClient } from "./client";
import { tokenStore } from "./tokenStore";
import type { MaxUser } from "@/types/api";

export interface AuthPayload { user: MaxUser; accessToken: string; }
export interface ParentalConsentDetails { childName: string; ageGroup: "UNDER_16" | "AGE_16_17"; expiresAt: string; parentEmail: string; }
export interface OAuthAuthorizationRequest { clientId: string; clientName: string; clientLogo?: string; clientWebsite?: string; redirectUri: string; scopes: string[]; codeChallenge: string; codeChallengeMethod: "S256"; state: string; expiresAt: number; businessId?: string; businessName?: string; }

export const authApi = {
  async register(input: { username: string; email: string; password: string; fullName: string; displayName: string; ageConfirmed: true; ageGroup: "UNDER_16" | "AGE_16_17" | "AGE_18_PLUS"; parentEmail?: string; rememberMe?: boolean }) { const data = await apiClient.post<AuthPayload>("/auth/register", input, { skipAuth: true }); tokenStore.set(data.accessToken); return data; },
  async login(identifier: string, password: string, rememberMe = true, mfaCode?: string) { const data = await apiClient.post<AuthPayload>("/auth/login", { identifier, password, rememberMe, ...(mfaCode ? { mfaCode } : {}) }, { skipAuth: true }); tokenStore.set(data.accessToken); return data; },
  async google(credential: string, mfaCode?: string) { const data = await apiClient.post<AuthPayload>("/auth/google", { credential, ...(mfaCode ? { mfaCode } : {}) }, { skipAuth: true }); tokenStore.set(data.accessToken); return data; },
  async logout() { try { await apiClient.post("/auth/logout", undefined, { needsCsrf: true, skipAuth: true }); } finally { tokenStore.set(null); } },
  me() { return apiClient.get<{ user: MaxUser }>("/auth/me"); },
  getParentalConsent(token: string) { return apiClient.get<ParentalConsentDetails>(`/family/parental-consent?token=${encodeURIComponent(token)}`, { skipAuth: true }); },
  approveParentalConsent(token: string) { return apiClient.post<{ approved: boolean }>("/family/parental-consent/approve", { token, guardianAttestation: true }, { skipAuth: true }); },
  approveParentalConsentWithAccount(token: string) { return apiClient.post<{ approved: boolean }>("/family/parental-consent/approve-with-account", { token, guardianAttestation: true }); },
  declineParentalConsent(token: string) { return apiClient.post<{ declined: boolean }>("/family/parental-consent/decline", { token, guardianAttestation: true }, { skipAuth: true }); },
  sendVerificationEmail() { return apiClient.post<{ message: string }>("/auth/email/send-verification"); },
  verifyEmail(token: string) { return apiClient.post<{ message: string }>("/auth/email/verify", { token }, { skipAuth: true }); },
  forgotPassword(email: string) { return apiClient.post<{ message: string }>("/auth/password/forgot", { email }, { skipAuth: true }); },
  resetPassword(token: string, newPassword: string) { return apiClient.post<{ message: string }>("/auth/password/reset", { token, newPassword }, { skipAuth: true }); },
  changePassword(currentPassword: string, newPassword: string) { return apiClient.post("/auth/password/change", { currentPassword, newPassword }); },
  deleteAccount(password: string) { return apiClient.delete("/auth/account", { body: { password } }); },
  getOAuthRequest(requestToken: string) { return apiClient.get<{ request: OAuthAuthorizationRequest }>(`/oauth/authorize/details?request_token=${encodeURIComponent(requestToken)}`, { skipAuth: true }).then((data) => data.request); },
  approveOAuth(input: { clientId: string; redirectUri: string; scopes: string; codeChallenge?: string; codeChallengeMethod?: string; state?: string; requestToken: string }) { return apiClient.post<{ redirectUri: string }>("/oauth/authorize/approve", input); },
};
