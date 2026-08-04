"use client";

import { Link2, Github, Music2, MessageCircle, Shield } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { connectedAccountsApi, oauthApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";
import { formatDate } from "@/lib/utils/formatters";
import type { ConnectedProvider } from "@/types/api";

const providerIcons: Partial<Record<ConnectedProvider, typeof Github>> = {
  GITHUB: Github,
  SPOTIFY: Music2,
  DISCORD: MessageCircle,
};

export default function ConnectedAppsPage() {
  const { showToast } = useToast();
  const accounts = useAsyncData(() => connectedAccountsApi.list().then((r) => r.accounts));
  const consents = useAsyncData(() => oauthApi.listConsents().then((r) => r.consents));

  const handleUnlink = async (id: string) => {
    try {
      await connectedAccountsApi.unlink(id);
      showToast({ title: "Account unlinked", variant: "success" });
      accounts.refetch();
    } catch (err) {
      showToast({
        title: "Couldn't unlink account",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  const handleRevokeConsent = async (id: string) => {
    try {
      await oauthApi.revokeConsent(id);
      showToast({ title: "Access revoked", variant: "success" });
      consents.refetch();
    } catch (err) {
      showToast({
        title: "Couldn't revoke access",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connected Apps"
        description="Third-party accounts linked to MAX, and apps you've granted access via Continue with MAX AI."
      />

      <Card>
        <CardHeader>
          <CardTitle>Linked accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.isLoading ? (
            <SkeletonCard />
          ) : !accounts.data || accounts.data.length === 0 ? (
            <EmptyState
              icon={<Link2 className="h-5 w-5" />}
              title="No linked accounts"
              description="Google, X, Instagram, Snapchat, Spotify, Discord, and GitHub linking is coming soon."
            />
          ) : (
            <ul className="divide-y divide-glass-border">
              {accounts.data.map((a) => {
                const Icon = providerIcons[a.provider] ?? Shield;
                return (
                  <li key={a.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4.5 w-4.5 text-ink-muted" />
                      <div>
                        <p className="text-sm font-medium text-ink capitalize">
                          {a.provider.toLowerCase()}
                        </p>
                        <p className="text-xs text-ink-faint">Linked {formatDate(a.linkedAt)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleUnlink(a.id)}>
                      Unlink
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apps using &ldquo;Continue with MAX AI&rdquo;</CardTitle>
        </CardHeader>
        <CardContent>
          {consents.isLoading ? (
            <SkeletonCard />
          ) : !consents.data || consents.data.length === 0 ? (
            <EmptyState
              title="No third-party apps connected"
              description="When developers integrate Continue with MAX AI, apps you authorize will appear here."
            />
          ) : (
            <ul className="divide-y divide-glass-border">
              {consents.data.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{c.client.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {c.scopes.map((scope) => (
                        <Badge key={scope} variant="neutral">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRevokeConsent(c.id)}>
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
