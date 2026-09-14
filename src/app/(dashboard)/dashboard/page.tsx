"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Smartphone, LockKeyhole, AppWindow, Activity, UserRound } from "lucide-react";
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

const links = [
  { href: "/profile", label: "Personal info", description: "Your name, email and profile", icon: UserRound },
  { href: "/security", label: "Security", description: "Password, 2-step verification and more", icon: ShieldCheck },
  { href: "/devices", label: "Your devices", description: "Devices signed in to your account", icon: Smartphone },
  { href: "/connected-apps", label: "Connected apps", description: "Apps with access to your account", icon: AppWindow },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const devices = useAsyncData(() => devicesApi.list().then((r) => r.devices));
  const loginHistory = useAsyncData(() => devicesApi.loginHistory().then((r) => r.history));
  const aiProfile = useAsyncData(() => profileApi.getAIProfile().then((r) => r.aiProfile));
  const connectedAccounts = useAsyncData(() => connectedAccountsApi.list().then((r) => r.accounts));
  const auditLogs = useAsyncData(() => securityApi.auditLogs().then((r) => r.logs));

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-12">
      <WelcomeCard user={user} />

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-ink">Account overview</h2>
          <p className="mt-1 text-sm text-ink-muted">Manage the information and services connected to your MAX Account.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-glass-border bg-base-raised divide-y divide-glass-border">
          {links.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href} className="group flex items-center gap-4 px-5 py-5 transition-colors hover:bg-glass-hover sm:px-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="mt-0.5 block text-sm text-ink-muted">{description}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Security & activity</h2>
            <p className="mt-1 text-sm text-ink-muted">Keep your account protected and review recent access.</p>
          </div>
          <Link href="/security" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:flex dark:text-brand-400">Review security <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {devices.isLoading ? <SkeletonCard /> : <RecentDevicesCard devices={devices.data ?? []} />}
          </div>
          <div className="space-y-5">
            <SecurityStatusCard user={user} />
            <QuickActionsCard />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Recent activity</h2>
            <p className="mt-1 text-sm text-ink-muted">A quick look at account access and connected services.</p>
          </div>
          <Activity className="h-5 w-5 text-ink-faint" />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {loginHistory.isLoading ? <SkeletonCard /> : <RecentLoginsCard history={loginHistory.data ?? []} />}
          {auditLogs.isLoading ? <SkeletonCard /> : <RecentActivityCard logs={auditLogs.data ?? []} />}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-ink">MAX ecosystem</h2>
          <p className="mt-1 text-sm text-ink-muted">Personalization and apps connected to your MAX identity.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <ProfileCompletionCard user={user} />
          {aiProfile.isLoading ? <SkeletonCard /> : <AIPersonalizationCard profile={aiProfile.data} />}
          {connectedAccounts.isLoading ? <SkeletonCard /> : <ConnectedAppsCard accounts={connectedAccounts.data ?? []} />}
        </div>
      </section>

      <Link href="/two-factor" className="group flex items-center gap-4 rounded-2xl border border-glass-border bg-base-raised px-5 py-5 transition-colors hover:bg-glass-hover sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><LockKeyhole className="h-5 w-5" /></span>
        <span className="flex-1"><span className="block text-sm font-semibold text-ink">Strengthen your account</span><span className="block text-sm text-ink-muted">Add another layer of protection with 2-step verification.</span></span>
        <ArrowRight className="h-4 w-4 text-ink-faint group-hover:text-ink" />
      </Link>
    </div>
  );
}
