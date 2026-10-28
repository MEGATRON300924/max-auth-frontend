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
  const signInTitle = clientName ? `Sign in with ${clientName}` : "Sign in with MAX Account";
  const signInDescription = clientName ? `Use your MAX Account to continue to ${clientName}.` : "Use your MAX Account to continue to MAX services and apps.";

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-8 text-[#202124] dark:bg-[#202124] dark:text-[#e8eaed] sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[450px] items-center justify-center">
        <section className="w-full rounded-[16px] border border-[#dadce0] bg-white px-7 py-9 shadow-sm dark:border-[#5f6368] dark:bg-[#292a2d] sm:px-10 sm:py-10">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#dadce0] bg-white dark:border-[#5f6368]"><img src="/logo.png" alt="MAX" className="h-9 w-9 object-contain" /></div>
            <h1 className="mt-5 text-[24px] font-normal tracking-[-0.01em]">{step === "choose" ? signInTitle : mfaRequired ? "Verify it’s you" : "Enter your password"}</h1>
            <p className="mt-2 text-[15px] leading-6 text-[#5f6368] dark:text-[#bdc1c6]">
              {step === "choose" ? signInDescription : mfaRequired ? (useRecoveryCode ? "Enter a recovery code to finish signing in." : "Enter the 6-digit code from your authenticator app.") : "Verify your MAX Account to continue securely."}
            </p>
          </div>

          {step === "choose" ? (
            <div className="mt-8">
              <div className="space-y-2">
                {rememberedAccounts.map((account, index) => (
                  <div key={account.toLowerCase()} className="group flex w-full items-center gap-3 rounded-xl border border-[#dadce0] bg-white px-3 py-3 transition-colors hover:bg-[#f8f9fa] dark:border-[#5f6368] dark:bg-transparent dark:hover:bg-[#303134]">
                    <button type="button" onClick={() => beginWithAccount(account)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#dadce0] bg-[#f8f9fa] dark:border-[#5f6368] dark:bg-[#303134]"><img src="/user.png" alt="" className="h-full w-full rounded-full object-cover" /></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{account}</p><p className="mt-0.5 text-sm text-[#5f6368] dark:text-[#bdc1c6]">{index === 0 ? "Last used" : "Remembered on this device"}</p></div>
                      <span className="text-sm font-medium text-[#0b57d0] dark:text-[#8ab4f8]">Continue</span>
                    </button>
                    <button type="button" onClick={() => forgetAccount(account)} aria-label={`Forget ${account}`} title="Forget this account" className="rounded-full px-2 py-1 text-xs text-[#5f6368] hover:bg-[#e8eaed] dark:text-[#bdc1c6] dark:hover:bg-[#3c4043]">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={useAnotherAccount} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#dadce0] px-3 py-3 text-left transition-colors hover:bg-[#f8f9fa] dark:border-[#5f6368] dark:hover:bg-[#303134]"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4] dark:bg-[#3c4043]"><UserRound className="h-5 w-5 text-[#5f6368] dark:text-[#bdc1c6]" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">Use another MAX Account</p><p className="mt-0.5 text-sm text-[#5f6368] dark:text-[#bdc1c6]">Sign in with a different email or username</p></div><span className="text-lg text-[#5f6368]">›</span></button>
              </div>
              <div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-[#dadce0] dark:bg-[#5f6368]" /><span className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">OR</span><div className="h-px flex-1 bg-[#dadce0] dark:bg-[#5f6368]" /></div>
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
      </div>
    </main>
  );
}
