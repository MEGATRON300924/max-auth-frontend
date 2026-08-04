import { apiClient } from "./client";
import type { Device, Session, LoginHistoryEntry } from "@/types/api";

export const devicesApi = {
  list() {
    return apiClient.get<{ devices: Device[] }>("/devices");
  },
  trust(deviceId: string) {
    return apiClient.post<{ device: Device }>(`/devices/${deviceId}/trust`);
  },
  revoke(deviceId: string) {
    return apiClient.delete<{ message: string }>(`/devices/${deviceId}`);
  },
  listSessions() {
    return apiClient.get<{ sessions: Session[] }>("/devices/sessions/all");
  },
  revokeSession(sessionId: string) {
    return apiClient.delete<{ message: string }>(`/devices/sessions/${sessionId}`);
  },
  revokeAllSessions() {
    return apiClient.delete<{ message: string }>("/devices/sessions");
  },
  loginHistory() {
    return apiClient.get<{ history: LoginHistoryEntry[] }>("/devices/login-history");
  },
};
