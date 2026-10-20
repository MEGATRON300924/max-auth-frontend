"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Plus, ArrowRight, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/ApiError";

type BusinessRecord = {
  id: string;
  businessId: string;
  handle: string;
  legalName: string;
  displayName: string;
  country: string;
  businessType: string;
  status: string;
  verificationStatus: string;
  role: string;
  createdAt: string;
};

export default function BusinessDashboardPage() {
  const { isAuthenticated } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBusinesses() {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.get<{ businesses: BusinessRecord[] }>("/businesses");
      setBusinesses(data.businesses);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your business accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadBusinesses(); }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand-600 dark:text-brand-400">MAX Auth for Businesses</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Your business accounts</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">Manage the business identities connected to your MAX account.</p></div>
          <Link href="/businesses/register"><Button><Plus className="h-4 w-4" /> Create business</Button></Link>
        </div>

        {!isAuthenticated ? (
          <div className="mt-8 rounded-2xl border border-glass-border bg-base-raised p-8 text-center">
            <Building2 className="mx-auto h-9 w-9 text-brand-600 dark:text-brand-400" />
            <h2 className="mt-4 text-lg font-bold">Sign in to view your businesses</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">Business accounts are linked to your personal MAX identity. Sign in to see the businesses you own or belong to.</p>
            <div className="mt-5"><Link href="/sign-in"><Button>Sign in with MAX <ArrowRight className="h-4 w-4" /></Button></Link></div>
          </div>
        ) : loading ? (
          <div className="mt-8 rounded-2xl border border-glass-border bg-base-raised p-8 text-center text-sm text-ink-muted">Loading your business accounts…</div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
            <p className="text-sm font-semibold">Could not load business accounts</p><p className="mt-2 text-sm text-ink-muted">{error}</p>
            <div className="mt-4"><Button variant="secondary" onClick={() => void loadBusinesses()}><RefreshCw className="h-4 w-4" /> Try again</Button></div>
          </div>
        ) : businesses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-glass-border bg-base-raised p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-glass-border bg-base text-brand-600 dark:text-brand-400"><Building2 className="h-7 w-7" /></div>
            <h2 className="mt-5 text-lg font-bold">Your first business starts here</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">Create a business identity to establish its profile and become its first owner. Team management and product connections will be added in later stages.</p>
            <div className="mt-5"><Link href="/businesses/register"><Button>Create business identity <ArrowRight className="h-4 w-4" /></Button></Link></div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {businesses.map((business) => (
              <article key={business.businessId} className="rounded-2xl border border-glass-border bg-base-raised p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-glass-border bg-base text-brand-600 dark:text-brand-400"><Building2 className="h-5 w-5" /></div><span className="rounded-full border border-glass-border px-2.5 py-1 text-xs font-semibold">{business.verificationStatus.toLowerCase()}</span></div>
                <h2 className="mt-5 text-lg font-bold">{business.displayName}</h2><p className="mt-1 text-sm text-ink-muted">@{business.handle} · {business.country}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-base p-3"><div><p className="text-xs text-ink-faint">Your role</p><p className="mt-1 text-sm font-semibold">{business.role.toLowerCase().replace("_", " ")}</p></div><div><p className="text-xs text-ink-faint">Account status</p><p className="mt-1 text-sm font-semibold">{business.status.toLowerCase()}</p></div></div>
                <p className="mt-4 break-all font-mono text-xs text-ink-faint">{business.businessId}</p><div className="mt-5"><Link href={`/businesses/dashboard/${encodeURIComponent(business.businessId)}`}><Button variant="secondary">Open workspace <ArrowRight className="h-4 w-4" /></Button></Link></div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
