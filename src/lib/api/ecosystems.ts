import { apiClient } from "./client";

export type MaxOrganisation = {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "MEMBER" | "READ_ONLY";
  ecosystemCount: number;
  memberCount: number;
  createdAt: string;
};
export type EcosystemClient = {
  id: string;
  clientId: string;
  name: string;
  isPrimary: boolean;
  linkedAt: string;
};
export type MaxEcosystem = {
  id: string;
  organisationId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  clientCount: number;
  clients: EcosystemClient[] | null;
};
export type OwnedOAuthClient = {
  id: string;
  clientId: string;
  name: string;
  isActive: boolean;
};
export const ecosystemApi = {
  listOrganisations() {
    return apiClient.get<{ organisations: MaxOrganisation[] }>("/ecosystems/organisations");
  },
  createOrganisation(input: { name: string; slug?: string }) {
    return apiClient.post<{ organisation: MaxOrganisation }>("/ecosystems/organisations", input);
  },
  listEcosystems(organisationId: string) {
    return apiClient.get<{ ecosystems: MaxEcosystem[] }>(`/ecosystems/organisations/${organisationId}/ecosystems`);
  },
  createEcosystem(organisationId: string, input: { name: string; slug?: string; description?: string }) {
    return apiClient.post<{ ecosystem: MaxEcosystem }>(`/ecosystems/organisations/${organisationId}/ecosystems`, input);
  },
  linkClient(ecosystemId: string, oauthClientId: string, isPrimary: boolean) {
    return apiClient.post<{ client: EcosystemClient }>(`/ecosystems/ecosystems/${ecosystemId}/clients`, { oauthClientId, isPrimary });
  },
  setPrimary(ecosystemId: string, oauthClientId: string) {
    return apiClient.put<{ isPrimary: true }>(`/ecosystems/ecosystems/${ecosystemId}/clients/${oauthClientId}/primary`);
  },
  unlinkClient(ecosystemId: string, oauthClientId: string) {
    return apiClient.delete<{ unlinked: true }>(`/ecosystems/ecosystems/${ecosystemId}/clients/${oauthClientId}`);
  },
};
