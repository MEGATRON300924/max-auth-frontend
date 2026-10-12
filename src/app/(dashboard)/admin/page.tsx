"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight,
  LoaderCircle, Search, ShieldCheck, Users, UserRound, UserX, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import type { MaxUser } from "@/types/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/useToast";

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  activeSessions: number;
}

interface UserPage {
  users: MaxUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function statusVariant(status: MaxUser["status"]): "success" | "warning" | "danger" | "neutral" {
  if (status === "ACTIVE") return "success";
  if (status === "SUSPENDED" || status === "DEACTIVATED") return "warning";
  if (status === "BANNED" || status === "DELETED") return "danger";
  return "neutral";
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<MaxUser[]>([]);
  const [pageInfo, setPageInfo] = useState<UserPage["pagination"]>({ page: 1, limit: 25, total: 0, pages: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) router.replace("/dashboard");
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    if (!user?.isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [statsResult, usersResult] = await Promise.all([
        apiClient.get<AdminStats>("/admin/stats"),
        apiClient.get<UserPage>(`/admin/users?page=${page}&limit=25&search=${encodeURIComponent(search)}`),
      ]);
      setStats(statsResult);
      setUsers(usersResult.users);
      setPageInfo(usersResult.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load admin data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.isAdmin, page, search]);

  useEffect(() => { void loadData(); }, [loadData]);

  const runAccountAction = async (target: MaxUser) => {
    const suspend = target.status === "ACTIVE";
    const action = suspend ? "suspend" : "reactivate";
    const confirmed = window.confirm(
      suspend
        ? `Suspend @${target.username}? They will no longer be able to use their account normally.`
        : `Reactivate @${target.username}?`
    );
    if (!confirmed) return;
    setBusyUserId(target.id);
    try {
      await apiClient.post(`/admin/users/${encodeURIComponent(target.id)}/${action}`);
      showToast({
        title: suspend ? "Account suspended" : "Account reactivated",
        description: `@${target.username} has been updated.`,
        variant: "success",
      });
      await loadData();
    } catch (err) {
      showToast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  if (authLoading || !user?.isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Checking administrator access…
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <button onClick={() => router.push("/dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to MAX Account
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">Restricted area</p>
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">MAX Auth Admin</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">Review registered accounts, monitor platform activity, and manage account status. Access is restricted to authorized administrators.</p>
        </div>
        <Button variant="secondary" onClick={() => void loadData()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger-subtle p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-semibold">Couldn’t load administrator data</p><p className="mt-1">{error}</p><p className="mt-1 text-xs">The backend must recognize this account as an administrator. If this continues after deployment, check the backend migration and your current session.</p></div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300"><Users className="h-5 w-5" /></span>
          <div><p className="text-sm text-ink-muted">Registered users</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{stats?.totalUsers ?? "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" /></span>
          <div><p className="text-sm text-ink-muted">Verified accounts</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{stats?.verifiedUsers ?? "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300"><UserRound className="h-5 w-5" /></span>
          <div><p className="text-sm text-ink-muted">Active sessions</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{stats?.activeSessions ?? "—"}</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 border-b border-glass-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold text-ink">User directory</h2><p className="mt-1 text-sm text-ink-muted">Search by username or email. Passwords and authentication secrets are never displayed.</p></div>
          <form className="flex w-full gap-2 sm:max-w-md" onSubmit={(event) => { event.preventDefault(); applySearch(); }}>
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search users…" aria-label="Search users by username or email" className="h-10 w-full rounded-full border border-glass-border bg-base px-10 pr-4 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15" />
            </label>
            <Button type="submit" size="sm">Search</Button>
          </form>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-ink-muted"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading accounts…</div>
        ) : users.length === 0 ? (
          <div className="px-5 py-16 text-center"><UserX className="mx-auto h-8 w-8 text-ink-faint" /><p className="mt-3 text-sm font-semibold text-ink">No users found</p><p className="mt-1 text-sm text-ink-muted">Try another username or email.</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-base/70 text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Account</th>
                    <th className="px-5 py-3 font-medium">Verification</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {users.map((account) => {
                    const isSelf = account.id === user.id;
                    const isSuspended = account.status !== "ACTIVE";
                    return (
                      <tr key={account.id} className="transition-colors hover:bg-glass-hover/60">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-ink">{account.fullName || account.displayName || account.username}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">@{account.username}</p>
                          <p className="mt-0.5 text-xs text-ink-faint">{account.email}</p>
                          {account.isAdmin && <span className="mt-2 inline-flex"><Badge variant="info"><ShieldCheck className="h-3 w-3" /> Admin</Badge></span>}
                        </td>
                        <td className="px-5 py-4"><Badge variant={account.verificationStatus === "VERIFIED" ? "success" : "warning"}>{account.verificationStatus === "VERIFIED" ? "Verified" : account.verificationStatus === "PENDING" ? "Pending" : "Unverified"}</Badge></td>
                        <td className="px-5 py-4"><span className="font-medium text-ink">{account.subscriptionTier}</span></td>
                        <td className="px-5 py-4"><Badge variant={statusVariant(account.status)}>{account.status.toLowerCase().replaceAll("_", " ")}</Badge></td>
                        <td className="px-5 py-4 whitespace-nowrap text-ink-muted">{formatDate(account.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Button size="sm" variant={isSuspended ? "secondary" : "danger"} disabled={isSelf || busyUserId === account.id} onClick={() => void runAccountAction(account)}>
                            {busyUserId === account.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : isSuspended ? <CheckCircle2 className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                            {isSelf ? "Your account" : isSuspended ? "Reactivate" : "Suspend"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-glass-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-muted">Showing {pageInfo.total === 0 ? 0 : (pageInfo.page - 1) * pageInfo.limit + 1}–{Math.min(pageInfo.page * pageInfo.limit, pageInfo.total)} of {pageInfo.total} accounts</p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft className="h-4 w-4" /> Previous</Button>
                <span className="min-w-20 text-center text-xs text-ink-muted">Page {pageInfo.page} of {Math.max(1, pageInfo.pages)}</span>
                <Button variant="secondary" size="sm" disabled={pageInfo.pages === 0 || page >= pageInfo.pages || loading} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        )}
      </Card>
      <p className="text-xs leading-5 text-ink-faint">Administrator actions are authorized by the MAX Auth backend. This page does not expose password hashes, session tokens, or connected-provider credentials.</p>
    </div>
  );
}
