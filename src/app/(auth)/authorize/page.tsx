"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { authApi } from "@/lib/api/auth";

const scopeLabel = (scope: string) => {
  switch (scope) {
    case "openid": return "Your MAX account identity";
    case "identity:read": return "Your MAX user ID";
    case "profile:read":
    case "profile": return "Your basic profile information";
    case "email:read":
    case "email": return "Your email address";
    case "memory:read": return "Your MAX Memory approved for this app";
    case "offline_access": return "Keep you signed in with a refresh token";
    default: return scope.replace(/[:_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
};

export default function AuthorizePage() {
  const { user, isLoading } = useAuth();
  const [params, setParams] = useState<URLSearchParams | null>(null);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setParams(new URLSearchParams(window.location.search)), []);

  const clientName = params?.get("client_name") || "MAX application";
  const clientLogo = params?.get("client_logo") || "/logo.png";
  const clientWebsite = params?.get("client_website") || "";
  const clientId = params?.get("client_id") || "";
  const redirectUri = params?.get("redirect_uri") || "";
  const scopes = useMemo(() => (params?.get("scope") || "openid profile:read email:read").split(" ").filter(Boolean), [params]);
  const state = params?.get("state") || undefined;
  const codeChallenge = params?.get("code_challenge") || undefined;
  const codeChallengeMethod = params?.get("code_challenge_method") || undefined;
  const requestToken = params?.get("request_token") || undefined;
  const returnTo = typeof window === "undefined" ? "/authorize" : `${window.location.pathname}${window.location.search}`;
  useEffect(() => { if (params) document.title = `Sign in with ${clientName}`; }, [clientName, params]);

  const approve = async () => {
    if (!clientId || !redirectUri || !requestToken) return;
    setApproving(true); setError(null);
    try { const result = await authApi.approveOAuth({ clientId, redirectUri, scopes: scopes.join(" "), codeChallenge, codeChallengeMethod, state, requestToken }); window.location.assign(result.redirectUri); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to authorize this application."); setApproving(false); }
  };

  if (!params || isLoading) return <main className="min-h-screen bg-[#f8f9fa] dark:bg-[#202124]" />;
  return <main className="min-h-screen bg-[#f8f9fa] px-4 py-8 text-[#202124] dark:bg-[#202124] dark:text-[#e8eaed] sm:py-12"><div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[450px] items-center justify-center"><section className="w-full rounded-[16px] border border-[#dadce0] bg-white px-7 py-9 shadow-sm dark:border-[#5f6368] dark:bg-[#292a2d] sm:px-10 sm:py-10">
    <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#dadce0] bg-white dark:border-[#5f6368]"><img src={clientLogo} alt="" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.src = "/logo.png"; }} /></div><h1 className="mt-5 text-[24px] font-normal tracking-[-0.01em]">Sign in with MAX</h1><p className="mt-2 text-[15px] leading-6 text-[#5f6368] dark:text-[#bdc1c6]">Continue to <span className="font-medium text-[#202124] dark:text-[#e8eaed]">{clientName}</span></p>{clientWebsite ? <a href={clientWebsite} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-[#5f6368] hover:underline dark:text-[#bdc1c6]">View application</a> : null}</div>
    {!user ? <div className="mt-8"><Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="group flex w-full items-center gap-3 rounded-[8px] border border-[#dadce0] bg-white px-3 py-3 text-left transition-colors hover:bg-[#f8f9fa] dark:border-[#5f6368] dark:bg-transparent dark:hover:bg-[#303134]"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4] dark:bg-[#3c4043]"><img src="/logo.png" alt="" className="h-7 w-7 rounded-full object-contain" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">Choose a MAX Account</p><p className="mt-0.5 truncate text-sm text-[#5f6368] dark:text-[#bdc1c6]">Sign in or use another account</p></div><ChevronRight className="h-5 w-5 text-[#5f6368]" /></Link><p className="mt-7 text-center text-xs leading-5 text-[#5f6368] dark:text-[#bdc1c6]">MAX Auth keeps your password private and only shares the information you approve.</p></div> : <div className="mt-8">
      <button type="button" onClick={approve} disabled={approving || !requestToken} className="group flex w-full items-center gap-3 rounded-[8px] border border-[#dadce0] bg-white px-3 py-3 text-left transition-colors hover:bg-[#f8f9fa] disabled:cursor-wait disabled:opacity-70 dark:border-[#5f6368] dark:bg-transparent dark:hover:bg-[#303134]"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f1f3f4] dark:bg-[#3c4043]">{user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-10 w-10 object-cover" /> : <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.displayName || user.username}</p><p className="truncate text-sm text-[#5f6368] dark:text-[#bdc1c6]">{user.email}</p></div><ChevronRight className="h-5 w-5 text-[#5f6368] transition-transform group-hover:translate-x-0.5" /></button>
      {approving && <p className="mt-3 text-center text-xs text-[#5f6368] dark:text-[#bdc1c6]">Signing you in securely…</p>}
      <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="mt-3 flex w-full items-center justify-center rounded-[8px] px-3 py-2.5 text-sm font-medium text-[#0b57d0] hover:bg-[#f1f3f4] dark:text-[#8ab4f8] dark:hover:bg-[#303134]">Use another MAX Account</Link>
      <div className="mt-7 border-t border-[#dadce0] pt-6 dark:border-[#5f6368]"><p className="text-sm font-medium">{clientName} will be able to:</p><div className="mt-4 space-y-3">{scopes.map((scope) => <div key={scope} className="flex items-start gap-3 text-sm text-[#3c4043] dark:text-[#e8eaed]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1e8e3e] dark:text-[#81c995]" /><span>{scopeLabel(scope)}</span></div>)}</div></div>
      <div className="mt-7 flex items-start gap-3 rounded-[8px] bg-[#f8f9fa] p-3 text-xs leading-5 text-[#5f6368] dark:bg-[#303134] dark:text-[#bdc1c6]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><span>You can review or remove this access later from your MAX Account settings.</span></div>
      {error && <p className="mt-4 text-sm text-[#d93025] dark:text-[#f28b82]">{error}</p>}
      <div className="mt-7 flex items-center justify-between gap-4"><Link href={redirectUri || "/"} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0b57d0] hover:underline dark:text-[#8ab4f8]"><ArrowLeft className="h-4 w-4" />Cancel</Link><button type="button" onClick={approve} disabled={approving || !requestToken} className="rounded-[8px] bg-[#0b57d0] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0842a0] disabled:cursor-wait disabled:opacity-60 dark:bg-[#a8c7fa] dark:text-[#062e6f] dark:hover:bg-[#8ab4f8]">{approving ? "Continuing…" : "Continue"}</button></div>
    </div>}
  </section></div></main>;
}
