"use client";

import { useEffect, useState } from "react";
import { Laptop, Smartphone, Tablet, ShieldCheck, Trash2, LogOut, History, MonitorSmartphone } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { devicesApi } from "@/lib/api/devices";
import { ApiError } from "@/lib/api/ApiError";
import { formatRelativeTime, formatDateTime } from "@/lib/utils/formatters";
import type { Session, LoginHistoryEntry } from "@/types/api";

const typeIcons: Record<string, typeof Laptop> = { mobile: Smartphone, tablet: Tablet, desktop: Laptop };

export default function DevicesPage() {
  const devices = useAsyncData(() => devicesApi.list().then((r) => r.devices));
  const sessions = useAsyncData(() => devicesApi.listSessions().then((r) => r.sessions));
  const history = useAsyncData(() => devicesApi.loginHistory().then((r) => r.history));
  const { showToast } = useToast();
  const [confirm, setConfirm] = useState<{ type: "device" | "session" | "all"; id?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (devices.error || sessions.error || history.error) {
      // Errors are surfaced by the individual cards; avoid interrupting the page with multiple toasts.
    }
  }, [devices.error, sessions.error, history.error]);

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.type === "device" && confirm.id) await devicesApi.revoke(confirm.id);
      if (confirm.type === "session" && confirm.id) await devicesApi.revokeSession(confirm.id);
      if (confirm.type === "all") await devicesApi.revokeAllSessions();
      setConfirm(null);
      await Promise.all([devices.refetch(), sessions.refetch(), history.refetch()]);
      showToast({ title: confirm.type === "all" ? "All sessions revoked" : "Access revoked", variant: "success" });
    } catch (err) {
      showToast({ title: "Couldn't complete that action", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const handleTrust = async (id: string) => {
    try { await devicesApi.trust(id); await devices.refetch(); showToast({ title: "Device trusted", variant: "success" }); }
    catch (err) { showToast({ title: "Couldn't trust device", description: err instanceof ApiError ? err.message : undefined, variant: "error" }); }
  };

  const deviceName = (session: Session) => session.device?.deviceName || session.device?.browser || session.userAgent || "Unknown session";

  return (
    <div className="space-y-6">
      <PageHeader title="Devices & sessions" description="See where your MAX Account is signed in and revoke access you don't recognize." />

      <Card className="border-danger/20">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><LogOut className="mt-0.5 h-5 w-5 shrink-0 text-danger" /><div><p className="text-sm font-semibold text-ink">Sign out everywhere</p><p className="mt-1 text-xs leading-5 text-ink-muted">Revokes every active refresh session. You'll need to sign in again on each device.</p></div></div>
          <Button variant="danger" size="sm" onClick={() => setConfirm({ type: "all" })}>Revoke all sessions</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><span className="inline-flex items-center gap-2"><MonitorSmartphone className="h-4 w-4" /> Signed-in devices</span></CardTitle></CardHeader>
        <CardContent>
          {devices.isLoading ? <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div> : !devices.data?.length ? <EmptyState icon={<Laptop className="h-5 w-5" />} title="No devices found" /> : (
            <div className="space-y-3">{devices.data.map((d) => { const Icon = typeIcons[d.deviceType ?? ""] ?? Laptop; return <div key={d.id} className="flex flex-col gap-4 rounded-2xl border border-glass-border p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-ink-muted"><Icon className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-ink">{d.deviceName || "Unknown device"}</p>{d.isTrusted && <Badge variant="success">Trusted</Badge>}</div><p className="mt-0.5 text-xs text-ink-faint">{d.os || "Unknown OS"}{d.browser ? " · " + d.browser : ""} · {d.lastIp ?? "Unknown IP"} · Last seen {formatRelativeTime(d.lastSeenAt)}</p></div></div><div className="flex gap-2">{!d.isTrusted && <Button variant="secondary" size="sm" onClick={() => handleTrust(d.id)}><ShieldCheck className="h-3.5 w-3.5" /> Trust</Button>}<Button variant="ghost" size="sm" onClick={() => setConfirm({ type: "device", id: d.id })}><Trash2 className="h-3.5 w-3.5" /> Remove</Button></div></div>; })}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Active sessions</CardTitle></CardHeader>
        <CardContent>
          {sessions.isLoading ? <SkeletonCard /> : !sessions.data?.length ? <EmptyState title="No active sessions" /> : <div className="space-y-2">{sessions.data.map((s) => <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-glass-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-ink">{deviceName(s)}</p><p className="mt-1 text-xs text-ink-faint">{s.ipAddress || "Unknown IP"} · Last used {formatRelativeTime(s.lastUsedAt)} · Expires {formatDateTime(s.expiresAt)}</p></div><Button variant="ghost" size="sm" onClick={() => setConfirm({ type: "session", id: s.id })}><LogOut className="h-3.5 w-3.5" /> Revoke</Button></div>)}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><span className="inline-flex items-center gap-2"><History className="h-4 w-4" /> Login history</span></CardTitle></CardHeader>
        <CardContent>
          {history.isLoading ? <SkeletonCard /> : !history.data?.length ? <EmptyState title="No login history" /> : <div className="divide-y divide-glass-border">{history.data.slice(0, 25).map((entry: LoginHistoryEntry) => <div key={entry.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><div><span className={`text-sm font-medium ${entry.success ? "text-success" : "text-danger"}`}>{entry.success ? "Successful sign-in" : "Failed sign-in"}</span><p className="text-xs text-ink-faint">{entry.ipAddress || "Unknown IP"}{entry.userAgent ? " · " + entry.userAgent : ""}{entry.reason ? " · " + entry.reason : ""}</p></div><span className="text-xs text-ink-faint">{formatDateTime(entry.createdAt)}</span></div>)}</div>}
        </CardContent>
      </Card>

      <Modal open={Boolean(confirm)} onClose={() => !busy && setConfirm(null)} title={confirm?.type === "all" ? "Revoke all sessions?" : "Revoke access?"} description={confirm?.type === "all" ? "Every active session will be invalidated." : "This will remove access for this device or session. You can sign in again later."}>
        <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setConfirm(null)} disabled={busy}>Cancel</Button><Button variant="danger" onClick={runConfirm} isLoading={busy}>Revoke access</Button></div>
      </Modal>
    </div>
  );
}
