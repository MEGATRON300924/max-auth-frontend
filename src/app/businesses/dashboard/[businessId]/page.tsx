"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, RefreshCw, ShieldCheck, UserRound, UserMinus } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/ApiError";

type Member = {
  id: string;
  role: "OWNER" | "ADMINISTRATOR" | "MANAGER" | "MEMBER" | "VIEWER" | "DEVELOPER";
  isActive: boolean;
  createdAt: string;
  user: { id: string; username: string; fullName: string | null; displayName: string | null; avatarUrl: string | null };
};
type Invitation = { id: string; email: string; role: string; expiresAt: string; createdAt: string; inviter: { username: string; displayName: string | null; fullName: string | null } };
type AuditEvent = { id: string; action: string; metadata: Record<string, unknown> | null; createdAt: string; actor: { username: string; displayName: string | null; fullName: string | null } | null };
type Business = {
  businessId: string; handle: string; legalName: string; displayName: string;
  businessType: string; country: string; businessEmail: string; phone: string | null;
  website: string | null; description: string | null; status: string;
  verificationStatus: string; role: Member["role"]; memberCount: number;
};
const assignableRoles = [
  { value: "ADMINISTRATOR", label: "Administrator" },
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
  { value: "DEVELOPER", label: "Developer" },
] as const;

export default function BusinessWorkspacePage() {
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;
  const { isAuthenticated } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyUser, setBusyUser] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated || !businessId) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.get<{ business: Business }>(`/businesses/${encodeURIComponent(businessId)}`);
      setBusiness(result.business);
      if (result.business.role === "OWNER" || result.business.role === "ADMINISTRATOR") {
        const memberResult = await apiClient.get<{ members: Member[] }>(`/businesses/${encodeURIComponent(businessId)}/members`);
        setMembers(memberResult.members);
        const invitationResult = await apiClient.get<{ invitations: Invitation[] }>(`/businesses/${encodeURIComponent(businessId)}/invitations`);
        setInvitations(invitationResult.invitations);
        const auditResult = await apiClient.get<{ events: AuditEvent[] }>(`/businesses/${encodeURIComponent(businessId)}/audit-logs`);
        setAuditEvents(auditResult.events);
      } else {
        setMembers([]);
        setInvitations([]);
        setAuditEvents([]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load this business workspace.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, businessId]);

  useEffect(() => { void load(); }, [load]);

  async function changeRole(member: Member, role: string) {
    setBusyUser(member.user.id); setError(""); setNotice("");
    try {
      await apiClient.patch(`/businesses/${encodeURIComponent(businessId)}/members/${encodeURIComponent(member.user.id)}`, { role });
      setNotice(`Updated ${member.user.displayName || member.user.fullName || member.user.username}'s role.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't update this member's role.");
    } finally { setBusyUser(""); }
  }

  async function removeMember(member: Member) {
    const name = member.user.displayName || member.user.fullName || member.user.username;
    if (!window.confirm(`Remove ${name} from this business? They will lose access to the business workspace.`)) return;
    setBusyUser(member.user.id); setError(""); setNotice("");
    try {
      await apiClient.delete(`/businesses/${encodeURIComponent(businessId)}/members/${encodeURIComponent(member.user.id)}`);
      setNotice(`${name} no longer has access to this business.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't remove this member.");
    } finally { setBusyUser(""); }
  }


  async function sendInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteBusy(true); setError(""); setNotice("");
    try {
      const result = await apiClient.post<{ invitation: { email: string; role: string }; delivery: string }>(`/businesses/${encodeURIComponent(businessId)}/invitations`, { email: inviteEmail.trim(), role: inviteRole });
      setNotice(`Invitation email sent to ${result.invitation.email}.`);
      setInviteEmail("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't send this invitation.");
    } finally { setInviteBusy(false); }
  }

  async function revokeInvitation(invitation: Invitation) {
    if (!window.confirm(`Revoke the pending invitation for ${invitation.email}?`)) return;
    setBusyUser(invitation.id); setError(""); setNotice("");
    try {
      await apiClient.delete(`/businesses/${encodeURIComponent(businessId)}/invitations/${encodeURIComponent(invitation.id)}`);
      setNotice(`Invitation for ${invitation.email} revoked.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't revoke this invitation.");
    } finally { setBusyUser(""); }
  }

  const canManage = business?.role === "OWNER" || business?.role === "ADMINISTRATOR";

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link href="/businesses/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> All business accounts</Link>
        {loading ? (
          <div className="mt-8 rounded-2xl border border-glass-border bg-base-raised p-10 text-center text-sm text-ink-muted">Loading business workspace…</div>
        ) : error && !business ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-6"><h1 className="font-bold">Business workspace unavailable</h1><p className="mt-2 text-sm text-ink-muted">{error}</p><div className="mt-4"><Button variant="secondary" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Try again</Button></div></div>
        ) : business ? (
          <>
            <section className="mt-6 rounded-3xl border border-glass-border bg-base-raised p-6 sm:p-9">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-glass-border bg-base text-brand-600 dark:text-brand-400"><Building2 className="h-7 w-7" /></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand-600 dark:text-brand-400">Business workspace</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{business.displayName}</h1><p className="mt-1 text-sm text-ink-muted">@{business.handle} · {business.country}</p><p className="mt-3 break-all font-mono text-xs text-ink-faint">{business.businessId}</p></div></div>
                <div className="flex flex-wrap gap-2"><span className="rounded-full border border-glass-border px-3 py-1.5 text-xs font-semibold">{business.role.toLowerCase()}</span><span className="rounded-full border border-glass-border px-3 py-1.5 text-xs font-semibold">{business.verificationStatus.toLowerCase()}</span></div>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-base p-4"><p className="text-xs text-ink-faint">Legal name</p><p className="mt-1 break-words text-sm font-semibold">{business.legalName}</p></div>
                <div className="rounded-xl bg-base p-4"><p className="text-xs text-ink-faint">Business email</p><p className="mt-1 break-all text-sm font-semibold">{business.businessEmail}</p></div>
                <div className="rounded-xl bg-base p-4"><p className="text-xs text-ink-faint">Team members</p><p className="mt-1 text-sm font-semibold">{business.memberCount}</p></div>
              </div>
              {business.description && <p className="mt-5 max-w-3xl text-sm leading-6 text-ink-muted">{business.description}</p>}
            </section>

            {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-ink">{error}</div>}
            {notice && <div role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-ink">{notice}</div>}

            <section className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-2xl font-bold">People and access</h2><p className="mt-2 text-sm text-ink-muted">Review members and manage their access to this business.</p></div><Button variant="secondary" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
              {!canManage ? (
                <div className="mt-5 rounded-2xl border border-glass-border bg-base-raised p-6"><ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-400" /><p className="mt-3 text-sm leading-6 text-ink-muted">Your role does not have permission to view the full member directory. Ask a business owner or administrator for access.</p></div>
              ) : members.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-glass-border bg-base-raised p-8 text-center"><UserRound className="mx-auto h-8 w-8 text-ink-faint" /><p className="mt-3 font-semibold">No active members found</p><p className="mt-1 text-sm text-ink-muted">The owner should appear here after the business has been created.</p></div>
              ) : (
                <div className="mt-5 overflow-hidden rounded-2xl border border-glass-border bg-base-raised">
                  <div className="divide-y divide-glass-border">
                    {members.map((member) => {
                      const name = member.user.displayName || member.user.fullName || member.user.username;
                      const canEditTarget = business.role === "OWNER" ? member.role !== "OWNER" : member.role !== "OWNER" && member.role !== "ADMINISTRATOR";
                      return (
                        <article key={member.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                          <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base text-ink-muted"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-ink-muted">@{member.user.username} · joined {new Date(member.createdAt).toLocaleDateString()}</p></div></div>
                          <div className="flex flex-wrap items-center gap-2">
                            {member.role === "OWNER" ? <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-xs font-semibold">Owner</span> : canEditTarget ? (
                              <>
                                <label className="sr-only" htmlFor={`role-${member.id}`}>Role for {name}</label>
                                <select id={`role-${member.id}`} value={member.role} disabled={busyUser === member.user.id} onChange={(event) => void changeRole(member, event.target.value)} className="rounded-full border border-glass-border bg-base px-3 py-2 text-xs font-semibold">
                                  {assignableRoles.filter((role) => business.role === "OWNER" || role.value !== "ADMINISTRATOR").map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                </select>
                                <Button variant="danger" size="sm" disabled={busyUser === member.user.id} onClick={() => void removeMember(member)}><UserMinus className="h-3.5 w-3.5" /> Remove</Button>
                              </>
                            ) : <span className="rounded-full border border-glass-border px-3 py-2 text-xs font-semibold">{member.role.toLowerCase()}</span>}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs leading-5 text-ink-faint">The API protects owner accounts and checks permissions on every request. Invitation links expire after seven days, are single-use, and require the invited email to be verified in MAX Auth.</p>
            </section>


            {canManage && (
              <section className="mt-8">
                <div><h2 className="font-display text-2xl font-bold">Business activity</h2><p className="mt-2 text-sm text-ink-muted">A recent audit trail of business profile, member, and invitation changes.</p></div>
                {auditEvents.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-glass-border bg-base-raised p-6 text-sm text-ink-muted">No audit events have been recorded yet.</div>
                ) : (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-glass-border bg-base-raised divide-y divide-glass-border">
                    {auditEvents.map((event) => {
                      const actorName = event.actor?.displayName || event.actor?.fullName || event.actor?.username || "System";
                      const metadata = event.metadata ? Object.entries(event.metadata).map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`).join(" · ") : "";
                      return <article key={event.id} className="p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold">{event.action.toLowerCase().replaceAll("_", " ")}</p><time className="text-xs text-ink-faint">{new Date(event.createdAt).toLocaleString()}</time></div><p className="mt-1 text-xs text-ink-muted">By {actorName}</p>{metadata && <p className="mt-2 break-words text-xs leading-5 text-ink-faint">{metadata}</p>}</article>;
                    })}
                  </div>
                )}
              </section>
            )}
            {canManage && (
              <section className="mt-8">
                <div><h2 className="font-display text-2xl font-bold">Invite people</h2><p className="mt-2 text-sm text-ink-muted">Send a one-time invitation link to someone who should join this business.</p></div>
                <form onSubmit={sendInvitation} className="mt-5 grid gap-3 rounded-2xl border border-glass-border bg-base-raised p-5 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
                  <label className="block text-sm font-semibold">Email address<input required type="email" maxLength={255} value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal outline-none focus:border-brand-500" placeholder="teammate@example.com" /></label>
                  <label className="block text-sm font-semibold">Role<select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal"><option value="MEMBER">Member</option><option value="MANAGER">Manager</option><option value="VIEWER">Viewer</option><option value="DEVELOPER">Developer</option>{business.role === "OWNER" && <option value="ADMINISTRATOR">Administrator</option>}</select></label>
                  <Button type="submit" disabled={inviteBusy}>{inviteBusy ? "Sending…" : "Send invitation"}</Button>
                  <p className="text-xs leading-5 text-ink-faint sm:col-span-3">The invitee must sign in to MAX using this email address and verify it before accepting. Invitation emails require the MAX Auth email provider to be configured.</p>
                </form>
                <div className="mt-5">
                  <h3 className="text-sm font-bold">Pending invitations <span className="ml-1 font-normal text-ink-faint">({invitations.length})</span></h3>
                  {invitations.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-glass-border p-5 text-sm text-ink-muted">No pending invitations.</p> : (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-glass-border bg-base-raised divide-y divide-glass-border">
                      {invitations.map((invitation) => <div key={invitation.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{invitation.email}</p><p className="mt-1 text-xs text-ink-muted">{invitation.role.toLowerCase()} · expires {new Date(invitation.expiresAt).toLocaleDateString()}</p></div><Button variant="secondary" size="sm" disabled={busyUser === invitation.id} onClick={() => void revokeInvitation(invitation)}>{busyUser === invitation.id ? "Revoking…" : "Revoke invitation"}</Button></div>)}
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
