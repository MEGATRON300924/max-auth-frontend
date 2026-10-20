"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, MailCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/ApiError";

type AcceptedBusiness = { businessId: string; displayName: string; handle: string };

export default function AcceptBusinessInvitationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [business, setBusiness] = useState<AcceptedBusiness | null>(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    if (!value || !/^[a-f0-9]{64}$/.test(value)) setError("This invitation link is missing a valid invitation token.");
  }, []);

  async function accept() {
    setLoading(true); setError("");
    try {
      const result = await apiClient.post<{ accepted: boolean; business: AcceptedBusiness; role: string }>("/businesses/invitations/accept", { token });
      setBusiness(result.business); setRole(result.role);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't accept this invitation. Check that you're signed in with the invited email address.");
    } finally { setLoading(false); }
  }

  const signInUrl = `/sign-in?returnTo=${encodeURIComponent(`/businesses/accept-invitation?token=${encodeURIComponent(token)}`)}`;

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <main className="aurora-canvas min-h-[70vh] px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-glass-border bg-base-raised p-6 shadow-xl sm:p-9">
          {business ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></div>
              <h1 className="mt-5 font-display text-3xl font-bold">You're in!</h1>
              <p className="mt-3 text-sm leading-6 text-ink-muted">You have joined <strong className="text-ink">{business.displayName}</strong> as {role.toLowerCase().replace("_", " ")}.</p>
              <p className="mt-2 text-sm text-ink-muted">Your MAX account now has access to this business identity.</p>
              <div className="mt-6"><Button onClick={() => router.push(`/businesses/dashboard/${encodeURIComponent(business.businessId)}`)}>Open business workspace</Button></div>
            </div>
          ) : (
            <>
              <Link href="/businesses" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> MAX Auth for Businesses</Link>
              <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-glass-border bg-base text-brand-600 dark:text-brand-400"><MailCheck className="h-6 w-6" /></div>
              <h1 className="mt-5 font-display text-3xl font-bold">Accept business invitation</h1>
              <p className="mt-3 text-sm leading-6 text-ink-muted">Accepting this invitation connects your personal MAX account to the business. For security, you must be signed in with the email address that received the invitation and have a verified MAX email.</p>
              {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm">{error}</div>}
              {!isAuthenticated ? (
                <div className="mt-6"><Link href={signInUrl}><Button>Sign in with MAX</Button></Link></div>
              ) : (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button onClick={() => void accept()} disabled={!token || !/^[a-f0-9]{64}$/.test(token) || loading}>{loading ? "Accepting invitation…" : "Accept invitation"}</Button><Link href="/businesses/dashboard"><Button variant="secondary">Cancel</Button></Link></div>
              )}
              <p className="mt-5 text-xs leading-5 text-ink-faint">Invitation links expire after seven days and can only be used once. If the invitation was sent to another email address, switch to that MAX account first.</p>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
