"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, UserRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/auth/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { ApiError } from "@/lib/api/ApiError";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const LAST_ACCOUNT_KEY = "max-auth:last-account";
const ACCOUNTS_KEY = "max-auth:accounts";
const MAX_REMEMBERED_ACCOUNTS = 5;
const RETURN_TO_KEY = "max-auth:oauth-return-to";
type SignInStep = "choose" | "credentials";

function getSafeReturnTo(value: string | null | undefined) {
  if (typeof window === "undefined" || !value) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname.startsWith("//")) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function getDestination() {
  if (typeof window === "undefined") return "/dashboard";
  const queryReturnTo = new URLSearchParams(window.location.search).get("returnTo");
  const fromQuery = getSafeReturnTo(queryReturnTo);
  if (fromQuery && fromQuery !== "/dashboard") return fromQuery;
  try {
    const saved = getSafeReturnTo(window.sessionStorage.getItem(RETURN_TO_KEY));
    if (saved) return saved;
  } catch {}
  return fromQuery || "/dashboard";
}

function getClientName() {
  if (typeof window === "undefined") return null;
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  if (!returnTo) return null;
  try {
    const url = new URL(returnTo, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname !== "/authorize") return null;
    return url.searchParams.get("client_name") || null;
  } catch {
    return null;
  }
}

export default function SignInPage() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<SignInStep>("choose");
  const [identifier, setIdentifier] = useState("");
  const [rememberedAccounts, setRememberedAccounts] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const clientName = getClientName();
    document.title = clientName ? `Sign in with ${clientName}` : "Sign in with MAX Account";
  }, []);

  useEffect(() => {
    try {
      // Preserve the OAuth authorization page across password login, Google login,
      // refreshes, and route transitions. Do not overwrite a valid return path with null.
      const queryReturnTo = new URLSearchParams(window.location.search).get("returnTo");
      const current = getSafeReturnTo(queryReturnTo);
      if (current && current !== "/dashboard") {
        window.sessionStorage.setItem(RETURN_TO_KEY, current);
      }
    } catch {}
  }, []);

  useEffect(() => { if (isAuthenticated) window.location.assign(getDestination()); }, [isAuthenticated]);

  useEffect(() => {
    try {
      const savedList = window.localStorage.getItem(ACCOUNTS_KEY);
      const legacy = window.localStorage.getItem(LAST_ACCOUNT_KEY);
      let accounts: string[] = [];
      if (savedList) {
        const parsed: unknown = JSON.parse(savedList);
        if (Array.isArray(parsed)) accounts = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
      if (legacy && !accounts.some((item) => item.toLowerCase() === legacy.toLowerCase())) accounts.unshift(legacy);
      accounts = [...new Map(accounts.map((item) => [item.toLowerCase(), item])).values()].slice(0, MAX_REMEMBERED_ACCOUNTS);
      setRememberedAccounts(accounts);
      if (accounts.length) setRememberMe(true);
      if (accounts.length) window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      window.localStorage.removeItem(LAST_ACCOUNT_KEY);
    } catch {}
  }, []);

  const persistRememberedAccounts = (accounts: string[]) => {
    const unique = [...new Map(accounts.map((item) => [item.toLowerCase(), item])).values()].slice(0, MAX_REMEMBERED_ACCOUNTS);
    setRememberedAccounts(unique);
    try {
      if (unique.length) window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(unique));
      else window.localStorage.removeItem(ACCOUNTS_KEY);
      window.localStorage.removeItem(LAST_ACCOUNT_KEY);
    } catch {}
  };

  const forgetAccount = (account: string) => {
    persistRememberedAccounts(rememberedAccounts.filter((item) => item.toLowerCase() !== account.toLowerCase()));
  };

  const beginWithAccount = (account: string) => {
    setIdentifier(account); setRememberMe(true); setPassword(""); setMfaCode(""); setMfaRequired(false); setUseRecoveryCode(false); setError(null); setStep("credentials");
  };
  const useAnotherAccount = () => {
    setIdentifier(""); setRememberMe(false); setPassword(""); setMfaCode(""); setMfaRequired(false); setUseRecoveryCode(false); setError(null); setStep("credentials");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (mfaRequired && (useRecoveryCode ? mfaCode.trim().length < 8 : !/^\d{6}$/.test(mfaCode))) {
      setError(useRecoveryCode ? "Enter one of your recovery codes." : "Enter the 6-digit code from your authenticator app.");
      return;
    }
    setIsLoading(true);
    try {
      const account = identifier.trim();
      await login(account, password, rememberMe, mfaRequired ? mfaCode.trim() : undefined);
      const destination = getDestination();
      try {
        if (rememberMe) {
          persistRememberedAccounts([account, ...rememberedAccounts.filter((item) => item.toLowerCase() !== account.toLowerCase())]);
        } else if (rememberedAccounts.some((item) => item.toLowerCase() === account.toLowerCase())) {
          persistRememberedAccounts(rememberedAccounts.filter((item) => item.toLowerCase() !== account.toLowerCase()));
        }
        window.sessionStorage.removeItem(RETURN_TO_KEY);
      } catch {}
      showToast({ title: "Welcome back", variant: "success" });
      window.location.assign(destination);
    } catch (err) {
      if (err instanceof ApiError && err.code === "MFA_REQUIRED") {
        setMfaRequired(true);
        setMfaCode("");
        setError(null);
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    } finally { setIsLoading(false); }
  };

  const clientName = getClientName();
  const signInTitle = clientName ? "You’re about to sign in to:" : "Sign in with MAX Account";
  const signInDescription = clientName ? "Continue securely with your MAX Account." : "Use your MAX Account to continue to MAX services and apps.";

  return (
    <main className="min-h-screen w-full max-w-none overflow-x-hidden bg-[#f8f9fa] px-3 py-5 text-[#202124] dark:bg-[#202124] dark:text-[#e8eaed] sm:px-4 sm:py-10 lg:grid lg:grid-cols-2 lg:p-0 lg:bg-white lg:text-[#202124] dark:lg:bg-white dark:lg:text-[#202124]">
      <div className="flex min-h-[calc(100vh-2.5rem)] w-full min-w-0 items-center justify-center sm:min-h-[calc(100vh-5rem)] lg:min-h-screen lg:px-8 lg:py-8 xl:px-12 2xl:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[450px] min-w-0 flex-col items-center justify-center sm:min-h-[calc(100vh-5rem)] lg:min-h-0 lg:max-w-[560px]">
        <section className="w-full rounded-[16px] border border-[#dadce0] bg-white px-4 py-6 shadow-sm dark:border-[#5f6368] dark:bg-[#292a2d] sm:px-10 sm:py-10 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none dark:lg:bg-transparent">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#dadce0] bg-white dark:border-[#5f6368]"><img src="/logo.png" alt="MAX" className="h-9 w-9 object-contain" /></div>
            <h1 className="mt-4 text-[21px] font-normal tracking-[-0.01em] sm:text-[24px]">{step === "choose" ? signInTitle : mfaRequired ? "Verify it’s you" : "Enter your password"}</h1>
            {step === "choose" && clientName && <p className="mt-2 break-words text-lg font-semibold text-[#202124] dark:text-[#e8eaed]">{clientName}</p>}
            <p className="mt-2 text-[14px] leading-6 text-[#5f6368] dark:text-[#bdc1c6]">
              {step === "choose" ? signInDescription : mfaRequired ? (useRecoveryCode ? "Enter a recovery code to finish signing in." : "Enter the 6-digit code from your authenticator app.") : "Verify your MAX Account to continue securely."}
            </p>
          </div>

          {step === "choose" ? (
            <div className="mt-8">
              <div className="space-y-2">
                {rememberedAccounts.map((account, index) => (
                  <div key={account.toLowerCase()} className="group flex w-full items-center gap-2 rounded-xl border border-[#dadce0] bg-white px-2.5 py-2.5 transition-colors hover:bg-[#f8f9fa] dark:border-[#5f6368] dark:bg-transparent dark:hover:bg-[#303134] sm:gap-3 sm:px-3 sm:py-3">
                    <button type="button" onClick={() => beginWithAccount(account)} className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#dadce0] bg-[#f8f9fa] dark:border-[#5f6368] dark:bg-[#303134] sm:h-10 sm:w-10"><img src="/user.png" alt="" className="h-full w-full rounded-full object-cover" /></div>
                      <div className="min-w-0 flex-1"><p className="break-all text-[13px] font-medium leading-5 sm:text-sm">{account}</p><p className="mt-0.5 text-sm text-[#5f6368] dark:text-[#bdc1c6]">{index === 0 ? "Last used" : "Remembered on this device"}</p></div>
                      <span className="shrink-0 text-xs font-medium text-[#0b57d0] dark:text-[#8ab4f8] sm:text-sm">Continue</span>
                    </button>
                    <button type="button" onClick={() => forgetAccount(account)} aria-label={`Forget ${account}`} title="Forget this account" className="shrink-0 rounded-full px-1.5 py-1 text-[11px] text-[#5f6368] hover:bg-[#e8eaed] dark:text-[#bdc1c6] dark:hover:bg-[#3c4043] sm:px-2 sm:text-xs">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={useAnotherAccount} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#dadce0] px-3 py-3 text-left transition-colors hover:bg-[#f8f9fa] dark:border-[#5f6368] dark:hover:bg-[#303134]"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4] dark:bg-[#3c4043]"><UserRound className="h-5 w-5 text-[#5f6368] dark:text-[#bdc1c6]" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">Use another MAX Account</p><p className="mt-0.5 text-sm text-[#5f6368] dark:text-[#bdc1c6]">Sign in with a different email or username</p></div><span className="text-lg text-[#5f6368]">›</span></button>
              </div>
              <div className="my-5 flex items-center gap-3 sm:my-7"><div className="h-px flex-1 bg-[#dadce0] dark:bg-[#5f6368]" /><span className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">OR</span><div className="h-px flex-1 bg-[#dadce0] dark:bg-[#5f6368]" /></div>
              <GoogleSignInButton />
              <p className="mt-7 text-center text-sm text-[#5f6368] dark:text-[#bdc1c6]">Don&apos;t have a MAX Account? <Link href="/create-account" className="font-medium text-[#0b57d0] hover:underline dark:text-[#8ab4f8]">Create one</Link></p>
            </div>
          ) : (
            <div className="mt-8">
              <button type="button" onClick={() => { setError(null); setPassword(""); setMfaCode(""); setMfaRequired(false); setUseRecoveryCode(false); setStep("choose"); }} className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#5f6368] hover:text-[#202124] dark:text-[#bdc1c6] dark:hover:text-[#e8eaed]"><ArrowLeft className="h-4 w-4" />Back</button>
              <label className="mb-5 block"><span className="mb-2 block text-sm font-medium">Email or username</span><span className="relative block"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f6368]" /><input type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="email" className="h-12 w-full rounded-xl border border-[#dadce0] bg-white px-11 text-sm outline-none transition-colors focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] dark:border-[#5f6368] dark:bg-transparent" placeholder="Email or username" required autoFocus /></span></label>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && <Alert variant="danger">{error}</Alert>}
                {!mfaRequired ? (
                  <>
                    <label className="block"><span className="mb-2 block text-sm font-medium">Password</span><span className="relative block"><Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f6368]" /><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-[#dadce0] bg-white px-11 text-sm outline-none transition-colors focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] dark:border-[#5f6368] dark:bg-transparent" placeholder="Password" required autoFocus /></span></label>
                    <div className="flex items-center justify-between gap-4"><label className="flex items-center gap-2 text-sm text-[#5f6368] dark:text-[#bdc1c6]"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-[#dadce0] text-[#0b57d0] focus:ring-[#0b57d0]" />Remember this account</label><Link href="/forgot-password" className="text-sm font-medium text-[#0b57d0] hover:underline dark:text-[#8ab4f8]">Forgot password?</Link></div>
                  </>
                ) : (
                  <label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-[#0b57d0] dark:text-[#8ab4f8]" />{useRecoveryCode ? "Recovery code" : "Authenticator code"}</span><input value={mfaCode} onChange={(event) => setMfaCode(useRecoveryCode ? event.target.value : event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode={useRecoveryCode ? "text" : "numeric"} autoComplete="one-time-code" maxLength={useRecoveryCode ? 32 : 6} className="h-12 w-full rounded-xl border border-[#dadce0] bg-white px-4 text-center font-mono text-base tracking-[.22em] outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] dark:border-[#5f6368] dark:bg-transparent" placeholder={useRecoveryCode ? "XXXX-XXXX-XXXX" : "123456"} required autoFocus /></label>
                )}
                <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>{mfaRequired ? "Verify and sign in" : "Sign in"}</Button>
                {mfaRequired && <div className="text-center"><button type="button" onClick={() => { setUseRecoveryCode((value) => !value); setMfaCode(""); setError(null); }} className="text-sm font-medium text-[#0b57d0] hover:underline dark:text-[#8ab4f8]">{useRecoveryCode ? "Use authenticator app instead" : "Use a recovery code instead"}</button></div>}
              </form>
              {mfaRequired && <p className="mt-5 text-center text-xs leading-5 text-[#5f6368] dark:text-[#bdc1c6]">Your recovery codes are single-use. If you use one here, it will be consumed.</p>}
            </div>
          )}
        </section>
        <footer className="mt-5 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-2 text-xs text-[#5f6368] dark:text-[#bdc1c6]">
          <Link href="/terms-of-service" className="hover:underline">Terms and Conditions</Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        </footer>
      </div>
      </div>
      <aside aria-label="The MAX AI Ecosystem" className="relative hidden min-h-screen w-full min-w-0 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center bg-[radial-gradient(ellipse_at_52%_38%,#1554d5_0%,#0b2b79_34%,#06153f_72%,#030817_100%)]">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[42%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/30 blur-[110px]" />
        <div className="absolute inset-0 flex items-center justify-center pb-24">
          <video
            className="relative z-10 h-[min(68vh,680px)] w-[min(68vh,680px)] max-h-[78%] max-w-[92%] object-contain drop-shadow-[0_0_42px_rgba(45,126,255,0.55)]"
            src="https://www.max-ai.name.ng/max-orb.webm"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="MAX animated orb"
          />
        </div>
        <h2 className="absolute bottom-[7%] z-10 w-full max-w-full px-4 text-center text-3xl font-black leading-[1.05] tracking-[-0.045em] text-white xl:px-6 xl:text-5xl 2xl:text-6xl">
          <span className="text-sky-300">The </span><span><span className="text-pink-400">M</span><span className="text-rose-400">a</span><span className="text-red-500">x</span></span><span className="text-white"> AI Ecosystem</span>
        </h2>
      </aside>
    </main>
  );
}
