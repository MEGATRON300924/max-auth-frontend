"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { AuthFeatureShell, GlassCard, StatusPill } from "@/components/auth/AuthFeatureShell";
import { useAuth } from "@/lib/auth/useAuth";
import { authApi } from "@/lib/api/auth";

export default function AuthorizePage() {
  const { user, isLoading } = useAuth();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setParams(new URLSearchParams(window.location.search)), []);

  const clientName = params?.get("client_name") || "MAX application";
  const clientId = params?.get("client_id") || "";
  const redirectUri = params?.get("redirect_uri") || "";
  const scopes = useMemo(() => (params?.get("scope") || "profile:read email:read").split(" ").filter(Boolean), [params]);
  const state = params?.get("state") || undefined;
  const codeChallenge = params?.get("code_challenge") || undefined;
  const codeChallengeMethod = params?.get("code_challenge_method") || undefined;
  const returnTo = typeof window === "undefined" ? "/authorize" : `${window.location.pathname}${window.location.search}`;

  const approve = async () => {
    if (!clientId || !redirectUri) return;
    setApproving(true);
    setError(null);
    try {
      const result = await authApi.approveOAuth({ clientId, redirectUri, scopes: scopes.join(" "), codeChallenge, codeChallengeMethod, state });
      window.location.assign(result.redirectUri);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authorize this application.");
      setApproving(false);
    }
  };

  if (!params || isLoading) return <main className="min-h-screen bg-base" />;

  return (
    <main className="min-h-screen bg-base px-4 py-10 text-ink sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-glass-border bg-base-raised">
            <ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[.18em] text-brand-600 dark:text-brand-400">MAX Auth</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Continue with MAX</h1>
          <p className="mt-2 text-sm text-ink-muted">Securely continue to {clientName} with your MAX Account.</p>
        </div>

        <AuthFeatureShell eyebrow="Authorization" title={clientName} description="Choose the MAX Account you want to use and review what this application can access.">
          <GlassCard>
            {!user ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-glass-border bg-base-raised p-4 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-glass-border bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    <span className="text-xl font-bold">M</span>
                  </div>
                  <p className="mt-3 font-semibold text-ink">Sign in with MAX</p>
                  <p className="mt-1 text-sm text-ink-muted">Choose an existing MAX Account or use another account.</p>
                </div>
                <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="block rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700">Choose a MAX Account</Link>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-glass-border bg-base-raised p-4">
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-ink-faint">Signed in as</p>
                  <div className="mt-3 flex items-center gap-3">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">{(user.displayName || user.username || "M").charAt(0).toUpperCase()}</div>}
                    <div className="min-w-0"><p className="truncate font-semibold text-ink">{user.displayName || user.username}</p><p className="truncate text-sm text-ink-muted">{user.email}</p></div>
                  </div>
                  <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="mt-4 block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">Use another MAX Account</Link>
                </div>
                <div className="mt-5 space-y-2">
                  {scopes.map((scope) => (
                    <div key={scope} className="flex items-center gap-3 rounded-lg border border-glass-border bg-base p-3 text-sm font-medium">
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {scope === "profile:read" ? "Your basic MAX profile" : scope === "email:read" ? "Your verified email address" : scope}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2"><StatusPill tone="success">Secure MAX authorization</StatusPill><span className="text-xs text-ink-faint">Your password is never shared with the application.</span></div>
                {error && <p className="mt-4 text-sm text-danger">{error}</p>}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button onClick={() => window.location.assign(redirectUri)} className="rounded-lg border border-glass-border bg-base-raised px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-glass-hover">Cancel</button>
                  <button disabled={approving} onClick={approve} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60">{approving ? "Connecting…" : "Continue"}</button>
                </div>
              </>
            )}
          </GlassCard>
        </AuthFeatureShell>
      </div>
    </main>
  );
}
