import { apiClient } from "./client";
import type { AuditLogEntry, ConnectedAccount, OAuthClient, OAuthConsent, OAuthClientConfig, OAuthPermission } from "@/types/api";

export const securityApi = { auditLogs() { return apiClient.get<{ logs: AuditLogEntry[] }>("/security/audit-logs"); } };
export const connectedAccountsApi = {
  list() { return apiClient.get<{ accounts: ConnectedAccount[] }>("/connected-accounts"); },
  unlink(accountId: string) { return apiClient.delete<{ message: string }>(`/connected-accounts/${accountId}`); },
  spotifyConnect() { return apiClient.get<{ authorizationUrl: string }>("/connected-accounts/spotify/connect"); },
  spotifyRefresh() { return apiClient.post<{ account: ConnectedAccount }>("/connected-accounts/spotify/refresh", {}); },
  googleCalendarConnect() { return apiClient.get<{ authorizationUrl: string }>("/connected-accounts/google/calendar/connect"); },
  googleConnect(credential: string) { return apiClient.post<{ message: string }>("/auth/google/connect", { credential }); },
  discordConnect() { return apiClient.get<{ authorizationUrl: string }>("/connected-accounts/discord/connect"); },
  discordMe() { return apiClient.get<{ profile: Record<string, unknown> }>("/connected-accounts/discord/me"); },
  discordGuilds() { return apiClient.get<{ guilds: Array<Record<string, unknown>> }>("/connected-accounts/discord/guilds"); },
};
export const oauthApi = {
  listClients() { return apiClient.get<{ clients: OAuthClient[] }>("/oauth/clients"); },
  createClient(data: { name: string; redirectUris: string[]; scopes: OAuthPermission[]; isConfidential?: boolean }) { return apiClient.post<{ client: OAuthClient; clientSecret?: string }>("/oauth/clients", data); },
  updateClient(clientId: string, data: { name?: string; redirectUris?: string[]; scopes?: OAuthPermission[] }) { return apiClient.patch<{ client: OAuthClient }>(`/oauth/clients/${clientId}`, data); },
  getClientConfig(clientId: string) { return apiClient.get<{ config: OAuthClientConfig }>(`/oauth/clients/${clientId}/config`); },
  updateClientConfig(clientId: string, data: OAuthClientConfig) { return apiClient.put<{ config: OAuthClientConfig }>(`/oauth/clients/${clientId}/config`, data); },
  verifyManifest(clientId: string) { return apiClient.post<{ verified: boolean; checks: Record<string, boolean> }>(`/oauth/clients/${clientId}/verify-manifest`, {}); },
  rotateClientSecret(clientId: string) { return apiClient.post<{ clientId: string; clientSecret: string }>(`/oauth/clients/${clientId}/rotate-secret`, {}); },
  revokeClient(clientId: string) { return apiClient.delete<{ client: OAuthClient }>(`/oauth/clients/${clientId}`); },
  listConsents() { return apiClient.get<{ consents: OAuthConsent[] }>("/oauth/consents"); },
  revokeConsent(consentId: string) { return apiClient.delete<{ message: string }>(`/oauth/consents/${consentId}`); },
};

export interface OAuthClientTestResult { valid: boolean; clientId: string; client?: { clientId: string; name: string; websiteUrl: string | null; logoUrl: string | null; applicationType: string | null; verificationStatus: string }; checks: { key: string; label: string; ok: boolean; detail: string }[]; allowedScopes?: string[]; redirectUris?: string[]; }
export async function testOAuthClient(clientId: string, redirectUri: string, scopes: OAuthPermission[]) { const params = new URLSearchParams({ client_id: clientId }); if (redirectUri.trim()) params.set("redirect_uri", redirectUri.trim()); if (scopes.length) params.set("scope", scopes.join(" ")); const response = await fetch(`https://auth.max-ai.name.ng/api/v1/oauth/client-tester?${params.toString()}`, { method: "GET", credentials: "include", headers: { Accept: "application/json" } }); const body = await response.json(); if (!response.ok) throw new Error(body?.error?.message || "Client test failed"); return body.data as OAuthClientTestResult; }
