"use client";

import { useState } from "react";
import { MailCheck, Crown, Code2, Plus, Copy, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/useAuth";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { authApi } from "@/lib/api/auth";
import { oauthApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const clients = useAsyncData(() => oauthApi.listClients().then((r) => r.clients));

  const [isResending, setIsResending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newRedirectUri, setNewRedirectUri] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  if (!user) return null;

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await authApi.sendVerificationEmail();
      showToast({ title: "Verification email sent", variant: "success" });
    } catch (err) {
      showToast({
        title: "Couldn't send email",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName || !newRedirectUri) return;
    setIsCreating(true);
    try {
      const { clientSecret } = await oauthApi.createClient({
        name: newClientName,
        redirectUris: [newRedirectUri],
        scopes: ["profile:read", "email:read"],
      });
      setCreatedSecret(clientSecret);
      clients.refetch();
    } catch (err) {
      showToast({
        title: "Couldn't create OAuth client",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    setNewClientName("");
    setNewRedirectUri("");
    setCreatedSecret(null);
  };

  const handleRevokeClient = async (clientId: string) => {
    try {
      await oauthApi.revokeClient(clientId);
      showToast({ title: "OAuth client revoked", variant: "success" });
      clients.refetch();
    } catch (err) {
      showToast({
        title: "Couldn't revoke client",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Account Settings" description="Verification, plan, and developer access." />

      {user.verificationStatus !== "VERIFIED" && (
        <Card>
          <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <MailCheck className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-ink">Verify your email</p>
                <p className="text-xs text-ink-faint">{user.email}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" isLoading={isResending} onClick={handleResendVerification}>
              Resend verification email
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-brand-400" />
            <div>
              <p className="text-sm font-medium text-ink capitalize">
                {user.subscriptionTier.toLowerCase()} plan
              </p>
              <p className="text-xs text-ink-faint">Applies across every MAX product</p>
            </div>
          </div>
          <Badge variant="neutral">Manage — coming soon</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Developer portal</CardTitle>
          <Button size="sm" variant="secondary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New OAuth client
          </Button>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-xs text-ink-faint">
            Register an OAuth client to let your own app offer &ldquo;Continue with MAX
            AI.&rdquo; The interactive authorize/consent flow is still being built — client
            registration is live today.
          </p>
          {clients.isLoading ? (
            <SkeletonCard />
          ) : !clients.data || clients.data.length === 0 ? (
            <EmptyState icon={<Code2 className="h-5 w-5" />} title="No OAuth clients yet" />
          ) : (
            <ul className="divide-y divide-glass-border">
              {clients.data.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="font-mono text-xs text-ink-faint">{c.clientId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.isActive ? "success" : "neutral"}>
                      {c.isActive ? "Active" : "Revoked"}
                    </Badge>
                    {c.isActive && (
                      <Button variant="ghost" size="sm" onClick={() => handleRevokeClient(c.clientId)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        onClose={closeCreateModal}
        title={createdSecret ? "Save your client secret" : "New OAuth client"}
        description={
          createdSecret
            ? "This is shown once — store it securely now."
            : "Register an app to use Continue with MAX AI."
        }
      >
        {createdSecret ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-glass-border bg-white/[0.02] p-3">
              <code className="truncate font-mono text-xs text-ink">{createdSecret}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdSecret);
                  showToast({ title: "Copied to clipboard", variant: "success" });
                }}
                aria-label="Copy client secret"
                className="shrink-0 text-ink-faint hover:text-ink"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <Button className="w-full" onClick={closeCreateModal}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="App name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
            <Input
              label="Redirect URI"
              placeholder="https://yourapp.com/callback"
              value={newRedirectUri}
              onChange={(e) => setNewRedirectUri(e.target.value)}
            />
            <Button className="w-full" onClick={handleCreateClient} isLoading={isCreating}>
              Create client
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
