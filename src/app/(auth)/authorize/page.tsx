"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, UserRound } from "lucide-react";
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
    <main className="min-h-screen bg-base px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg flex-col justify-center">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-glass-border bg-base-raised p-2 shadow-sm">
            <img src="/logo.png" alt="MAX AI" className="h-full w-full rounded-xl object-contain" />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[.18em] text-brand-600 dark:text-brand-400">MAX Account</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Choose an account</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">Select the MAX Account you want to use to continue to {clientName}.</p>
        </div>

        <AuthFeatureShell eyebrow="Secure authorization" title={clientName} description="You control which MAX Account is connected. Your password is never shared with the application.">
          <GlassCard>
            {!user ? (
              <div className="space-y-4">
                <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="group flex w-full items-center gap-3 rounded-2xl border border-glass-border bg-base p-4 text-left transition-colors hover:bg-base-raised-strong">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 p-2 dark:bg-brand-500/15"><UserRound className="h-5 w-5 text-brand-700 dark:text-brand-300" /></div>
                  <div className="min-w-0 flex-1"><p className="font-semibold text-ink">Sign in with a MAX Account</p><p className="mt-0.5 text-sm text-ink-muted">Choose an account or use another one.</p></div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
                <div className="flex items-center justify-center gap-2 text-xs text-ink-faint"><ShieldCheck className="h-4 w-4" />Secure authentication by MAX Auth</div>
              </div>
            ) : (
              <>
                <button type="button" onClick={approve} disabled={approving} className="group w-full rounded-2xl border border-brand-200 bg-brand-50 p-4 text-left transition-colors hover:bg-brand-100 disabled:cursor-wait disabled:opacity-70 dark:border-brand-500/20 dark:bg-brand-500/10 dark:hover:bg-brand-500/15">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" /> : <img src="/logo.png" alt="" className="h-12 w-12 shrink-0 rounded-full object-contain" />}
                    <div className="min-w-0 flex-1"><p className="text-xs font-medium text-ink-muted">Continue as</p><p className="truncate font-semibold text-ink">{user.displayName || user.username}</p><p className="truncate text-sm text-ink-muted">{user.email}</p></div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5 dark:text-brand-400" />
                  </div>
                  {approving && <p className="mt-3 text-xs font-medium text-brand-700 dark:text-brand-300">Connecting securely…</p>}
                </button>
                <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"><UserRound className="h-4 w-4" />Use another MAX Account</Link>

                <div className="mt-6 border-t border-glass-border pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-ink-faint">This app can access</p>
                  <div className="mt-3 space-y-2">
                    {scopes.map((scope) => (
                      <div key={scope} className="flex items-center gap-3 rounded-xl border border-glass-border bg-base p-3 text-sm font-medium">
                        <Check className="h-4 w-4 shrink-0 text-success" />
                        {scope === "profile:read" || scope === "profile" ? "Your basic MAX profile" : scope === "email:read" || scope === "email" ? "Your verified email address" : scope}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2"><StatusPill tone="success">Secure MAX authorization</StatusPill><span className="text-xs text-ink-faint">Password stays with MAX Auth.</span></div>
                {error && <p className="mt-4 text-sm text-danger">{error}</p>}
                <button type="button" onClick={() => window.location.assign(redirectUri)} className="mt-5 w-full rounded-xl border border-glass-border bg-base-raised px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-glass-hover">Cancel</button>
              </>
            )}
          </GlassCard>
        </AuthFeatureShell>
      </div>
    </main>
  );
}
