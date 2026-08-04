// Mirrors src/database models exposed by MAX Auth backend (see backend/docs/API.md)

export type SubscriptionTier = "FREE" | "PLUS" | "PRO" | "BUSINESS" | "ENTERPRISE";
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED" | "DEACTIVATED";

export interface MaxUser {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  country: string | null;
  language: string | null;
  timezone: string | null;
  subscriptionTier: SubscriptionTier;
  verificationStatus: VerificationStatus;
  status: AccountStatus;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIProfile {
  id: string;
  userId: string;
  interests: string[] | null;
  preferences: Record<string, unknown> | null;
  languages: string[] | null;
  connectedServices: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  isTrusted: boolean;
  trustedAt: string | null;
  lastIp: string | null;
  lastSeenAt: string;
  createdAt: string;
}

export interface Session {
  id: string;
  deviceId: string | null;
  device?: Device | null;
  userAgent: string | null;
  ipAddress: string | null;
  isRevoked: boolean;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface LoginHistoryEntry {
  id: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  reason: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export type ConnectedProvider =
  | "GOOGLE"
  | "X"
  | "INSTAGRAM"
  | "SNAPCHAT"
  | "SPOTIFY"
  | "DISCORD"
  | "GITHUB";

export interface ConnectedAccount {
  id: string;
  provider: ConnectedProvider;
  providerAccountId: string;
  scope: string | null;
  linkedAt: string;
  updatedAt: string;
}

export interface OAuthClient {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  scopes: string[];
  isConfidential: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface OAuthConsent {
  id: string;
  scopes: string[];
  grantedAt: string;
  revokedAt: string | null;
  client: { name: string; clientId: string };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
