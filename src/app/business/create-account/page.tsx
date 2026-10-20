"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, CircleAlert, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";

type FormValues = {
  organisationName: string;
  displayName: string;
  address: string;
  email: string;
  phone: string;
  country: string;
  businessType: string;
  registrationNumber: string;
  websiteUrl: string;
  description: string;
};

const initialValues: FormValues = {
  organisationName: "",
  displayName: "",
  address: "",
  email: "",
  phone: "",
  country: "NG",
  businessType: "Company",
  registrationNumber: "",
  websiteUrl: "",
  description: "",
};

const fieldClass = "mt-1.5 w-full rounded-xl border border-glass-border bg-base px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10";
const labelClass = "block text-sm font-medium text-ink";

export default function BusinessCreateAccountPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "organisationName" && !current.displayName ? { displayName: value } : {}),
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    const displayName = form.displayName.trim() || form.organisationName.trim();
    const handle = displayName.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
    try {
      await apiClient.post("/businesses", {
        legalName: form.organisationName.trim(),
        displayName,
        ...(handle.length >= 3 ? { handle } : {}),
        address: form.address.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country,
        businessType: form.businessType,
        ...(form.registrationNumber.trim() ? { registrationNumber: form.registrationNumber.trim() } : {}),
        ...(form.websiteUrl.trim() ? { websiteUrl: form.websiteUrl.trim() } : {}),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      });
      router.push("/business?created=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create this business account. Check the details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link href="/business" className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to MAX Auth for Businesses
        </Link>
        <div className="mx-auto mt-7 grid max-w-4xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <section className="pt-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><Building2 className="h-6 w-6" /></span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">MAX Auth for Businesses</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Create your business account.</h1>
            <p className="mt-4 text-sm leading-6 text-ink-muted">Register your organisation separately from your personal MAX Account. Your business identity can then be connected to MAX products, services, and team members.</p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-glass-border bg-base-raised p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div><p className="text-sm font-semibold">Your personal account stays yours</p><p className="mt-1 text-xs leading-5 text-ink-muted">Sign in with your existing MAX Account to become the first owner. The organisation details below create a distinct business identity.</p></div>
            </div>
          </section>

          <section className="rounded-3xl border border-glass-border bg-base-raised p-5 shadow-sm sm:p-7">
            {authLoading ? (
              <p className="py-8 text-center text-sm text-ink-muted">Checking your MAX Account…</p>
            ) : !isAuthenticated ? (
              <div className="py-5 text-center">
                <h2 className="text-xl font-semibold">Sign in to continue</h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">A personal MAX Account is required to own and manage a business identity.</p>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/sign-in"><Button>Sign in to MAX <ArrowRight className="h-4 w-4" /></Button></Link>
                  <Link href="/create-account"><Button variant="secondary">Create personal account</Button></Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6"><h2 className="text-xl font-semibold">Organisation details</h2><p className="mt-1 text-sm text-ink-muted">Fields marked required are needed to register.</p></div>
                {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-3 text-sm text-danger"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass + " sm:col-span-2"}>Organisation name *
                    <input required minLength={2} maxLength={180} autoComplete="organization" value={form.organisationName} onChange={(e) => update("organisationName", e.target.value)} placeholder="Registered organisation or business name" className={fieldClass} />
                  </label>
                  <label className={labelClass + " sm:col-span-2"}>Business address *
                    <textarea required minLength={5} maxLength={500} autoComplete="street-address" rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, building, city and state" className={fieldClass + " resize-y"} />
                  </label>
                  <label className={labelClass}>Business email *
                    <input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@organisation.com" className={fieldClass} />
                  </label>
                  <label className={labelClass}>Business phone *
                    <input required type="tel" minLength={7} maxLength={40} autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+234…" className={fieldClass} />
                  </label>
                  <label className={labelClass}>Country *
                    <select required value={form.country} onChange={(e) => update("country", e.target.value)} className={fieldClass}><option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="OT">Other</option></select>
                  </label>
                  <label className={labelClass}>Organisation type *
                    <select required value={form.businessType} onChange={(e) => update("businessType", e.target.value)} className={fieldClass}><option value="Company">Company</option><option value="Sole proprietor">Sole proprietor</option><option value="Partnership">Partnership</option><option value="Non-profit">Non-profit</option><option value="Government">Government</option><option value="Educational institution">Educational institution</option><option value="Hotel">Hotel</option><option value="Other">Other</option></select>
                  </label>
                  <label className={labelClass}>Public name in MAX
                    <input maxLength={120} value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Defaults to organisation name" className={fieldClass} />
                  </label>
                  <label className={labelClass}>Business registration number <span className="font-normal text-ink-muted">(optional)</span>
                    <input maxLength={120} value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} placeholder="CAC or local registration number" className={fieldClass} />
                  </label>
                  <label className={labelClass + " sm:col-span-2"}>Website <span className="font-normal text-ink-muted">(optional)</span>
                    <input type="url" maxLength={2048} value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://example.com" className={fieldClass} />
                  </label>
                  <label className={labelClass + " sm:col-span-2"}>What does your organisation do? <span className="font-normal text-ink-muted">(optional)</span>
                    <textarea rows={3} maxLength={2000} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="A short description of your organisation" className={fieldClass + " resize-y"} />
                  </label>
                  <div className="pt-2 sm:col-span-2"><Button type="submit" isLoading={loading} disabled={loading} className="w-full" size="lg">{loading ? "Creating business account…" : "Create business account"} <ArrowRight className="h-4 w-4" /></Button><p className="mt-3 text-center text-xs leading-5 text-ink-muted">After registration, MAX will send a verification link to the business email address.</p></div>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
