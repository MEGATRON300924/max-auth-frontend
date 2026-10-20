"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, ChevronRight, CircleAlert, LoaderCircle, Mail, Plus, ShieldCheck, Users } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";

type Business = {
  id: string; businessId: string; handle: string; legalName: string; displayName: string; email: string;
  phone: string; country: string; businessType: string; websiteUrl?: string | null; description?: string | null;
  registrationNumber?: string | null; status: string; verificationStatus: string; emailVerifiedAt?: string | null;
  createdAt: string; role?: string;
};
type Member = { id: string; role: string; status: string; createdAt: string; user: { id: string; username: string; fullName?: string | null; displayName?: string | null; email: string; avatarUrl?: string | null } };
type AuditEntry = { id: string; action: string; createdAt: string; actorId?: string | null; metadata?: unknown };
type BusinessApp = { id: string; scopes: string[]; connectedAt: string; status: string; client: { clientId: string; name: string; isActive: boolean }; authorizedBy: { email: string; displayName?: string | null; username: string } };
type BusinessForm = { legalName: string; displayName: string; handle: string; email: string; phone: string; country: string; businessType: string; websiteUrl: string; description: string; registrationNumber: string };

const initialForm: BusinessForm = { legalName: "", displayName: "", handle: "", email: "", phone: "", country: "NG", businessType: "Hospitality", websiteUrl: "", description: "", registrationNumber: "" };
const roles = ["ADMINISTRATOR", "MANAGER", "MEMBER", "VIEWER", "DEVELOPER"];

function labelRole(role?: string) {
  return (role || "MEMBER").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function BusinessPortalPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<Business | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [apps, setApps] = useState<BusinessApp[]>([]);
  const [form, setForm] = useState<BusinessForm>(initialForm);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteLink, setInviteLink] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBusinesses = useCallback(async () => {
    setPageLoading(true);
    setError("");
    try {
      const data = await apiClient.get<{ businesses: Business[] }>("/businesses");
      setBusinesses(data.businesses);
      setSelected((current) => {
        if (current) return data.businesses.find((business) => business.id === current.id) || data.businesses[0] || null;
        return data.businesses[0] || null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't load your business identities.");
    } finally {
      setPageLoading(false);
    }
  }, []);

  const loadWorkspace = useCallback(async (business: Business) => {
    try {
      const [memberData, logData] = await Promise.all([
        apiClient.get<{ members: Member[] }>(`/businesses/${business.id}/members`),
        apiClient.get<{ logs: AuditEntry[] }>(`/businesses/${business.id}/audit-logs`).catch(() => ({ logs: [] as AuditEntry[] })),
      ]);
      setMembers(memberData.members);
      setLogs(logData.logs);
      const appData = await apiClient.get<{ apps: BusinessApp[] }>(`/businesses/${business.id}/apps`).catch(() => ({ apps: [] as BusinessApp[] }));
      setApps(appData.apps);
    } catch (err) {
      setMembers([]);
      setLogs([]);
      setApps([]);
      setError(err instanceof Error ? err.message : "We couldn't load this business workspace.");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) void loadBusinesses();
    else if (!authLoading) setPageLoading(false);
  }, [isAuthenticated, authLoading, loadBusinesses]);

  useEffect(() => {
    if (selected && isAuthenticated) void loadWorkspace(selected);
    else { setMembers([]); setLogs([]); setApps([]); }
  }, [selected?.id, isAuthenticated, loadWorkspace]);

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setNotice("");
    try {
      const payload = {
        legalName: form.legalName, displayName: form.displayName, ...(form.handle.trim() ? { handle: form.handle.trim() } : {}),
        email: form.email, phone: form.phone, country: form.country.toUpperCase(), businessType: form.businessType,
        ...(form.websiteUrl.trim() ? { websiteUrl: form.websiteUrl.trim() } : {}),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
        ...(form.registrationNumber.trim() ? { registrationNumber: form.registrationNumber.trim() } : {}),
      };
      const data = await apiClient.post<{ business: Business; emailVerificationSent: boolean }>("/businesses", payload);
      setForm(initialForm);
      setShowCreate(false);
      setNotice(data.emailVerificationSent ? "Business identity created. Check the business email to verify control of the address." : "Business identity created, but the verification email could not be sent. Contact support to restore email delivery.");
      await loadBusinesses();
      setSelected({ ...data.business, role: "OWNER" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create this business. Please check the details and try again.");
    } finally { setLoading(false); }
  }

  function beginEditProfile() {
    if (!selected) return;
    setForm({
      legalName: selected.legalName, displayName: selected.displayName, handle: selected.handle, email: selected.email,
      phone: selected.phone, country: selected.country, businessType: selected.businessType,
      websiteUrl: selected.websiteUrl || "", description: selected.description || "", registrationNumber: selected.registrationNumber || "",
    });
    setShowCreate(false);
    setShowEditProfile(true);
    setError("");
    setNotice("");
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setLoading(true); setError(""); setNotice("");
    try {
      const data = await apiClient.patch<{ business: Business; emailVerificationSent?: boolean }>(`/businesses/${selected.id}`, {
        legalName: form.legalName, displayName: form.displayName, email: form.email, phone: form.phone,
        country: form.country.toUpperCase(), businessType: form.businessType,
        websiteUrl: form.websiteUrl.trim() || null, description: form.description.trim() || null,
        registrationNumber: form.registrationNumber.trim() || null,
      });
      setShowEditProfile(false);
      setNotice(data.emailVerificationSent === false ? "Business profile updated, but the new email verification message could not be sent." : data.emailVerificationSent ? "Business profile updated. Verify the new email address to confirm access." : "Business profile updated.");
      await loadBusinesses();
      setSelected({ ...data.business, role: selected.role });
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn't update this business profile."); }
    finally { setLoading(false); }
  }

  async function resendVerification() {
    if (!selected) return;
    setLoading(true); setError(""); setNotice("");
    try {
      const data = await apiClient.post<{ emailVerificationSent: boolean }>(`/businesses/${selected.id}/resend-email-verification`, {});
      setNotice(data.emailVerificationSent ? "A fresh verification link has been sent to the business email." : "We couldn't send the verification email. Please try again later.");
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn't resend the verification email."); }
    finally { setLoading(false); }
  }

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setLoading(true); setError(""); setNotice(""); setInviteLink("");
    try {
      const data = await apiClient.post<{ invitation: { email: string }; acceptUrl: string; emailSent: boolean }>(`/businesses/${selected.id}/invitations`, { email: inviteEmail, role: inviteRole });
      setInviteLink(data.acceptUrl);
      setInviteEmail("");
      setNotice(data.emailSent ? "Invitation sent. The invite link is also available to copy." : "Invitation created, but email delivery failed. Copy and share the invitation link securely.");
      await loadWorkspace(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create the invitation.");
    } finally { setLoading(false); }
  }

  async function changeRole(member: Member, role: string) {
    if (!selected) return;
    setError(""); setNotice("");
    try {
      await apiClient.patch(`/businesses/${selected.id}/members/${member.id}`, { role });
      setNotice("Member role updated.");
      await loadWorkspace(selected);
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn't update this role."); }
  }

  async function disconnectApp(app: BusinessApp) {
    if (!selected || !window.confirm(`Disconnect ${app.client.name} from this business? Its business-scoped access and refresh tokens will be revoked.`)) return;
    setError(""); setNotice("");
    try {
      await apiClient.delete(`/businesses/${selected.id}/apps/${app.id}`);
      setNotice(`${app.client.name} was disconnected from this business.`);
      await loadWorkspace(selected);
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn't disconnect this product."); }
  }

  async function removeMember(member: Member) {
    if (!selected || !window.confirm(`Remove ${member.user.displayName || member.user.fullName || member.user.email} from this business?`)) return;
    setError(""); setNotice("");
    try {
      await apiClient.delete(`/businesses/${selected.id}/members/${member.id}`);
      setNotice("Business access removed.");
      await loadWorkspace(selected);
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn't remove this member."); }
  }

  function updateField(field: keyof BusinessForm, value: string) {
    setForm((current) => ({ ...current, [field]: value, ...(field === "displayName" && !current.handle ? { handle: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}) }));
  }

  const canManage = selected?.role === "OWNER" || selected?.role === "ADMINISTRATOR";

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-glass-border bg-base-raised px-3 py-1.5 text-xs font-semibold text-ink-muted"><Building2 className="h-3.5 w-3.5 text-brand-600" /> MAX Auth for Businesses</div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Your business, connected to MAX.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">Create a trusted business identity, manage your team, and decide how MAX products connect to your organization.</p>
          </div>
          {isAuthenticated && <Button onClick={() => { setShowCreate((value) => !value); setError(""); setNotice(""); }}><Plus className="h-4 w-4" /> Create a business</Button>}
        </div>

        {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        {notice && <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-ink"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{notice}</div>}

        {authLoading || pageLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-ink-muted"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading your business workspace…</div>
        ) : !isAuthenticated ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-glass-border bg-base-raised p-7 text-center shadow-sm sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><ShieldCheck className="h-7 w-7" /></span>
            <h2 className="mt-5 text-2xl font-semibold">Sign in to manage your business</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted">Use your existing personal MAX Account. Your personal identity stays separate from the business identity you create or join.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/sign-in"><Button>Sign in to MAX <ArrowRight className="h-4 w-4" /></Button></Link><Link href="/create-account"><Button variant="secondary">Create a MAX Account</Button></Link></div>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-glass-border bg-base-raised p-4">
                <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Your businesses</h2><span className="rounded-full bg-glass-hover px-2 py-0.5 text-xs text-ink-muted">{businesses.length}</span></div>
                {businesses.length ? <div className="space-y-2">{businesses.map((business) => <button key={business.id} onClick={() => { setSelected(business); setNotice(""); setInviteLink(""); }} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selected?.id === business.id ? "border-brand-500/40 bg-brand-50/60 dark:bg-brand-500/10" : "border-transparent hover:bg-glass-hover"}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base text-brand-700 dark:text-brand-300"><Building2 className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{business.displayName}</span><span className="block truncate text-xs text-ink-muted">@{business.handle}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" /></button>)}</div> : <div className="rounded-xl border border-dashed border-glass-border px-4 py-6 text-center"><Building2 className="mx-auto h-6 w-6 text-ink-faint" /><p className="mt-2 text-sm font-medium">No business identity yet</p><p className="mt-1 text-xs leading-5 text-ink-muted">Create one to start connecting your business to MAX.</p></div>}
                {!businesses.length && <Button className="mt-4 w-full" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create your first business</Button>}
              </div>
              <div className="rounded-2xl border border-glass-border bg-base-raised p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-glass-hover"><ShieldCheck className="h-5 w-5" /></span><div><p className="text-sm font-semibold">Business identity</p><p className="text-xs text-ink-muted">Separate from your MAX Account</p></div></div><p className="mt-3 text-xs leading-5 text-ink-muted">Email verification confirms access to an email address. Legal business verification is a separate process.</p></div>
            </aside>

            <div className="min-w-0 space-y-6">
              {showCreate ? (
                <section className="rounded-2xl border border-glass-border bg-base-raised p-5 sm:p-7">
                  <div className="mb-6"><h2 className="text-xl font-semibold">Create a business identity</h2><p className="mt-1 text-sm text-ink-muted">Your permanent MAX business ID will be created when you submit.</p></div>
                  <form onSubmit={createBusiness} className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">Legal business name<input required minLength={2} maxLength={180} value={form.legalName} onChange={(e) => updateField("legalName", e.target.value)} placeholder="Registered legal name" className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Display name<input required minLength={2} maxLength={120} value={form.displayName} onChange={(e) => updateField("displayName", e.target.value)} placeholder="Name shown in MAX" className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Business handle<input required minLength={3} maxLength={64} pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" value={form.handle} onChange={(e) => updateField("handle", e.target.value)} placeholder="your-business" className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /><span className="mt-1 block text-xs text-ink-muted">Unique and used as a public identifier.</span></label>
                    <label className="text-sm font-medium">Business type<select required value={form.businessType} onChange={(e) => updateField("businessType", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="Hospitality">Hospitality</option><option value="Hotel">Hotel</option><option value="Restaurant">Restaurant</option><option value="Retail">Retail</option><option value="Technology">Technology</option><option value="Professional services">Professional services</option><option value="Other">Other</option></select></label>
                    <label className="text-sm font-medium">Business email<input required type="email" maxLength={254} value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="business@example.com" className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Business phone<input required type="tel" minLength={7} maxLength={40} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+234…" className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Country<select required value={form.country} onChange={(e) => updateField("country", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="ZZ">Other</option></select></label>
                    <label className="text-sm font-medium">Registration number <span className="text-xs font-normal text-ink-muted">Optional</span><input maxLength={120} value={form.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} placeholder="CAC or local registration number" className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium sm:col-span-2">Website <span className="text-xs font-normal text-ink-muted">Optional</span><input type="url" value={form.websiteUrl} onChange={(e) => updateField("websiteUrl", e.target.value)} placeholder="https://example.com" className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium sm:col-span-2">Business description <span className="text-xs font-normal text-ink-muted">Optional</span><textarea rows={3} maxLength={2000} value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="What does your business do?" className="mt-1.5 w-full resize-y rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Creating…</> : <>Create business identity <ArrowRight className="h-4 w-4" /></>}</Button></div>
                  </form>
                </section>
              ) : showEditProfile && selected ? (
                <section className="rounded-2xl border border-glass-border bg-base-raised p-5 sm:p-7">
                  <div className="mb-6"><h2 className="text-xl font-semibold">Edit business profile</h2><p className="mt-1 text-sm text-ink-muted">Your permanent business ID and handle cannot be changed here.</p></div>
                  <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">Legal business name<input required minLength={2} maxLength={180} value={form.legalName} onChange={(e) => updateField("legalName", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Display name<input required minLength={2} maxLength={120} value={form.displayName} onChange={(e) => updateField("displayName", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Business email<input required type="email" maxLength={254} value={form.email} onChange={(e) => updateField("email", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Business phone<input required type="tel" minLength={7} maxLength={40} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Country code<input required minLength={2} maxLength={2} value={form.country} onChange={(e) => updateField("country", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium">Business type<input required minLength={2} maxLength={80} value={form.businessType} onChange={(e) => updateField("businessType", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium sm:col-span-2">Website<input type="url" value={form.websiteUrl} onChange={(e) => updateField("websiteUrl", e.target.value)} placeholder="https://example.com" className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium sm:col-span-2">Business description<textarea rows={3} maxLength={2000} value={form.description} onChange={(e) => updateField("description", e.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <label className="text-sm font-medium sm:col-span-2">Registration number<input maxLength={120} value={form.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} className="mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={() => setShowEditProfile(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save profile"}</Button></div>
                  </form>
                </section>
              ) : selected ? (
                <>
                  <section className="rounded-2xl border border-glass-border bg-base-raised p-5 sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><Building2 className="h-7 w-7" /></span>
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold tracking-tight">{selected.displayName}</h2><span className="rounded-full bg-glass-hover px-2.5 py-1 text-xs font-medium">{labelRole(selected.role)}</span></div><p className="mt-1 text-sm text-ink-muted">{selected.legalName} · @{selected.handle}</p><p className="mt-4 break-all font-mono text-xs text-ink-muted">Business ID: {selected.businessId}</p></div>
                      <div className="flex flex-wrap gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${selected.emailVerifiedAt ? "bg-success/10 text-success" : "bg-warning/10 text-ink-muted"}`}><Mail className="h-3.5 w-3.5" /> {selected.emailVerifiedAt ? "Email verified" : "Email unverified"}</span><span className="rounded-full bg-glass-hover px-2.5 py-1 text-xs font-medium">{selected.verificationStatus === "VERIFIED" ? "Business verified" : "Business verification pending"}</span></div>
                    </div>
                    {canManage && <div className="mt-5 flex flex-wrap items-start gap-3"><div><a href={`https://max-hotel-frontend.vercel.app/api/auth/start?business_id=${encodeURIComponent(selected.businessId)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">Connect MAX Hotels <ArrowRight className="h-4 w-4" /></a><p className="mt-2 max-w-md text-xs text-ink-muted">Authorize MAX Hotels to use this business identity and create property workspaces. Your business ID alone does not grant access.</p></div><button onClick={beginEditProfile} className="inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2.5 text-sm font-semibold hover:bg-glass-hover">Edit profile</button>{!selected.emailVerifiedAt && <button disabled={loading} onClick={() => void resendVerification()} className="inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2.5 text-sm font-semibold hover:bg-glass-hover">{loading ? "Sending…" : "Resend email verification"}</button>}</div>}
                    <div className="mt-6 grid gap-4 border-t border-glass-border pt-5 sm:grid-cols-3"><div><p className="text-xs text-ink-muted">Business email</p><p className="mt-1 break-all text-sm font-medium">{selected.email}</p></div><div><p className="text-xs text-ink-muted">Business type</p><p className="mt-1 text-sm font-medium">{selected.businessType}</p></div><div><p className="text-xs text-ink-muted">Created</p><p className="mt-1 text-sm font-medium">{formatDate(selected.createdAt)}</p></div></div>
                  </section>

                  <section className="rounded-2xl border border-glass-border bg-base-raised p-5 sm:p-7">
                    <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Team members</h2><p className="mt-1 text-sm text-ink-muted">Access is granted to individual MAX Accounts, not by knowing your business ID.</p></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-glass-hover"><Users className="h-5 w-5" /></span></div>
                    {canManage && <form onSubmit={inviteMember} className="mb-5 grid gap-3 rounded-xl border border-glass-border bg-base p-3 sm:grid-cols-[minmax(0,1fr)_170px_auto]"><input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Teammate's email address" className="min-w-0 rounded-lg border border-glass-border bg-base-raised px-3 py-2.5 text-sm outline-none focus:border-brand-500" /><select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="rounded-lg border border-glass-border bg-base-raised px-3 py-2.5 text-sm outline-none focus:border-brand-500">{roles.map((role) => <option key={role} value={role}>{labelRole(role)}</option>)}</select><Button type="submit" disabled={loading}>{loading ? "Inviting…" : "Invite member"}</Button></form>}
                    {inviteLink && <div className="mb-5 rounded-xl border border-brand-500/30 bg-brand-50/50 p-3 text-sm dark:bg-brand-500/5"><p className="font-medium">Invitation link</p><p className="mt-1 break-all font-mono text-xs text-ink-muted">{inviteLink}</p><button className="mt-2 text-xs font-semibold text-brand-700 underline dark:text-brand-300" onClick={() => void navigator.clipboard.writeText(inviteLink)}>Copy invitation link</button></div>}
                    {members.length ? <div className="divide-y divide-glass-border">{members.map((member) => <div key={member.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-glass-hover text-sm font-semibold">{(member.user.displayName || member.user.fullName || member.user.email).slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{member.user.displayName || member.user.fullName || member.user.username}</p><p className="truncate text-xs text-ink-muted">{member.user.email}</p></div><span className="text-xs text-ink-muted">Joined {formatDate(member.createdAt)}</span>{canManage && member.role !== "OWNER" && <div className="flex gap-2"><select aria-label={`Role for ${member.user.email}`} value={member.role} onChange={(e) => void changeRole(member, e.target.value)} className="rounded-lg border border-glass-border bg-base px-2 py-1.5 text-xs">{roles.map((role) => <option key={role} value={role}>{labelRole(role)}</option>)}</select><button onClick={() => void removeMember(member)} className="rounded-lg border border-glass-border px-2 py-1.5 text-xs text-danger hover:bg-danger/5">Remove</button></div>}</div>)}</div> : <p className="rounded-xl bg-base px-4 py-6 text-center text-sm text-ink-muted">Your team member list is empty.</p>}
                  </section>

                  <section className="rounded-2xl border border-glass-border bg-base-raised p-5 sm:p-7">
                    <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Connected MAX products</h2><p className="mt-1 text-sm text-ink-muted">Apps authorized for this business context.</p></div><span className="rounded-full bg-glass-hover px-2.5 py-1 text-xs">{apps.length} connected</span></div>
                    {apps.length ? <div className="divide-y divide-glass-border">{apps.map((app) => <div key={app.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-glass-hover"><Building2 className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{app.client.name}</p><p className="mt-1 text-xs text-ink-muted">Connected by {app.authorizedBy.displayName || app.authorizedBy.username} · {formatDate(app.connectedAt)}</p><div className="mt-2 flex flex-wrap gap-1.5">{app.scopes.filter((scope) => scope.startsWith("business:")).map((scope) => <span key={scope} className="rounded-md bg-glass-hover px-2 py-1 text-[10px] text-ink-muted">{scope}</span>)}</div></div>{canManage && <button onClick={() => void disconnectApp(app)} className="self-start rounded-lg border border-glass-border px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/5">Disconnect</button>}</div>)}</div> : <p className="rounded-xl bg-base px-4 py-6 text-center text-sm text-ink-muted">No MAX products are connected yet. Use “Connect MAX Hotels” above to authorize the first product.</p>}
                  </section>

                  {canManage && <section className="rounded-2xl border border-glass-border bg-base-raised p-5 sm:p-7"><h2 className="text-lg font-semibold">Recent business activity</h2><p className="mt-1 text-sm text-ink-muted">Sensitive membership and ownership actions are recorded here.</p>{logs.length ? <div className="mt-4 divide-y divide-glass-border">{logs.slice(0, 8).map((log) => <div key={log.id} className="flex flex-wrap justify-between gap-2 py-3"><span className="text-sm">{log.action.toLowerCase().replace(/_/g, " ")}</span><span className="text-xs text-ink-muted">{formatDate(log.createdAt)}</span></div>)}</div> : <p className="mt-4 text-sm text-ink-muted">No activity has been recorded yet.</p>}</section>}
                </>
              ) : (
                <section className="rounded-2xl border border-dashed border-glass-border bg-base-raised p-10 text-center"><Building2 className="mx-auto h-8 w-8 text-ink-faint" /><h2 className="mt-4 text-xl font-semibold">Start with a business identity</h2><p className="mt-2 text-sm text-ink-muted">Create a business to manage its profile and team.</p><Button className="mt-5" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create a business</Button></section>
              )}
            </div>
          </div>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-muted"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Role-based access</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Auditable team changes</span><span>© {new Date().getFullYear()} The Tron Forge Limited</span></div>
      </main>
      <SiteFooter />
    </div>
  );
}
