"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2, LogOut } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { devicesApi } from "@/lib/api/devices";
import { tokenStore } from "@/lib/api/tokenStore";
import { ApiError } from "@/lib/api/ApiError";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/formatters";

export default function SessionsPage() {
  const { data: sessions, isLoading, refetch } = useAsyncData(() =>
    devicesApi.listSessions().then((r) => r.sessions)
  );
  const { showToast } = useToast();
  const router = useRouter();
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const handleRevoke = async (id: string) => {
    try {
      await devicesApi.revokeSession(id);
      showToast({ title: "Session revoked", variant: "success" });
      refetch();
    } catch (err) {
      showToast({
        title: "Couldn't revoke session",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  const handleRevokeAll = async () => {
    setIsRevokingAll(true);
    try {
      await devicesApi.revokeAllSessions();
      // Revoking "all" includes this browser's own session server-side, so
      // clear the in-memory access token immediately rather than waiting for
      // it to naturally expire or for a failed silent-refresh to catch it.
      tokenStore.set(null);
      showToast({ title: "Signed out everywhere", variant: "success" });
      setConfirmAllOpen(false);
      router.push("/sign-in");
    } catch (err) {
      showToast({
        title: "Couldn't revoke sessions",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setIsRevokingAll(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Sessions"
        description="Everywhere you're currently signed in."
        action={
          <Button variant="secondary" onClick={() => setConfirmAllOpen(true)}>
            <LogOut className="h-4 w-4" /> Sign out everywhere
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={<KeyRound className="h-5 w-5" />} title="No active sessions" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {s.device?.deviceName || "Unknown device"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {s.ipAddress ?? "Unknown IP"} · Active {formatRelativeTime(s.lastUsedAt)} ·
                    Expires {formatDateTime(s.expiresAt)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRevoke(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" /> Revoke
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={confirmAllOpen}
        onClose={() => setConfirmAllOpen(false)}
        title="Sign out everywhere?"
        description="This immediately ends every active session, including this one."
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmAllOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRevokeAll} isLoading={isRevokingAll}>
            Sign out everywhere
          </Button>
        </div>
      </Modal>
    </div>
  );
}
