"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Plus, RefreshCw, Shield, ShieldCheck, UserMinus } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/lib/hooks/useToast";

const permissionLabels: Record<string, string> = {
  user_management: "User management",
  admin_management: "Admin management",
  organisation_review: "Organisation review",
  beta_management: "Beta programme",
  system_diagnostics: "System diagnostics",
  broadcast_management: "Broadcast centre",
  security_management: "Security management",
};
type Admin = { userId: string; username: string; fullName?: string | null; email: string; role: string; permissions: string[]; fullAccess: boolean; isActive: boolean; createdAt: string };
type ResponseData = { administrators: Admin[]; availablePermissions: string[]; currentAccess: { fullAccess: boolean; permissions: string[] } };

export default function AdminManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<ResponseData | null>(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("SUPPORT_ADMIN");
  const [permissions, setPermissions] = useState<string[]>(["user_management"]);
  const [fullAccess, setFullAccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await apiClient.get<ResponseData>("/admin/administrators")); }
    catch (e) { showToast({ title: "Unable to load administrators", description: e instanceof Error ? e.message : "Try again.", variant: "error" }); }
    finally { setLoading(false); }
  }, [showToast]);
  useEffect(() => { if (!isLoading && !user?.isAdmin) router.replace("/dashboard"); }, [isLoading, user, router]);
  useEffect(() => { if (user?.isAdmin) void load(); }, [user?.isAdmin, load]);

  const togglePermission = (permission: string) => setPermissions(current => current.includes(permission) ? current.filter(p => p !== permission) : [...current, permission]);
  const grant = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiClient.post("/admin/administrators", { username: username.trim().replace(/^@/, ""), role, permissions: fullAccess ? [] : permissions, fullAccess });
      showToast({ title: "Administrator added", description: `@${username.trim()} now has the selected access.`, variant: "success" });
      setUsername(""); setPermissions(["user_management"]); setFullAccess(false); await load();
    } catch (e) { showToast({ title: "Could not add administrator", description: e instanceof Error ? e.message : "Try again.", variant: "error" }); }
    finally { setBusy(false); }
  };
  const revoke = async (admin: Admin) => {
    if (!window.confirm(`Revoke administrator access for @${admin.username}?`)) return;
    try { await apiClient.patch(`/admin/administrators/${admin.userId}`, { revoke: true }); showToast({ title: "Access revoked", description: `@${admin.username} is no longer an administrator.`, variant: "success" }); await load(); }
    catch (e) { showToast({ title: "Unable to revoke access", description: e instanceof Error ? e.message : "Try again.", variant: "error" }); }
  };

  if (isLoading || !user?.isAdmin) return <div className="flex min-h-[45vh] items-center justify-center text-sm text-ink-muted"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Checking administrator access…</div>;
  const canGrantFull = data?.currentAccess.fullAccess === true;
  return <div className="space-y-7 pb-12">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><button onClick={() => router.push("/admin")} className="mb-3 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" />Admin console</button><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600"><ShieldCheck className="h-6 w-6" /></span><div><p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Access control</p><h1 className="text-2xl font-semibold text-ink">Admin management</h1></div></div><p className="mt-3 max-w-2xl text-sm text-ink-muted">Grant existing MAX users carefully scoped administrative access. Permissions are enforced by the MAX Auth API.</p></div>
      <Button variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
    </div>
    <Card><CardContent className="space-y-5">
      <div><h2 className="font-semibold text-ink">Add administrator</h2><p className="mt-1 text-sm text-ink-muted">The person must already have an active MAX Account.</p></div>
      <form onSubmit={grant} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink">MAX username<input required minLength={3} maxLength={32} value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. maxoperator" className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-base px-3 text-sm outline-none focus:border-brand-500" /></label>
          <label className="text-sm font-medium text-ink">Role preset<select value={role} onChange={e => { setRole(e.target.value); setFullAccess(e.target.value === "SUPER_ADMIN"); if (e.target.value === "SUPPORT_ADMIN") setPermissions(["user_management"]); if (e.target.value === "OPERATIONS_ADMIN") setPermissions(["organisation_review","beta_management","system_diagnostics"]); if (e.target.value === "CUSTOM_ADMIN" || e.target.value === "SUPER_ADMIN") setPermissions([]); }} className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-base px-3 text-sm"><option value="SUPPORT_ADMIN">Support Admin</option><option value="OPERATIONS_ADMIN">Operations Admin</option><option value="CUSTOM_ADMIN">Custom Admin</option><option value="SUPER_ADMIN" disabled={!canGrantFull}>Super Admin</option></select></label>
        </div>
        <div><p className="mb-3 text-sm font-medium text-ink">Permissions</p><div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(permissionLabels).map(([key,label]) => <label key={key} className="flex items-start gap-3 rounded-xl border border-glass-border p-3 text-sm"><input type="checkbox" checked={permissions.includes(key)} onChange={() => togglePermission(key)} disabled={fullAccess} className="mt-0.5 accent-current" /><span><span className="font-medium text-ink">{label}</span><span className="mt-0.5 block text-xs text-ink-muted">{key === "user_management" ? "Search accounts and manage account status." : key === "admin_management" ? "Manage delegated administrator access." : key === "organisation_review" ? "Review business verification requests." : key === "beta_management" ? "Manage beta applications and reports." : key === "system_diagnostics" ? "View system health and diagnostic events." : key === "broadcast_management" ? "Send announcements to MAX users." : "Manage sensitive security and OAuth administration."}</span></span></label>)}
        </div></div>
        {canGrantFull && <label className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm"><input type="checkbox" checked={fullAccess} onChange={e => { setFullAccess(e.target.checked); if (e.target.checked) setRole("SUPER_ADMIN"); else if (role === "SUPER_ADMIN") setRole("CUSTOM_ADMIN"); }} /><span><span className="font-semibold text-ink">Grant full access</span><span className="block text-xs text-ink-muted">Unrestricted access to all current and future admin permissions. Only a full-access administrator can grant this.</span></span></label>}
        <div className="flex justify-end"><Button type="submit" disabled={busy || !username.trim() || (!fullAccess && permissions.length === 0)}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Add administrator</Button></div>
      </form>
    </CardContent></Card>
    <Card><div className="border-b border-glass-border px-5 py-4"><h2 className="font-semibold text-ink">Current administrators</h2><p className="mt-1 text-sm text-ink-muted">Review assigned roles and revoke access when it is no longer required.</p></div>
      {loading ? <div className="p-10 text-center text-sm text-ink-muted"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading administrators…</div> : <div className="divide-y divide-glass-border">{(data?.administrators || []).map(admin => <div key={admin.userId} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink">{admin.fullName || admin.username}</p><Badge variant={admin.fullAccess ? "info" : "neutral"}>{admin.fullAccess ? "Full access" : admin.role.replaceAll("_"," ")}</Badge></div><p className="mt-1 text-xs text-ink-muted">@{admin.username} · {admin.email}</p><p className="mt-2 text-xs text-ink-faint">{admin.fullAccess ? "All permissions" : admin.permissions.map(p => permissionLabels[p] || p).join(" · ") || "No permissions"}</p></div><Button size="sm" variant="danger" disabled={admin.username.toLowerCase() === "zionopaaje"} onClick={() => void revoke(admin)}><UserMinus className="h-4 w-4" />Revoke</Button></div>)}</div>}
    </Card>
    <p className="text-xs leading-5 text-ink-faint"><Shield className="mr-1 inline h-3.5 w-3.5" />The primary owner account is protected. Delegated administrators cannot grant permissions they do not hold or promote themselves to full access.</p>
  </div>;
}
