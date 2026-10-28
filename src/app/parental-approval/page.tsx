"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, UserRound, UsersRound, XCircle } from "lucide-react";
import { authApi, type ParentalConsentDetails } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/ApiError";
import { useAuth } from "@/lib/auth/useAuth";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type View = "loading" | "choose" | "no-account" | "complete-account" | "recommendation" | "error";

export default function ParentalApprovalPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [token, setToken] = useState("");
  const [details, setDetails] = useState<ParentalConsentDetails | null>(null);
  const [view, setView] = useState<View>("loading");
  const [guardianConfirmed, setGuardianConfirmed] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    if (!value) {
      setError("This approval link is missing its secure token. Open the original email link again.");
      setView("error");
      return;
    }
    authApi.getParentalConsent(value).then((result) => {
      setDetails(result);
      setView("choose");
    }).catch((err: unknown) => {
      setError(err instanceof ApiError ? err.message : "We couldn't verify this approval link. Please open the original email link again.");
      setView("error");
    });
  }, []);

  const signInAsGuardian = () => {
    const returnTo = "/parental-approval?token=" + encodeURIComponent(token);
    router.push("/sign-in?returnTo=" + encodeURIComponent(returnTo));
  };

  const switchAccount = async () => {
    setLoadingAction(true);
    try {
      await logout();
      signInAsGuardian();
    } catch {
      setError("We couldn't sign out the current account. Please sign out and open the approval link again.");
    } finally {
      setLoadingAction(false);
    }
  };

  const approve = async (withAccount: boolean) => {
    setError("");
    setLoadingAction(true);
    try {
      if (withAccount) await authApi.approveParentalConsentWithAccount(token);
      else await authApi.approveParentalConsent(token);
      setView(withAccount ? "complete-account" : "recommendation");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Approval could not be completed. Please try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  const decline = async () => {
    setError("");
    setLoadingAction(true);
    try {
      await authApi.declineParentalConsent(token);
      setError("You declined this request. The child's MAX account will remain unavailable.");
      setView("error");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't record your decision. Please try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <main className="min-h-screen bg-base px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-3" aria-label="MAX Auth home">
          <img src="/logo.png" alt="MAX Auth" width={42} height={42} className="rounded-xl" />
          <span className="text-sm font-semibold tracking-tight">MAX Auth <span className="font-normal text-ink-muted">· Family approval</span></span>
        </Link>

        <section className="w-full rounded-3xl border border-glass-border bg-base-raised p-6 shadow-sm sm:p-9">
          {view === "loading" && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <p className="text-sm text-ink-muted">Checking your secure approval link…</p>
            </div>
          )}

          {view === "choose" && details && (
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500"><UsersRound className="h-6 w-6" /></div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">MAX Family</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Do you have a MAX Auth account?</h1>
              <p className="mt-3 text-sm leading-6 text-ink-muted">A young person using the name <strong className="font-semibold text-ink">{details.childName}</strong> has requested a MAX Account and entered your email as their parent or guardian.</p>
              <div className="my-6 flex items-start gap-3 rounded-2xl border border-glass-border bg-base p-4">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-sm font-medium text-ink">This link expires {new Date(details.expiresAt).toLocaleString()}</p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">For your family's security, the link can only be used once. Approve only if you are this child's parent or legal guardian.</p>
                </div>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => isAuthenticated ? void approve(true) : signInAsGuardian()} disabled={loadingAction} className="flex min-h-28 flex-col items-start justify-between rounded-2xl border border-brand-500 bg-brand-500/5 p-4 text-left transition-colors hover:bg-brand-500/10 disabled:opacity-60">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500"><ShieldCheck className="h-5 w-5" /></span>
                  <span><span className="block text-sm font-semibold text-ink">Yes, I have an account</span><span className="mt-1 block text-xs text-ink-muted">{isAuthenticated ? "Continue with my signed-in account" : "Sign in to review and approve"}</span></span>
                </button>
                <button type="button" onClick={() => { setError(""); setView("no-account"); }} className="flex min-h-28 flex-col items-start justify-between rounded-2xl border border-glass-border p-4 text-left transition-colors hover:bg-surface">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-ink-muted"><UserRound className="h-5 w-5" /></span>
                  <span><span className="block text-sm font-semibold text-ink">No, not yet</span><span className="mt-1 block text-xs text-ink-muted">Review the request without creating an account</span></span>
                </button>
              </div>
              {isAuthenticated && <button type="button" onClick={() => void switchAccount()} disabled={loadingAction} className="mt-4 text-sm text-ink-muted underline underline-offset-4 hover:text-ink">Use a different MAX Auth account</button>}
            </div>
          )}

          {view === "no-account" && details && (
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500"><ShieldCheck className="h-6 w-6" /></div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Review the approval request</h1>
              <p className="mt-3 text-sm leading-6 text-ink-muted">You're approving a MAX Account for <strong className="text-ink">{details.childName}</strong>. Creating your own MAX Auth account is optional and is not required to approve this request.</p>
              {error && <Alert variant="danger">{error}</Alert>}
              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-glass-border bg-base p-4">
                <input type="checkbox" checked={guardianConfirmed} onChange={(event) => setGuardianConfirmed(event.target.checked)} className="mt-1 h-4 w-4 rounded border-glass-border text-brand-600 focus:ring-brand-500" />
                <span className="text-sm leading-6 text-ink">I confirm that I am this child's parent or legal guardian, and I consent to their MAX Account being created under the applicable MAX family protections.</span>
              </label>
              <p className="mt-3 text-xs leading-5 text-ink-faint">This approval is recorded against the email link. Access to an email inbox does not independently prove a person's age or legal guardianship.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button className="w-full" size="lg" isLoading={loadingAction} disabled={!guardianConfirmed} onClick={() => void approve(false)}>Approve account <ArrowRight className="h-4 w-4" /></Button>
                <Button className="w-full" size="lg" variant="secondary" isLoading={loadingAction} onClick={() => void decline()}>Decline</Button>
              </div>
              <button type="button" onClick={() => { setError(""); setView("choose"); }} className="mt-4 text-sm text-ink-muted underline underline-offset-4">Go back</button>
            </div>
          )}

          {view === "complete-account" && (
            <div className="py-5 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <h1 className="mt-5 text-2xl font-semibold">Approval complete</h1>
              <p className="mt-3 text-sm leading-6 text-ink-muted">The child's MAX Account has been approved. Your MAX Auth account is linked to this consent record so the family experience can be improved as MAX family tools become available.</p>
              <Link href="/dashboard" className="mt-7 inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Go to MAX Auth</Link>
            </div>
          )}

          {view === "recommendation" && (
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="h-6 w-6" /></div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Approval successful</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Stay connected to their MAX experience</h1>
              <p className="mt-3 text-sm leading-6 text-ink-muted">Your child's MAX Account has been approved! We recommend creating your own MAX Auth account so you can discover the MAX AI Ecosystem, understand the services your child uses, and explore the tools available to your family.</p>
              <div className="my-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-glass-border bg-base p-4">
                  <img src="https://www.max-ai.name.ng/favicon.png" alt="MAX AI" width={42} height={42} className="mb-3 rounded-xl" />
                  <p className="text-sm font-semibold">The MAX AI Ecosystem</p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">Explore the services that work together with MAX Auth.</p>
                </div>
                <div className="rounded-2xl border border-glass-border bg-base p-4">
                  <img src="https://www.max-ai.name.ng/max_home.png" alt="MAX Home" width={42} height={42} className="mb-3 rounded-xl object-contain" />
                  <p className="text-sm font-semibold">MAX Home</p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">Discover family-focused home tools and settings.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/create-account" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">Create MAX Auth account <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-glass-border px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface">Maybe later — continue without an account</Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-ink-faint">Creating an account is optional. This approval does not automatically grant access to the child's private conversations or activity.</p>
            </div>
          )}

          {view === "error" && (
            <div className="py-5 text-center">
              <XCircle className="mx-auto h-14 w-14 text-danger" />
              <h1 className="mt-5 text-2xl font-semibold">We couldn't complete this request</h1>
              <p className="mt-3 text-sm leading-6 text-ink-muted">{error}</p>
              <Link href="/" className="mt-7 inline-flex items-center justify-center rounded-full border border-glass-border px-6 py-3 text-sm font-semibold hover:bg-surface">Return to MAX Auth</Link>
            </div>
          )}
        </section>
        <p className="mt-6 max-w-md text-center text-xs leading-5 text-ink-faint">MAX Auth uses the same account identity across supported MAX services. Parent approval and email verification are separate steps.</p>
      </div>
    </main>
  );
}
