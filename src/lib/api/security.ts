import { apiClient } from "./client";
import type { AuditLogEntry, ConnectedAccount, OAuthClient, OAuthConsent } from "@/types/api";

export const securityApi = {
  auditLogs() {
    return apiClient.get<{ logs: AuditLogEntry[] }>("/security/audit-logs");
  },
};

export const connectedAccountsApi = {
  list() {
    return apiClient.get<{ accounts: ConnectedAccount[] }>("/connected-accounts");
  },
  unlink(accountId: string) {
    return apiClient.delete<{ message: string }>(`/connected-accounts/${accountId}`);
  },
};

export const oauthApi = {
  listClients() {
    return apiClient.get<{ clients: OAuthClient[] }>("/oauth/clients");
  },
  createClient(data: { name: string; redirectUris: string[]; scopes: string[] }) {
    return apiClient.post<{ client: OAuthClient; clientSecret: string }>("/oauth/clients", data);
  },
  revokeClient(clientId: string) {
    return apiClient.delete<{ client: OAuthClient }>(`/oauth/clients/${clientId}`);
  },
  listConsents() {
    return apiClient.get<{ consents: OAuthConsent[] }>("/oauth/consents");
  },
  revokeConsent(consentId: string) {
    return apiClient.delete<{ message: string }>(`/oauth/consents/${consentId}`);
  },
};
