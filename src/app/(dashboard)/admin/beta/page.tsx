"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, ClipboardCopy, LoaderCircle, Megaphone, RefreshCw, ShieldCheck, Users, X, Bug } from "lucide-react";

type Applicant = { id: string; fullName: string; devices: string[]; products: string[]; status: "PENDING" | "APPROVED" | "REJECTED"; reviewNote?: string | null; createdAt: string; user: { id: string; username: string; email: string; verificationStatus: string; createdAt: string } };
type Announcement = { id: string; title: string; body: string; productReference: string; createdAt: string; _count: { notifications: number } };
type ApplicationResult = { applications: Applicant[]; counts: { pending: number; approved: number; rejected: number }; products: string[] };
type AnnouncementResult = { announcements: Announcement[]; products: string[] };
type IssueReport = { id: string; source: string; product: string; category: string; severity: string; title: string; description: string; stepsToReproduce?: string | null; expectedBehaviour?: string | null; actualBehaviour?: string | null; conversationId?: string | null; messageId?: string | null; userMessage?: string | null; assistantResponse?: string | null; errorMessage?: string | null; pageUrl?: string | null; model?: string | null; clientMetadata?: string | null; status: "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX"; adminNote?: string | null; createdAt: string; user: { id: string; username: string; email: string }; reviewedBy?: { username: string } | null };
const productLabel = (value: string) => value === "ALL_MAX_PRODUCTS" ? "All MAX Products" : value;
const dateLabel = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function BetaAdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"applications" | "announcements" | "reports">("applications");
  const [data, setData] = useState<ApplicationResult | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ id: string; status: "APPROVED" | "REJECTED" } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [productReference, setProductReference] = useState("ALL_MAX_PRODUCTS");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const isOwner = user?.isAdmin === true && user?.username?.toLowerCase() === "zionopaaje";

  useEffect(() => { if (!authLoading && !isOwner) router.replace("/dashboard"); }, [authLoading, isOwner, router]);
  const load = useCallback(async () => {
    if (!isOwner) return;
    setLoading(true); setError("");
    try {
      const [applicationResult, announcementResult] = await Promise.all([
        apiClient.get<ApplicationResult>("/admin/beta/applications"),
        apiClient.get<AnnouncementResult>("/admin/beta/announcements"),
      ]);
      setData(applicationResult); setAnnouncements(announcementResult);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load Beta Tester data."); }
    finally { setLoading(false); }
  }, [isOwner]);
  useEffect(() => { void load(); }, [load]);

  const review = async (application: Applicant, status: "APPROVED" | "REJECTED", note = "") => {
    setBusyId(application.id);
    try {
      const result = await apiClient.patch<{ emailSent: boolean }>(`/admin/beta/applications/${encodeURIComponent(application.id)}/review`, { status, ...(note.trim() ? { note: note.trim() } : {}) });
      setData(previous => previous ? {
        ...previous,
        applications: previous.applications.map(item => item.id === application.id ? { ...item, status, reviewNote: note.trim() || null } : item),
        counts: { pending: Math.max(0, previous.counts.pending - 1), approved: previous.counts.approved + (status === "APPROVED" ? 1 : 0), rejected: previous.counts.rejected + (status === "REJECTED" ? 1 : 0) },
      } : previous);
      setConfirming(null); setReviewNote("");
      showToast({ title: status === "APPROVED" ? "Beta Tester approved" : "Application rejected", description: result.emailSent ? "The applicant was emailed." : "The application was updated; email delivery did not complete.", variant: result.emailSent ? "success" : "error" });
    } catch (err) { showToast({ title: "Review failed", description: err instanceof Error ? err.message : "Please try again.", variant: "error" }); }
    finally { setBusyId(null); }
  };

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const result = await apiClient.get<{ reports: IssueReport[] }>("/admin/beta/issue-reports");
      setReports(result.reports);
    } catch (err) { showToast({ title: "Couldn't load issue reports", description: err instanceof Error ? err.message : "Please try again.", variant: "error" }); }
    finally { setReportsLoading(false); }
  }, [showToast]);

  useEffect(() => { if (tab === "reports" && isOwner) void loadReports(); }, [tab, isOwner, loadReports]);

  const updateReport = async (report: IssueReport, status: IssueReport["status"]) => {
    try {
      await apiClient.patch(`/admin/beta/issue-reports/${encodeURIComponent(report.id)}`, { status, adminNote: report.adminNote || "" });
      setReports(previous => previous.map(item => item.id === report.id ? { ...item, status } : item));
      showToast({ title: "Issue report updated", description: `Status changed to ${status.replace("_", " ")}.`, variant: "success" });
    } catch (err) { showToast({ title: "Couldn't update report", description: err instanceof Error ? err.message : "Please try again.", variant: "error" }); }
  };

  const copyReport = async (report: IssueReport) => {
    const { id, source, product, category, severity, title, description, stepsToReproduce, expectedBehaviour, actualBehaviour, conversationId, messageId, userMessage, assistantResponse, errorMessage, pageUrl, model, clientMetadata, createdAt, user } = report;
    await navigator.clipboard.writeText(JSON.stringify({ reportId: id, source, product, category, severity, title, description, stepsToReproduce, expectedBehaviour, actualBehaviour, conversationId, messageId, userMessage, assistantResponse, errorMessage, pageUrl, model, clientMetadata, submittedAt: createdAt, reporter: user }, null, 2));
    showToast({ title: "Diagnostic report copied", description: "You can paste this report into a debugging conversation.", variant: "success" });
  };

  const publish = async (event: FormEvent) => {
    event.preventDefault(); setPublishing(true);
    try {
      const result = await apiClient.post<{ recipientCount: number; emailSent: number; emailFailed: number }>("/admin/beta/announcements", { title, body, productReference });
      showToast({ title: "Announcement published", description: `Sent to ${result.recipientCount} global beta testers. Email success: ${result.emailSent}; failed: ${result.emailFailed}.`, variant: result.emailFailed ? "error" : "success" });
      setTitle(""); setBody(""); setProductReference("ALL_MAX_PRODUCTS"); await load();
    } catch (err) { showToast({ title: "Announcement failed", description: err instanceof Error ? err.message : "Please try again.", variant: "error" }); }
    finally { setPublishing(false); }
  };

  if (authLoading || !isOwner) return <div className="flex min-h-[45vh] items-center justify-center text-sm text-ink-muted"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Checking Beta programme access…</div>;

  return (
    <div className="space-y-7 pb-12">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Restricted · @zionopaaje</p><div className="mt-2 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center border border-glass-border bg-base-raised"><ShieldCheck className="h-5 w-5" /></span><div><h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Beta Testers</h1><p className="mt-1 text-sm text-ink-muted">Review applications and publish updates to the global tester community.</p></div></div></div>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </header>
      {error && <div role="alert" className="border border-danger/30 bg-danger-subtle p-4 text-sm text-danger">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-5"><Users className="h-5 w-5 text-ink-muted" /><div><p className="text-xs text-ink-muted">Pending applications</p><p className="text-2xl font-semibold text-ink">{data?.counts.pending ?? "—"}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><Check className="h-5 w-5 text-ink-muted" /><div><p className="text-xs text-ink-muted">Approved testers</p><p className="text-2xl font-semibold text-ink">{data?.counts.approved ?? "—"}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><Megaphone className="h-5 w-5 text-ink-muted" /><div><p className="text-xs text-ink-muted">Published announcements</p><p className="text-2xl font-semibold text-ink">{announcements?.announcements.length ?? "—"}</p></div></CardContent></Card>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-glass-border">
        <button onClick={() => setTab("applications")} className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === "applications" ? "border-ink text-ink" : "border-transparent text-ink-muted"}`}>Applications</button>
        <button onClick={() => setTab("reports")} className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === "reports" ? "border-ink text-ink" : "border-transparent text-ink-muted"}`}>Issue reports</button>
        <button onClick={() => setTab("announcements")} className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === "announcements" ? "border-ink text-ink" : "border-transparent text-ink-muted"}`}>Announcements</button>
      </div>
      {tab === "applications" ? (
        <section className="space-y-4">
          <div><h2 className="text-lg font-semibold text-ink">Beta Tester applications</h2><p className="mt-1 text-sm text-ink-muted">Approving an applicant grants the global BETA_TESTER role, not access limited to their selected products.</p></div>
          {loading ? <div className="py-10 text-center text-sm text-ink-muted"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading applications…</div> : !data?.applications.length ? <Card><CardContent className="p-8 text-center text-sm text-ink-muted">No applications have been submitted yet.</CardContent></Card> : data.applications.map((application) => (
            <Card key={application.id}><CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-ink">{application.fullName}</h3><p className="mt-1 text-sm text-ink-muted">@{application.user.username} · {application.user.email}</p><p className="mt-1 text-xs text-ink-faint">Applied {dateLabel(application.createdAt)} · Email {application.user.verificationStatus.toLowerCase()}</p></div><Badge>{application.status}</Badge></div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Devices</p><div className="flex flex-wrap gap-2">{application.devices.map((item) => <span key={item} className="border border-glass-border px-2.5 py-1 text-xs text-ink">{item}</span>)}</div></div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Products of interest</p><div className="flex flex-wrap gap-2">{application.products.map((item) => <span key={item} className="border border-glass-border px-2.5 py-1 text-xs text-ink">{item}</span>)}</div></div>
              {application.reviewNote && <p className="text-sm text-ink-muted">Review note: {application.reviewNote}</p>}
              {application.status === "PENDING" && <div className="space-y-3 border-t border-glass-border pt-4">
                {confirming?.id === application.id ? (
                  <div className="space-y-3 rounded-md border border-glass-border bg-base-raised p-3">
                    <p className="text-sm font-medium text-ink">{confirming.status === "APPROVED" ? `Approve @${application.user.username} as a global Beta Tester?` : `Reject @${application.user.username}'s application?`}</p>
                    {confirming.status === "REJECTED" && <label className="block space-y-2"><span className="text-xs font-medium text-ink-muted">Optional note for the applicant</span><textarea value={reviewNote} onChange={event => setReviewNote(event.target.value)} maxLength={1000} rows={2} className="w-full border border-glass-border bg-base px-3 py-2 text-sm text-ink" placeholder="Add a short explanation…" /></label>}
                    <div className="flex flex-wrap gap-2"><Button onClick={() => void review(application, confirming.status, reviewNote)} disabled={busyId === application.id}>{busyId === application.id ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Updating…</> : confirming.status === "APPROVED" ? "Confirm approval" : "Confirm rejection"}</Button><Button variant="secondary" onClick={() => { setConfirming(null); setReviewNote(""); }} disabled={busyId === application.id}>Cancel</Button></div>
                  </div>
                ) : <div className="flex flex-wrap gap-2"><Button onClick={() => setConfirming({ id: application.id, status: "APPROVED" })}><Check className="h-4 w-4" /> Approve</Button><Button variant="secondary" onClick={() => { setConfirming({ id: application.id, status: "REJECTED" }); setReviewNote(""); }}><X className="h-4 w-4" /> Reject</Button></div>}
              </div>}
            </CardContent></Card>
          ))}
        </section>
      ) : tab === "reports" ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-ink">Issue reports</h2><p className="mt-1 text-sm text-ink-muted">Reports submitted by Beta Testers and MAX WebChat users. Copy a diagnostic bundle to share it for investigation.</p></div><Button variant="secondary" onClick={() => void loadReports()} disabled={reportsLoading}><RefreshCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} /> Refresh</Button></div>
          {reportsLoading ? <p className="py-10 text-center text-sm text-ink-muted">Loading issue reports…</p> : reports.length === 0 ? <Card><CardContent className="p-8 text-center text-sm text-ink-muted">No issue reports have been submitted.</CardContent></Card> : reports.map(report => (
            <Card key={report.id}><CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Bug className="h-4 w-4 text-ink-muted" /><h3 className="font-semibold text-ink">{report.title}</h3></div><p className="mt-1 text-xs text-ink-muted">{report.source === "MAX_WEBCHAT" ? "MAX WebChat" : "Beta Tester portal"} · {report.product} · {report.category} · {report.severity}</p><p className="mt-1 text-xs text-ink-faint">@{report.user.username} · {report.user.email} · {dateLabel(report.createdAt)}</p></div><Button variant="secondary" onClick={() => void copyReport(report)}><ClipboardCopy className="h-4 w-4" /> Copy diagnostic</Button></div>
              <p className="whitespace-pre-wrap text-sm text-ink">{report.description}</p>
              {report.userMessage && <div className="space-y-1"><p className="text-xs font-semibold uppercase text-ink-muted">User message</p><p className="whitespace-pre-wrap border border-glass-border bg-base-raised p-3 text-sm text-ink">{report.userMessage}</p></div>}
              {report.assistantResponse && <div className="space-y-1"><p className="text-xs font-semibold uppercase text-ink-muted">MAX response</p><p className="whitespace-pre-wrap border border-glass-border bg-base-raised p-3 text-sm text-ink">{report.assistantResponse}</p></div>}
              {report.errorMessage && <div className="space-y-1"><p className="text-xs font-semibold uppercase text-ink-muted">Error</p><pre className="whitespace-pre-wrap border border-danger/30 bg-danger-subtle p-3 text-xs text-danger">{report.errorMessage}</pre></div>}
              {(report.conversationId || report.messageId || report.model || report.pageUrl) && <p className="break-all text-xs text-ink-faint">Conversation: {report.conversationId || "—"} · Message: {report.messageId || "—"} · Model: {report.model || "—"} · URL: {report.pageUrl || "—"}</p>}
              {report.stepsToReproduce && <p className="whitespace-pre-wrap text-sm text-ink-muted"><strong className="text-ink">Steps:</strong> {report.stepsToReproduce}</p>}
              {report.expectedBehaviour && <p className="whitespace-pre-wrap text-sm text-ink-muted"><strong className="text-ink">Expected:</strong> {report.expectedBehaviour}</p>}
              {report.actualBehaviour && <p className="whitespace-pre-wrap text-sm text-ink-muted"><strong className="text-ink">Actual:</strong> {report.actualBehaviour}</p>}
              <div className="flex flex-col gap-3 border-t border-glass-border pt-4 sm:flex-row sm:items-end sm:justify-between"><label className="block space-y-2 sm:max-w-xs"><span className="text-xs font-medium text-ink-muted">Admin status</span><select value={report.status} onChange={event => void updateReport(report, event.target.value as IssueReport["status"])} className="h-10 w-full border border-glass-border bg-base px-3 text-sm text-ink"><option value="OPEN">Open</option><option value="TRIAGED">Triaged</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="WONT_FIX">Won't fix</option></select></label><label className="block flex-1 space-y-2"><span className="text-xs font-medium text-ink-muted">Internal admin note</span><input value={report.adminNote || ""} onChange={event => setReports(previous => previous.map(item => item.id === report.id ? { ...item, adminNote: event.target.value } : item))} maxLength={4000} className="h-10 w-full border border-glass-border bg-base px-3 text-sm text-ink" placeholder="Internal investigation notes…" /></label><Button variant="secondary" onClick={() => void updateReport(report, report.status)}>Save note</Button></div>
            </CardContent></Card>
          ))}
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card><CardContent className="space-y-4 p-6"><div><h2 className="font-semibold text-ink">Publish an update</h2><p className="mt-1 text-sm text-ink-muted">Every announcement is sent to every approved global Beta Tester. Product selection adds a reference label only; it does not filter recipients.</p></div>
            <form onSubmit={publish} className="space-y-4">
              <label className="block space-y-2"><span className="text-sm font-medium text-ink">Announcement title</span><input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={180} className="h-11 w-full border border-glass-border bg-base px-3 text-sm text-ink outline-none focus:border-ink-muted" placeholder="What's new in MAX?" /></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-ink">Product reference</span><select value={productReference} onChange={(event) => setProductReference(event.target.value)} className="h-11 w-full border border-glass-border bg-base px-3 text-sm text-ink outline-none focus:border-ink-muted"><option value="ALL_MAX_PRODUCTS">All MAX Products</option>{(announcements?.products ?? data?.products ?? []).map((product) => <option key={product} value={product}>{product}</option>)}</select><span className="block text-xs text-ink-faint">This label appears in the email. All approved testers still receive it.</span></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-ink">Message</span><textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={12000} rows={8} className="w-full resize-y border border-glass-border bg-base px-3 py-3 text-sm text-ink outline-none focus:border-ink-muted" placeholder="Write your beta news or product update…" /></label>
              <Button type="submit" disabled={publishing || !title.trim() || !body.trim()}>{publishing ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Sending…</> : <><Megaphone className="h-4 w-4" /> Publish to all beta testers</>}</Button>
            </form>
          </CardContent></Card>
          <div className="space-y-3"><div><h2 className="font-semibold text-ink">Announcement history</h2><p className="mt-1 text-sm text-ink-muted">Saved announcements and the number of beta notifications created.</p></div>
            {(announcements?.announcements ?? []).map((item) => <Card key={item.id}><CardContent className="space-y-2 p-5"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold text-ink">{item.title}</h3><Badge>{item._count.notifications} testers</Badge></div><p className="text-xs text-ink-muted">Product reference: {productLabel(item.productReference)} · {dateLabel(item.createdAt)}</p><p className="whitespace-pre-wrap text-sm text-ink-muted">{item.body}</p></CardContent></Card>)}
            {!loading && !announcements?.announcements.length && <Card><CardContent className="p-6 text-sm text-ink-muted">No announcements published yet.</CardContent></Card>}
          </div>
        </section>
      )}
    </div>
  );
}
