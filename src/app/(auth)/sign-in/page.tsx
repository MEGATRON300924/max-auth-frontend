"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/auth/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { ApiError } from "@/lib/api/ApiError";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const LAST_ACCOUNT_KEY = "max-auth:last-account";
const RETURN_TO_KEY = "max-auth:return-to";
type SignInStep = "choose" | "credentials";

function safeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export default function SignInPage() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<SignInStep>("choose");
  const [identifier, setIdentifier] = useState("");
  const [rememberedAccount, setRememberedAccount] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destination = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";

    const fromQuery = safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
    if (fromQuery) {
      try { window.sessionStorage.setItem(RETURN_TO_KEY, fromQuery); } catch {}
      return fromQuery;
    }

    try {
      return safeReturnTo(window.sessionStorage.getItem(RETURN_TO_KEY)) || "/dashboard";
    } catch {
      return "/dashboard";
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace(destination);
    }
  }, [destination, isAuthenticated]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LAST_ACCOUNT_KEY);
      if (saved) setRememberedAccount(saved);
    } catch {}
  }, []);

  const beginWithAccount = (account: string) => { setIdentifier(account); setPassword(""); setError(null); setStep("credentials"); };
  const useAnotherAccount = () => { setIdentifier(""); setPassword(""); setError(null); setStep("credentials"); };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const account = identifier.trim();
      await login(account, password, rememberMe);
      try {
        if (rememberMe) { window.localStorage.setItem(LAST_ACCOUNT_KEY, account); setRememberedAccount(account); }
        else { window.localStorage.removeItem(LAST_ACCOUNT_KEY); setRememberedAccount(null); }
        window.sessionStorage.removeItem(RETURN_TO_KEY);
      } catch {}
      showToast({ title: "Welcome back", variant: "success" });
      window.location.replace(destination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally { setIsLoading(false); }
  };

  return (
    <main className="min-h-screen bg-base px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[460px] flex-col items-center justify-center">
        <Link href="/" aria-label="MAX home" className="mb-8 inline-flex items-center"><img src="/logo.png" alt="MAX AI" className="h-11 w-11 rounded-xl object-contain" /></Link>
        <section className="w-full rounded-[28px] border border-glass-border bg-base-raised p-6 shadow-sm sm:p-8">
          {step === "choose" ? (
            <div>
              <div className="text-center"><h1 className="font-display text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]">Choose a MAX Account</h1><p className="mx-auto mt-2 max-w-[350px] text-sm leading-6 text-ink-muted">Sign in with your MAX Account to continue to MAX services and apps.</p></div>
              <div className="mt-8 space-y-3">
                {rememberedAccount ? (
                  <button type="button" onClick={() => beginWithAccount(rememberedAccount)} className="group flex w-full items-center gap-3 rounded-2xl border border-glass-border bg-base px-4 py-3.5 text-left transition-colors hover:bg-base-raised-strong"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 p-2 dark:bg-brand-500/15"><img src="/logo.png" alt="" className="h-full w-full rounded-full object-contain" /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-ink-faint">Last used</p><p className="mt-0.5 truncate text-sm font-semibold text-ink">{rememberedAccount}</p></div><span className="text-sm font-semibold text-brand-600 dark:text-brand-400">Continue</span></button>
                ) : (
                  <button type="button" onClick={useAnotherAccount} className="flex w-full items-center gap-3 rounded-2xl border border-glass-border bg-base px-4 py-3.5 text-left transition-colors hover:bg-base-raised-strong"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 dark:bg-brand-500/15"><UserRound className="h-5 w-5 text-brand-700 dark:text-brand-300" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">Use your MAX Account</p><p className="mt-0.5 text-sm text-ink-muted">Enter your email or username</p></div><span className="text-lg text-ink-faint">›</span></button>
                )}
                {rememberedAccount && <button type="button" onClick={useAnotherAccount} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400"> <UserRound className="h-4 w-4" /> Use another MAX Account</button>}
              </div>
              <div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-glass-border" /><span className="text-xs font-medium text-ink-faint">OR</span><div className="h-px flex-1 bg-glass-border" /></div>
              <GoogleSignInButton />
              <p className="mt-7 text-center text-sm text-ink-muted">Don&apos;t have a MAX Account? <Link href="/create-account" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Create one</Link></p>
            </div>
          ) : (
            <div>
              <button type="button" onClick={() => { setError(null); setPassword(""); setStep("choose"); }} className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" />Back</button>
              <div className="text-center"><h1 className="font-display text-[28px] font-semibold tracking-[-0.03em] text-ink">Sign in to MAX</h1><p className="mt-2 text-sm leading-6 text-ink-muted">Enter your MAX Account password to continue.</p></div>
              <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                {error && <Alert variant="danger">{error}</Alert>}
                <label className="block"><span className="mb-2 block text-sm font-medium text-ink">Email or username</span><span className="relative block"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" /><input type="text" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="h-12 w-full rounded-xl border border-glass-border bg-base px-11 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15" placeholder="Email or username" required autoFocus={!identifier} /></span></label>
                <div><label className="block"><span className="mb-2 block text-sm font-medium text-ink">Password</span><span className="relative block"><Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" /><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-glass-border bg-base px-11 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15" placeholder="Password" required autoFocus={!!identifier} /></span></label><div className="mt-3 flex items-center justify-between gap-4"><label className="flex items-center gap-2 text-sm text-ink-muted"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-glass-border bg-base text-brand-600 focus:ring-brand-500" />Remember this account</label><Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">Forgot password?</Link></div></div>
                <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>Sign in</Button>
              </form>
              <p className="mt-7 text-center text-sm text-ink-muted">Need a MAX Account? <Link href="/create-account" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Create one</Link></p>
            </div>
          )}
        </section>
        <p className="mt-6 text-center text-xs leading-5 text-ink-faint">One MAX Account for your MAX services. Your password is handled only by MAX Auth.</p>
      </div>
    </main>
  );
}
