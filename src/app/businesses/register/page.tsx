"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/ApiError";

type BusinessRecord = {
  businessId: string;
  handle: string;
  displayName: string;
  verificationStatus: string;
};

export default function RegisterBusinessPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [businessType, setBusinessType] = useState("company");
  const [country, setCountry] = useState("NG");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<BusinessRecord | null>(null);

  const handleChange = (value: string) => {
    setHandle(value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").replace(/--+/g, "-"));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    setLoading(true);
    try {
      const result = await apiClient.post<{ business: BusinessRecord }>("/businesses", {
        legalName: legalName.trim(),
        displayName: displayName.trim(),
        handle,
        businessType,
        country,
        businessEmail: businessEmail.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(website.trim() ? { website: website.trim() } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      setCreated(result.business);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't create the business account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <main className="aurora-canvas px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/businesses" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Business accounts</Link>
          <div className="mt-6 rounded-3xl border border-glass-border bg-base-raised/95 p-5 shadow-xl sm:p-9">
            {created ? (
              <div className="py-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></div>
                <h1 className="mt-5 font-display text-3xl font-bold">Business identity created</h1>
                <p className="mt-3 text-sm leading-6 text-ink-muted">Your business profile has been saved. Its verification status is currently {created.verificationStatus.toLowerCase()}; this does not mean the business has been legally verified.</p>
                <div className="mt-6 rounded-xl border border-glass-border bg-base p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Business ID</p>
                  <p className="mt-2 break-all font-mono text-sm">{created.businessId}</p>
                  <p className="mt-3 text-sm text-ink-muted">Business handle: <span className="font-semibold text-ink">@{created.handle}</span></p>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => router.push("/businesses/dashboard")}>Open business workspace</Button>
                  <Link href="/businesses"><Button variant="secondary">Business overview</Button></Link>
                </div>
                <p className="mt-4 text-xs text-ink-faint">You can invite team members and manage roles from the business workspace. Verification review and product connections are separate release steps.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-glass-border bg-base text-brand-600 dark:text-brand-400"><Building2 className="h-6 w-6" /></div>
                  <div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand-600 dark:text-brand-400">MAX Auth for Businesses</p><h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Create a business identity</h1></div>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink-muted">Use your personal MAX account to establish a business profile. You will be recorded as its owner.</p>
                {!isAuthenticated && <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">You need to sign in with MAX before submitting this form. Your entries will remain on this page only until you navigate away.</div>}
                {error && <div className="mt-5"><Alert variant="danger" title="Couldn't create business">{error}</Alert></div>}
                <form onSubmit={submit} className="mt-7 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">Legal business name<input required maxLength={160} value={legalName} onChange={(event) => setLegalName(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal outline-none focus:border-brand-500" placeholder="Registered or trading name" /></label>
                    <label className="block text-sm font-semibold">Display name<input required maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal outline-none focus:border-brand-500" placeholder="Name shown across MAX" /></label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">Business handle<input required minLength={3} maxLength={48} value={handle} onChange={(event) => handleChange(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-mono font-normal outline-none focus:border-brand-500" placeholder="your-company" /><span className="mt-1 block text-xs font-normal text-ink-faint">Lowercase letters, numbers and hyphens.</span></label>
                    <label className="block text-sm font-semibold">Business type<select required value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal"><option value="company">Company</option><option value="sole-proprietorship">Sole proprietorship</option><option value="partnership">Partnership</option><option value="nonprofit">Non-profit</option><option value="hotel">Hotel / hospitality</option><option value="other">Other</option></select></label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">Country code<input required minLength={2} maxLength={2} value={country} onChange={(event) => setCountry(event.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal outline-none focus:border-brand-500" placeholder="NG" /></label>
                    <label className="block text-sm font-semibold">Business email<input required type="email" maxLength={255} value={businessEmail} onChange={(event) => setBusinessEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal outline-none focus:border-brand-500" placeholder="business@example.com" /></label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">Phone number <span className="font-normal text-ink-faint">(optional)</span><input type="tel" maxLength={32} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal outline-none focus:border-brand-500" placeholder="+234 ..." /></label>
                    <label className="block text-sm font-semibold">Website <span className="font-normal text-ink-faint">(optional)</span><input type="url" maxLength={2048} value={website} onChange={(event) => setWebsite(event.target.value)} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal outline-none focus:border-brand-500" placeholder="https://example.com" /></label>
                  </div>
                  <label className="block text-sm font-semibold">Business description <span className="font-normal text-ink-faint">(optional)</span><textarea maxLength={1000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full resize-y rounded-xl border border-glass-border bg-base px-3.5 py-3 font-normal outline-none focus:border-brand-500" placeholder="What does your business do?" /></label>
                  <div className="rounded-xl border border-glass-border bg-base p-4 text-xs leading-5 text-ink-muted">Creating a business identity does not automatically verify the legal entity, activate paid services, or grant access to connected MAX products.</div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Button type="submit" disabled={loading}>{loading ? "Creating business…" : isAuthenticated ? "Create business identity" : "Sign in to continue"}</Button><Link href="/businesses" className="text-center text-sm font-semibold text-ink-muted hover:text-ink">Cancel</Link></div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
