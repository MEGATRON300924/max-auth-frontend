"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Clock3, LoaderCircle, RefreshCw, Search, XCircle, Mail, MapPin, Globe2 } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/useToast";

type ReviewStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
type Organisation = {
  id: string; businessId: string; handle: string; legalName: string; displayName: string; address?: string | null;
  email: string; phone: string; country: string; businessType: string; websiteUrl?: string | null;
  registrationNumber?: string | null; description?: string | null; verificationStatus: ReviewStatus;
  emailVerifiedAt?: string | null; createdAt: string; owner: { id: string; username: string; fullName?: string | null; displayName?: string | null; email: string };
};
type Result = { organisations: Organisation[]; counts: Record<ReviewStatus, number>; pagination: { page: number; limit: number; total: number; pages: number } };
const filters = [
  { value: "ALL", label: "All organisations" },
  { value: "PENDING", label: "Awaiting review" },
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "VERIFIED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const;

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function statusTone(status: ReviewStatus): "success" | "warning" | "danger" | "neutral" {
  if (status === "VERIFIED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "PENDING") return "warning";
  return "neutral";
}
function statusLabel(status: ReviewStatus) {
  return ({ UNVERIFIED: "Unverified", PENDING: "Awaiting review", VERIFIED: "Approved", REJECTED: "Rejected" })[status];
}

export default function AdminOrganisationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof filters)[number]["value"]>("PENDING");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) router.replace("/dashboard");
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    if (!user?.isAdmin) return;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      const result = await apiClient.get<Result>(`/admin/organisations?${params.toString()}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load organisations for review.");
    } finally { setLoading(false); }
  }, [user?.isAdmin, page, search, status]);

  useEffect(() => { void loadData(); }, [loadData]);

  const review = async (organisation: Organisation, nextStatus: "PENDING" | "VERIFIED" | "REJECTED") => {
    const actionLabel = nextStatus === "VERIFIED" ? "approve" : nextStatus === "REJECTED" ? "reject" : "request more information for";
    const reason = nextStatus === "VERIFIED" ? "" : window.prompt(
      nextStatus === "REJECTED" ? "Add a reason for rejecting this organisation (required):" : "What additional information should the organisation provide?",
      ""
    );
    if (nextStatus !== "VERIFIED" && reason === null) return;
    if (nextStatus === "REJECTED" && !(reason || "").trim()) {
      showToast({ title: "A reason is required", description: "Add a short explanation before rejecting an organisation.", variant: "error" });
      return;
    }
    if (!window.confirm(`Are you sure you want to ${actionLabel} “${organisation.displayName}”?`)) return;
    setBusyId(organisation.id);
    try {
      const result = await apiClient.patch<{ organisation: Organisation; emailSent: boolean }>(
        `/admin/organisations/${encodeURIComponent(organisation.id)}/review`,
        { status: nextStatus, ...(reason?.trim() ? { reason: reason.trim() } : {}) }
      );
      showToast({
        title: nextStatus === "VERIFIED" ? "Organisation approved" : nextStatus === "REJECTED" ? "Organisation rejected" : "Review update sent",
        description: result.emailSent ? "The organisation was updated and an email notification was sent." : "The review status was updated, but the notification email could not be sent.",
        variant: result.emailSent ? "success" : "error",
      });
      await loadData();
    } catch (err) {
      showToast({ title: "Review action failed", description: err instanceof Error ? err.message : "Please try again.", variant: "error" });
    } finally { setBusyId(null); }
  };

  if (authLoading || !user?.isAdmin) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Checking administrator access…</div>;
  }

  const counts = data?.counts;
  return (
    <div className="space-y-7 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <button onClick={() => router.push("/admin")} className="mb-4 inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to admin console</button>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300"><Building2 className="h-6 w-6" /></span>
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">Restricted area</p><h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Organisation review</h1></div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">Review organisation registrations submitted to MAX Auth. Only authorised MAX Auth administrators can access this page or make review decisions.</p>
        </div>
        <Button variant="secondary" onClick={() => void loadData()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-danger/20 bg-danger-subtle p-4 text-sm text-danger"><p className="font-semibold">Couldn’t load organisations</p><p className="mt-1">{error}</p></div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Awaiting review", value: counts?.PENDING ?? 0, icon: Clock3 },
          { label: "Unverified", value: counts?.UNVERIFIED ?? 0, icon: Mail },
          { label: "Approved", value: counts?.VERIFIED ?? 0, icon: CheckCircle2 },
          { label: "Rejected", value: counts?.REJECTED ?? 0, icon: XCircle },
        ].map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-raised text-ink-muted"><Icon className="h-5 w-5" /></span><div><p className="text-sm text-ink-muted">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p></div></CardContent></Card>)}
      </div>

      <Card><CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 gap-2">
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { setPage(1); setSearch(searchInput.trim()); } }} placeholder="Search name, email, handle or MAX Business ID" className="h-11 min-w-0 flex-1 rounded-full border border-glass-border bg-base px-4 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            <Button onClick={() => { setPage(1); setSearch(searchInput.trim()); }}><Search className="h-4 w-4" /> Search</Button>
          </div>
          <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value as (typeof filters)[number]["value"]); }} className="h-11 rounded-full border border-glass-border bg-base px-4 text-sm text-ink outline-none focus:border-brand-500">{filters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select>
        </div>
        <div className="flex items-center justify-between text-sm text-ink-muted"><span>{data?.pagination.total ?? 0} organisation(s)</span><span>Review decisions notify the organisation by email.</span></div>
      </CardContent></Card>

      {loading && !data ? <div className="flex justify-center py-16 text-sm text-ink-muted"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading organisations…</div> : null}
      {!loading && data?.organisations.length === 0 && <Card><CardContent className="py-12 text-center"><Building2 className="mx-auto h-8 w-8 text-ink-faint" /><h2 className="mt-3 font-semibold text-ink">No organisations found</h2><p className="mt-1 text-sm text-ink-muted">Try a different status or search term.</p></CardContent></Card>}

      <div className="space-y-4">
        {data?.organisations.map((org) => <Card key={org.id}><CardContent className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-ink">{org.displayName}</h2><Badge variant={statusTone(org.verificationStatus)}>{statusLabel(org.verificationStatus)}</Badge></div>
              <p className="mt-1 text-sm text-ink-muted">{org.legalName}</p>
              <p className="mt-2 break-all text-xs text-ink-faint">{org.businessId} · @{org.handle}</p>
            </div>
            <p className="shrink-0 text-xs text-ink-muted">Submitted {dateLabel(org.createdAt)}</p>
          </div>
          {org.description && <p className="text-sm leading-6 text-ink-muted">{org.description}</p>}
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" /><span>{org.address || "No address provided"}<span className="block text-xs text-ink-faint">{org.country} · {org.businessType}</span></span></div>
            <div className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" /><span className="break-all">{org.email}<span className="block text-xs text-ink-faint">{org.emailVerifiedAt ? "Business email verified" : "Business email not verified"}</span></span></div>
            <div><span className="text-ink-muted">Phone</span><p>{org.phone}</p></div>
            <div><span className="text-ink-muted">Registration number</span><p>{org.registrationNumber || "Not supplied"}</p></div>
            <div><span className="text-ink-muted">Account owner</span><p>@{org.owner.username} · {org.owner.email}</p></div>
            <div>{org.websiteUrl ? <a href={org.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-brand-600 hover:underline"><Globe2 className="h-4 w-4" /> Visit organisation website</a> : <span className="text-ink-muted">No website supplied</span>}</div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-glass-border pt-4">
            <Button size="sm" onClick={() => void review(org, "VERIFIED")} disabled={busyId === org.id} isLoading={busyId === org.id}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
            <Button size="sm" variant="secondary" onClick={() => void review(org, "PENDING")} disabled={busyId === org.id}><Mail className="h-4 w-4" /> Request information</Button>
            <Button size="sm" variant="danger" onClick={() => void review(org, "REJECTED")} disabled={busyId === org.id}><XCircle className="h-4 w-4" /> Reject</Button>
          </div>
        </CardContent></Card>)}
      </div>
      {data && data.pagination.pages > 1 && <div className="flex items-center justify-between"><p className="text-sm text-ink-muted">Page {data.pagination.page} of {data.pagination.pages}</p><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button variant="secondary" size="sm" disabled={page >= data.pagination.pages || loading} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>}
    </div>
  );
}
