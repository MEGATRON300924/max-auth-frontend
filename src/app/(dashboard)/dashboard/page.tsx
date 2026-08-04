"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { devicesApi } from "@/lib/api/devices";
import { profileApi } from "@/lib/api/profile";
import { securityApi, connectedAccountsApi } from "@/lib/api/security";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { SecurityStatusCard } from "@/components/dashboard/SecurityStatusCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { RecentDevicesCard } from "@/components/dashboard/RecentDevicesCard";
import { RecentLoginsCard } from "@/components/dashboard/RecentLoginsCard";
import { ConnectedAppsCard } from "@/components/dashboard/ConnectedAppsCard";
import { AIPersonalizationCard } from "@/components/dashboard/AIPersonalizationCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const { user } = useAuth();

  const devices = useAsyncData(() => devicesApi.list().then((r) => r.devices));
  const loginHistory = useAsyncData(() => devicesApi.loginHistory().then((r) => r.history));
  const aiProfile = useAsyncData(() => profileApi.getAIProfile().then((r) => r.aiProfile));
  const connectedAccounts = useAsyncData(() => connectedAccountsApi.list().then((r) => r.accounts));
  const auditLogs = useAsyncData(() => securityApi.auditLogs().then((r) => r.logs));

  if (!user) return null;

  return (
    <div className="space-y-6">
      <WelcomeCard user={user} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {devices.isLoading ? <SkeletonCard /> : <RecentDevicesCard devices={devices.data ?? []} />}
          {loginHistory.isLoading ? (
            <SkeletonCard />
          ) : (
            <RecentLoginsCard history={loginHistory.data ?? []} />
          )}
          {auditLogs.isLoading ? <SkeletonCard /> : <RecentActivityCard logs={auditLogs.data ?? []} />}
        </div>

        <div className="space-y-6">
          <ProfileCompletionCard user={user} />
          <SecurityStatusCard user={user} />
          <QuickActionsCard />
          {aiProfile.isLoading ? (
            <SkeletonCard />
          ) : (
            <AIPersonalizationCard profile={aiProfile.data} />
          )}
          {connectedAccounts.isLoading ? (
            <SkeletonCard />
          ) : (
            <ConnectedAppsCard accounts={connectedAccounts.data ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
