"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, ChevronRight, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/ApiError";

const SCOPE_LABELS: Record<string, { title: string; description: string }> = {
  openid: { title: "Confirm your MAX identity", description: "Let this app know that your MAX account signed in." },
  profile: { title: "Basic profile", description: "Share your MAX display name and username." },
  "profile:read": { title: "Read your profile", description: "Allow this app to read your MAX profile details." },
  email: { title: "Email address", description: "Share the email address associated with your MAX account." },
  "email:read": { title: "Read your email", description: "Allow this app to read your MAX account email address." },
  "account:read": { title: "Account information", description: "Read basic information about your MAX account." },
  "identity:read": { title: "MAX identity", description: "Read your MAX account identifier." },
  "memory:read": { title: "MAX Memory", description: "Read the MAX Memory information you have authorized." },
  offline_access: { title: "Stay connected", description: "Allow this app to refresh its access when you're not actively using it." },
};

function AuthorizeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useMemo(() => ({
    clientId: params.get("client_id") || "",
    clientName: params.get("client_name") || "This application",
    redirectUri: params.get("redirect_uri") || "",
    responseType: params.get("response_type") || "",
    scopes: (params.get("scope") || "").split(/\s+/).filter(Boolean),
    state: params.get("state") || "",
    codeChallenge: params.get("code_challenge") || "",
    codeChallengeMethod: params.get("code_challenge_method") || "",
    requestToken: params.get("request_token") || "",
  }), [params]);

  const validRequest = Boolean(
    request.clientId &&
    request.redirectUri &&
    request.responseType === "code" &&
    request.scopes.length &&
    request.state &&
    request.codeChallenge &&
    request.codeChallengeMethod === "S256" &&
    request.requestToken
  );

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const returnTo = window.location.pathname + window.location.search;
      router.replace(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  const approve = async () => {
    if (!validRequest || isApproving) return;
    setError(null);
    setIsApproving(true);
    try {
      const result = await authApi.approveOAuth({
        clientId: request.clientId,
        redirectUri: request.redirectUri,
        scopes: request.scopes.join(" "),
        codeChallenge: request.codeChallenge,
        codeChallengeMethod: "S256",
        state: request.state,
        requestToken: request.requestToken,
      });
      window.location.assign(result.redirectUri);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't complete this request. Please try again.");
      setIsApproving(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-4 text-[#252b36] dark:bg-[#17191d] dark:text-[#e5e7eb]"><p className="text-sm text-[#667085] dark:text-[#a2a8b3]">Loading your MAX Account…</p></main>;
  }

  if (!validRequest) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-4 py-10 text-[#252b36] dark:bg-[#17191d] dark:text-[#e5e7eb]">
        <section className="w-full max-w-lg rounded-3xl border border-[#e3e7ed] bg-white p-7 shadow-sm dark:border-[#373b44] dark:bg-[#202329] sm:p-9">
          <div className="mb-6 flex items-center gap-3"><img src="/logo.png" alt="MAX" className="h-9 w-9 rounded-xl object-contain" /><span className="text-sm font-semibold text-[#667085] dark:text-[#a2a8b3]">MAX</span></div>
          <h1 className="text-2xl font-semibold tracking-tight">We couldn't verify this request</h1>
          <p className="mt-3 text-sm leading-6 text-[#667085] dark:text-[#a2a8b3]">The authorization link is incomplete or has expired. Return to the app that sent you here and try again.</p>
          <button type="button" onClick={() => router.push("/")} className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#3569b7] px-5 text-sm font-semibold text-white transition hover:brightness-105">Back to MAX</button>
        </section>
      </main>
    );
  }

  const displayedScopes = [...new Set(request.scopes)].map((scope) => ({
    scope,
    ...(SCOPE_LABELS[scope] || { title: "Additional permission", description: "This app has requested an additional permission for your MAX Account." }),
  }));

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-8 text-[#252b36] dark:bg-[#17191d] dark:text-[#e5e7eb] sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[520px] items-center justify-center">
        <section className="w-full rounded-[24px] border border-[#e3e7ed] bg-white p-6 shadow-sm dark:border-[#373b44] dark:bg-[#202329] sm:p-9">
          <div className="mb-7 flex items-center gap-3">
            <img src="/logo.png" alt="MAX" className="h-9 w-9 rounded-xl object-contain" />
            <span className="text-sm font-semibold text-[#667085] dark:text-[#a2a8b3]">MAX</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf3fc] text-[#3569b7] dark:bg-[#293342] dark:text-[#9abcf6]"><ShieldCheck className="h-6 w-6" /></div>
            <div className="min-w-0">
              <h1 className="text-[25px] font-semibold leading-tight tracking-tight">This site is requesting access</h1>
              <p className="mt-2 text-sm leading-6 text-[#667085] dark:text-[#a2a8b3]"><span className="font-semibold text-[#252b36] dark:text-[#e5e7eb]">{request.clientName}</span> wants to connect to your MAX Account.</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e3e7ed] p-3 dark:border-[#373b44]">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf3fc] text-[#3569b7] dark:bg-[#293342] dark:text-[#9abcf6]"><UserRound className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user?.displayName || user?.username || "Your MAX Account"}</p><p className="truncate text-xs text-[#667085] dark:text-[#a2a8b3]">{user?.email || "Signed-in account"}</p></div>
            <Check className="h-4 w-4 text-[#39845a]" />
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-semibold">The app is asking to:</h2>
            <div className="mt-3 divide-y divide-[#e9ecf1] rounded-2xl border border-[#e3e7ed] dark:divide-[#373b44] dark:border-[#373b44]">
              {displayedScopes.map(({ scope, title, description }) => (
                <div key={scope} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f0f2f5] text-[#435c7d] dark:bg-[#2b2f36] dark:text-[#b3c5df]"><Check className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium">{title}</p><p className="mt-1 text-sm leading-5 text-[#667085] dark:text-[#a2a8b3]">{description}</p></div>
                </div>
              ))}
            </div>
          </div>

          {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div>}

          <p className="mt-5 text-xs leading-5 text-[#667085] dark:text-[#a2a8b3]">Only continue if you trust this app. You can review or revoke app access later in your MAX Account settings.</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => router.push("/dashboard")} className="inline-flex h-12 items-center justify-center rounded-full border border-[#d7dce4] px-5 text-sm font-semibold transition hover:bg-[#f7f8fa] dark:border-[#454a54] dark:hover:bg-[#2b2f36]">Cancel</button>
            <button type="button" onClick={approve} disabled={isApproving} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#3569b7] px-6 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">{isApproving ? "Connecting…" : "Continue"} {!isApproving && <ArrowRight className="h-4 w-4" />}</button>
          </div>
          <div className="mt-7 flex justify-center gap-5 text-xs text-[#667085] dark:text-[#a2a8b3]"><a href="/privacy-policy" className="hover:underline">Privacy</a><a href="/terms-of-service" className="hover:underline">Terms</a></div>
        </section>
      </div>
    </main>
  );
}

export default function AuthorizePage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center"><p className="text-sm text-ink-muted">Loading…</p></main>}><AuthorizeContent /></Suspense>;
}
