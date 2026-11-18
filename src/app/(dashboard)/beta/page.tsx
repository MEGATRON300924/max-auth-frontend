"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, Clock3, FlaskConical, LoaderCircle, Send, ShieldCheck } from "lucide-react";

const products = ["MAX AI", "MAX Home", "MAX Music", "MAX Browser", "MAX TV", "MAX Cloud", "MAX Store", "MAX Connect", "MAX Car OS", "MAX Business", "MAX Security", "MAX OS", "MAX Pay", "MAX Studio", "MAX Voice", "MAX Spotlight Graph", "MAX Auth"];
const devices = ["Android phone", "iPhone", "Android tablet", "iPad", "Windows PC", "Mac", "Linux PC", "Smart TV / MAX TV", "Car system", "Other"];

type Application = { id: string; fullName: string; devices: string[]; products: string[]; status: "PENDING" | "APPROVED" | "REJECTED"; reviewNote?: string | null; createdAt: string };
type Result = { application: Application | null; role: { role: string; grantedAt: string } | null };
type IssueReport = { id: string; product: string; category: string; severity: string; title: string; description: string; status: string; adminNote?: string | null; createdAt: string; updatedAt: string };

export default function BetaApplicationPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [fullName, setFullName] = useState(user?.fullName || user?.displayName || user?.username || "");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportProduct, setReportProduct] = useState("MAX AI");
  const [reportCategory, setReportCategory] = useState("BUG");
  const [reportSeverity, setReportSeverity] = useState("NORMAL");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSteps, setReportSteps] = useState("");
  const [reportExpected, setReportExpected] = useState("");
  const [reportActual, setReportActual] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.get<Result>("/beta/application");
      setApplication(result.application);
      if (result.application) {
        setFullName(result.application.fullName);
        setSelectedDevices(result.application.devices);
        setSelectedProducts(result.application.products);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your application.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const result = await apiClient.get<{ reports: IssueReport[] }>("/beta/issue-reports");
      setReports(result.reports);
    } catch (err) {
      showToast({ title: "Couldn't load issue reports", description: err instanceof Error ? err.message : "Please try again.", variant: "error" });
    } finally { setReportsLoading(false); }
  }, [showToast]);

  useEffect(() => { if (application?.status === "APPROVED") void loadReports(); }, [application?.status, loadReports]);

  const submitIssueReport = async (event: FormEvent) => {
    event.preventDefault();
    setReporting(true);
    try {
      await apiClient.post("/beta/issue-reports", {
        product: reportProduct, category: reportCategory, severity: reportSeverity,
        title: reportTitle, description: reportDescription,
        ...(reportSteps.trim() ? { stepsToReproduce: reportSteps } : {}),
        ...(reportExpected.trim() ? { expectedBehaviour: reportExpected } : {}),
        ...(reportActual.trim() ? { actualBehaviour: reportActual } : {}),
      });
      setReportTitle(""); setReportDescription(""); setReportSteps(""); setReportExpected(""); setReportActual("");
      showToast({ title: "Issue report sent", description: "The MAX team can now review your report.", variant: "success" });
      void loadReports();
    } catch (err) {
      showToast({ title: "Couldn't send issue report", description: err instanceof Error ? err.message : "Please try again.", variant: "error" });
    } finally { setReporting(false); }
  };

  const toggle = (items: string[], value: string, setter: (next: string[]) => void) => {
    setter(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedDevices.length === 0 || selectedProducts.length === 0) {
      showToast({ title: "Complete your application", description: "Choose at least one device and one MAX product.", variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/beta/applications", { fullName, devices: selectedDevices, products: selectedProducts });
      showToast({ title: "Application submitted", description: "Your application is now waiting for review.", variant: "success" });
      await load();
    } catch (err) {
      showToast({ title: "Couldn't submit application", description: err instanceof Error ? err.message : "Please try again.", variant: "error" });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex min-h-[45vh] items-center justify-center text-sm text-ink-muted"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading Beta Tester programme…</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-12">
      <header className="space-y-3">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center border border-glass-border bg-base-raised"><FlaskConical className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">The MAX AI Ecosystem</p><h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Become a Beta Tester</h1></div></div>
        <p className="max-w-2xl text-sm leading-6 text-ink-muted">Help us test upcoming MAX experiences, share feedback, and get early access to new features. Beta Tester approval applies across the MAX ecosystem.</p>
      </header>

      {error && <div role="alert" className="border border-danger/30 bg-danger-subtle p-4 text-sm text-danger">{error}</div>}

      {application?.status === "APPROVED" ? (
        <div className="space-y-6">
          <Card><CardContent className="space-y-3 p-6"><div className="flex items-center gap-2 text-ink"><CheckCircle2 className="h-5 w-5" /><h2 className="font-semibold">You're an approved Beta Tester</h2></div><p className="text-sm text-ink-muted">Your MAX Account has the global Beta Tester role. You can receive beta announcements for any MAX product.</p><div className="flex flex-wrap gap-2">{application.products.map((product) => <Badge key={product}>{product}</Badge>)}</div></CardContent></Card>
          <Card><CardContent className="space-y-5 p-6">
            <div><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-ink-muted" /><h2 className="font-semibold text-ink">Report a product issue</h2></div><p className="mt-1 text-sm text-ink-muted">Tell the MAX team what went wrong. Include steps and expected behaviour when possible.</p></div>
            <form onSubmit={submitIssueReport} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-2"><span className="text-sm font-medium text-ink">Product</span><select value={reportProduct} onChange={e => setReportProduct(e.target.value)} className="h-11 w-full border border-glass-border bg-base px-3 text-sm text-ink">{products.map(p => <option key={p}>{p}</option>)}</select></label>
                <label className="block space-y-2"><span className="text-sm font-medium text-ink">Category</span><select value={reportCategory} onChange={e => setReportCategory(e.target.value)} className="h-11 w-full border border-glass-border bg-base px-3 text-sm text-ink"><option value="BUG">Bug</option><option value="PERFORMANCE">Performance</option><option value="FEATURE">Feature feedback</option><option value="ACCOUNT">Account / sign-in</option><option value="OTHER">Other</option></select></label>
                <label className="block space-y-2"><span className="text-sm font-medium text-ink">Severity</span><select value={reportSeverity} onChange={e => setReportSeverity(e.target.value)} className="h-11 w-full border border-glass-border bg-base px-3 text-sm text-ink"><option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
              </div>
              <label className="block space-y-2"><span className="text-sm font-medium text-ink">Issue title</span><input value={reportTitle} onChange={e => setReportTitle(e.target.value)} required minLength={3} maxLength={180} className="h-11 w-full border border-glass-border bg-base px-3 text-sm text-ink" placeholder="Briefly describe the issue" /></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-ink">What happened?</span><textarea value={reportDescription} onChange={e => setReportDescription(e.target.value)} required minLength={5} maxLength={8000} rows={4} className="w-full border border-glass-border bg-base px-3 py-3 text-sm text-ink" placeholder="Describe what you experienced…" /></label>
              <label className="block space-y-2"><span className="text-sm font-medium text-ink">Steps to reproduce (optional)</span><textarea value={reportSteps} onChange={e => setReportSteps(e.target.value)} maxLength={8000} rows={3} className="w-full border border-glass-border bg-base px-3 py-3 text-sm text-ink" placeholder="1. Open… 2. Select… 3. The issue appears…" /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2"><span className="text-sm font-medium text-ink">Expected behaviour (optional)</span><textarea value={reportExpected} onChange={e => setReportExpected(e.target.value)} maxLength={4000} rows={3} className="w-full border border-glass-border bg-base px-3 py-3 text-sm text-ink" /></label><label className="block space-y-2"><span className="text-sm font-medium text-ink">Actual behaviour (optional)</span><textarea value={reportActual} onChange={e => setReportActual(e.target.value)} maxLength={4000} rows={3} className="w-full border border-glass-border bg-base px-3 py-3 text-sm text-ink" /></label></div>
              <Button type="submit" disabled={reporting || !reportTitle.trim() || !reportDescription.trim()}>{reporting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send issue report</>}</Button>
            </form>
          </CardContent></Card>
          <section className="space-y-3"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-ink">Your issue reports</h2><p className="mt-1 text-sm text-ink-muted">Track reports sent to the MAX team.</p></div><Button variant="secondary" onClick={() => void loadReports()} disabled={reportsLoading}>Refresh</Button></div>
            {reportsLoading ? <p className="py-6 text-center text-sm text-ink-muted">Loading reports…</p> : reports.length === 0 ? <Card><CardContent className="p-6 text-sm text-ink-muted">You haven't submitted any issue reports yet.</CardContent></Card> : reports.map(report => <Card key={report.id}><CardContent className="space-y-2 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-ink">{report.title}</h3><Badge>{report.status.replace("_", " ")}</Badge></div><p className="text-xs text-ink-muted">{report.product} · {report.category} · {report.severity} · {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.createdAt))}</p><p className="whitespace-pre-wrap text-sm text-ink-muted">{report.description}</p>{report.adminNote && <div className="border-l-2 border-ink-muted pl-3 text-sm text-ink-muted"><strong className="text-ink">Team update:</strong> {report.adminNote}</div>}</CardContent></Card>)}
          </section>
        </div>
      ) : application?.status === "PENDING" ? (
        <Card><CardContent className="space-y-3 p-6"><div className="flex items-center gap-2 text-ink"><Clock3 className="h-5 w-5" /><h2 className="font-semibold">Application awaiting review</h2></div><p className="text-sm text-ink-muted">Your application has been received. We'll email you when a decision is made.</p><p className="text-xs text-ink-faint">Submitted {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(application.createdAt))}</p></CardContent></Card>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          {application?.status === "REJECTED" && <div className="border border-glass-border bg-base-raised p-4 text-sm text-ink-muted"><strong className="text-ink">Previous application not approved.</strong>{application.reviewNote ? " " + application.reviewNote : " You can update your details and apply again."}</div>}
          <Card><CardContent className="space-y-4 p-6"><div><h2 className="font-semibold text-ink">About you</h2><p className="mt-1 text-sm text-ink-muted">Your application is linked to your signed-in MAX Account email.</p></div><label className="block space-y-2"><span className="text-sm font-medium text-ink">Your name</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} maxLength={128} className="h-11 w-full border border-glass-border bg-base px-3 text-sm text-ink outline-none focus:border-ink-muted" placeholder="Enter your full name" /></label><div className="text-xs text-ink-faint">MAX Account: {user?.email || "Signed-in account"}</div></CardContent></Card>

          <Card><CardContent className="space-y-4 p-6"><div><h2 className="font-semibold text-ink">Which devices do you use?</h2><p className="mt-1 text-sm text-ink-muted">Select every device you can use to test MAX products.</p></div><div className="grid gap-3 sm:grid-cols-2">{devices.map((device) => <label key={device} className="flex items-center gap-3 border border-glass-border p-3 text-sm text-ink"><input type="checkbox" checked={selectedDevices.includes(device)} onChange={() => toggle(selectedDevices, device, setSelectedDevices)} className="h-4 w-4 accent-current" />{device}</label>)}</div></CardContent></Card>

          <Card><CardContent className="space-y-4 p-6"><div><h2 className="font-semibold text-ink">Which MAX products interest you?</h2><p className="mt-1 text-sm text-ink-muted">Select the products you'd like to test. Your Beta Tester role will be global, not limited to these selections.</p></div><div className="grid gap-3 sm:grid-cols-2">{products.map((product) => <label key={product} className="flex items-center gap-3 border border-glass-border p-3 text-sm text-ink"><input type="checkbox" checked={selectedProducts.includes(product)} onChange={() => toggle(selectedProducts, product, setSelectedProducts)} className="h-4 w-4 accent-current" />{product}</label>)}</div></CardContent></Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-ink-faint">Submitting an application does not automatically grant beta access.</p><Button type="submit" disabled={submitting || !fullName.trim()}>{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Submitting…</> : <><ShieldCheck className="h-4 w-4" /> Submit application</>}</Button></div>
        </form>
      )}
    </div>
  );
}
