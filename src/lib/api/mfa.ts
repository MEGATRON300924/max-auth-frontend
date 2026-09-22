import { apiClient } from "./client";

export interface MfaStatus {
  enabled: boolean;
  method: string | null;
  recoveryCodesRemaining: number;
}

export interface MfaSetup {
  secret: string;
  otpauthUrl: string;
}

export interface RecoveryCodes {
  recoveryCodes: string[];
}

export const mfaApi = {
  status() { return apiClient.get<MfaStatus>("/mfa/"); },
  setup(password: string) { return apiClient.post<MfaSetup>("/mfa/setup", { password }); },
  enable(password: string, code: string) { return apiClient.post<RecoveryCodes>("/mfa/enable", { password, code }); },
  regenerateRecoveryCodes(password: string, code: string) { return apiClient.post<RecoveryCodes>("/mfa/recovery-codes/regenerate", { password, code }); },
  disable(password: string, code: string) { return apiClient.post<{ disabled: boolean }>("/mfa/disable", { password, code }); },
};
