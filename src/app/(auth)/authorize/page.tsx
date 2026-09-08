"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Lock, ShieldCheck } from "lucide-react";
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
    setApproving(true); setError(null);
    try { const result = await authApi.approveOAuth({ clientId, redirectUri, scopes: scopes.join(" "), codeChallenge, codeChallengeMethod, state }); window.location.assign(result.redirectUri); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to authorize this application."); setApproving(false); }
  };

  if (!params || isLoading) return <main className="min-h-screen bg-base px-4 py-10 text-ink" />;

  return <main className="min-h-screen bg-base px-4 py-10 text-ink sm:px-6"><div className="mx-auto max-w-xl"><div className="mb-6 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5"><ShieldCheck className="h-7 w-7 text-brand-300" /></div><p className="mt-4 text-xs font-semibold uppercase tracking-[.2em] text-brand-300">MAX Auth</p><h1 className="mt-2 font-display text-3xl font-semibold">Continue with MAX</h1><p className="mt-2 text-sm text-ink-muted">Sign in once and securely continue to your MAX application.</p></div>
    <AuthFeatureShell eyebrow="Authorization" title={clientName} description="Review the information this application is requesting before continuing."><GlassCard>
      {!user ? <div className="space-y-4"><p className="text-sm text-ink-muted">You need to sign in to your MAX Account before granting access.</p><Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="block rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-400">Continue with MAX</Link></div> : <>
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><Lock className="h-5 w-5" /></div><div><p className="font-medium">{user.displayName || user.username}</p><p className="text-xs text-ink-muted">{user.email}</p></div></div>
        <div className="mt-5 space-y-2">{scopes.map((scope) => <div key={scope} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[.025] p-3 text-sm"><Check className="h-4 w-4 text-success" />{scope === "profile:read" ? "Your basic MAX profile" : scope === "email:read" ? "Your verified email address" : scope}</div>)}</div>
        <div className="mt-5 flex items-center gap-2"><StatusPill tone="success">Secure MAX authorization</StatusPill><span className="text-xs text-ink-faint">Your password is never shared with the application.</span></div>
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => window.location.assign(redirectUri)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10">Cancel</button><button disabled={approving} onClick={approve} className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-400 disabled:opacity-60">{approving ? "Connecting…" : "Allow access"}</button></div>
      </>}
    </GlassCard></AuthFeatureShell>
  </div></main>;
}
