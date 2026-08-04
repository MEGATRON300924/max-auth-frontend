"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Fingerprint, KeyRound, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { useAuth } from "@/lib/auth/useAuth";
import { authApi } from "@/lib/api/auth";
import { securityApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";
import { getPasswordStrength } from "@/lib/utils/validators";
import { formatDateTime } from "@/lib/utils/formatters";

function humanizeAction(action: string): string {
  return action.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export default function SecurityPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { data: logs, isLoading: logsLoading } = useAsyncData(() =>
    securityApi.auditLogs().then((r) => r.logs)
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!getPasswordStrength(newPassword).meetsMinimum) {
      setError("New password must be at least 8 characters, with a letter and a number.");
      return;
    }
    setIsChanging(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      showToast({ title: "Password changed", variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setIsChanging(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authApi.deleteAccount(deletePassword);
      showToast({ title: "Account deleted", variant: "success" });
      await logout();
      router.push("/");
    } catch (err) {
      showToast({
        title: "Couldn't delete account",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Security" description="Manage your password, protections, and account activity." />

      {user && user.verificationStatus !== "VERIFIED" && (
        <Alert variant="warning" title="Your email isn't verified yet">
          Verify your email from your inbox to fully secure your account.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <Input
                label="Current password"
                type="password"
                icon={<Lock className="h-4 w-4" />}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <div>
                <Input
                  label="New password"
                  type="password"
                  icon={<Lock className="h-4 w-4" />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>
              <Button type="submit" isLoading={isChanging} className="w-full">
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-glass-border p-4">
              <div className="flex items-center gap-3">
                <KeyRound className="h-4.5 w-4.5 text-ink-faint" />
                <div>
                  <p className="text-sm font-medium text-ink">Two-factor authentication</p>
                  <p className="text-xs text-ink-faint">Add a second step at sign-in</p>
                </div>
              </div>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-glass-border p-4">
              <div className="flex items-center gap-3">
                <Fingerprint className="h-4.5 w-4.5 text-ink-faint" />
                <div>
                  <p className="text-sm font-medium text-ink">Passkeys</p>
                  <p className="text-xs text-ink-faint">Sign in without a password</p>
                </div>
              </div>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-glass-border p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4.5 w-4.5 text-ink-faint" />
                <div>
                  <p className="text-sm font-medium text-ink">Recovery codes</p>
                  <p className="text-xs text-ink-faint">Backup access to your account</p>
                </div>
              </div>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <SkeletonCard />
          ) : !logs || logs.length === 0 ? (
            <EmptyState title="No security events recorded yet" />
          ) : (
            <ul className="divide-y divide-glass-border">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between py-3">
                  <span className="text-sm text-ink">{humanizeAction(log.action)}</span>
                  <span className="text-xs text-ink-faint">{formatDateTime(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle>
            <span className="text-danger">Danger zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-ink">Delete account</p>
              <p className="text-xs text-ink-faint">
                Permanently deletes your MAX Account and signs you out of every product.
              </p>
            </div>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your MAX Account?"
        description="This can't be undone. Enter your password to confirm."
      >
        <div className="space-y-4">
          <Input
            label="Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} isLoading={isDeleting}>
              Delete permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
