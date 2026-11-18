"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, LoaderCircle, Megaphone, RefreshCw, ShieldCheck, Users, X } from "lucide-react";

type Applicant = { id: string; fullName: string; devices: string[]; products: string[]; status: "PENDING" | "APPROVED" | "REJECTED"; reviewNote?: string | null; createdAt: string; user: { id: string; username: string; email: string; verificationStatus: string; createdAt: string } };
type Announcement = { id: string; title: string; body: string; productReference: string; createdAt: string; _count: { notifications: number } };
type ApplicationResult = { applications: Applicant[]; counts: { pending: number; approved: number; rejected: number }; products: string[] };
type AnnouncementResult = { announcements: Announcement[]; products: string[] };
const productLabel = (value: string) => value === "ALL_MAX_PRODUCTS" ? "All MAX Products" : value;
const dateLabel = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function BetaAdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"applications" | "announcements">("applications");
  const [data, setData] = useState<ApplicationResult | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
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

  const review = async (application: Applicant, status: "APPROVED" | "REJECTED") => {
    const note = status === "REJECTED" ? window.prompt("Optional note for the applicant:", "") : "";
    if (note === null) return;
    if (!window.confirm(status === "APPROVED" ? `Approve @${application.user.username} as a global Beta Tester?` : `Reject @${application.user.username}'s application?`)) return;
    setBusyId(application.id);
    try {
      const result = await apiClient.patch<{ emailSent: boolean }>(`/admin/beta/applications/${encodeURIComponent(application.id)}/review`, { status, ...(note.trim() ? { note: note.trim() } : {}) });
      showToast({ title: status === "APPROVED" ? "Beta Tester approved" : "Application rejected", description: result.emailSent ? "The applicant was emailed." : "The application was updated; email delivery did not complete.", variant: result.emailSent ? "success" : "error" });
      await load();
    } catch (err) { showToast({ title: "Review failed", description: err instanceof Error ? err.message : "Please try again.", variant: "error" }); }
    finally { setBusyId(null); }
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
      <div className="flex gap-2 border-b border-glass-border">
        <button onClick={() => setTab("applications")} className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === "applications" ? "border-ink text-ink" : "border-transparent text-ink-muted"}`}>Applications</button>
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
              {application.status === "PENDING" && <div className="flex flex-wrap gap-2 border-t border-glass-border pt-4"><Button onClick={() => void review(application, "APPROVED")} disabled={busyId === application.id}><Check className="h-4 w-4" /> Approve</Button><Button variant="secondary" onClick={() => void review(application, "REJECTED")} disabled={busyId === application.id}><X className="h-4 w-4" /> Reject</Button>{busyId === application.id && <span className="self-center text-xs text-ink-muted">Updating…</span>}</div>}
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
