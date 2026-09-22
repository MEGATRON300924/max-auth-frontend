"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/auth/useAuth";
import { ApiError } from "@/lib/api/ApiError";

interface GoogleAccountsId { initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean }) => void; renderButton: (element: HTMLElement, options: { theme: "outline" | "filled_blue"; size: "large"; width: number; text: "continue_with" }) => void; }
declare global { interface Window { google?: { accounts: { id: GoogleAccountsId } } } }

export function GoogleSignInButton() {
  const { googleLogin } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [credential, setCredential] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const destination = () => {
    const returnTo = new URLSearchParams(window.location.search).get("returnTo");
    return returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard";
  };

  const complete = async (code?: string) => {
    if (!credential) return;
    setLoading(true); setError(null);
    try { await googleLogin(credential, code); router.replace(destination()); }
    catch (err) {
      if (err instanceof ApiError && err.code === "MFA_REQUIRED") { setMfaRequired(true); setMfaCode(""); }
      else setError(err instanceof Error ? err.message : "Google Sign-In failed");
    } finally { setLoading(false); }
  };

  const render = () => {
    if (!clientId || !window.google || !containerRef.current || mfaRequired) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential: value }) => { setCredential(value); await complete(); } });
    containerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(containerRef.current, { theme: "outline", size: "large", width: 420, text: "continue_with" });
  };

  useEffect(() => { render(); }, [clientId, mfaRequired]);

  if (!clientId) return null;
  return (
    <div className="space-y-3">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={render} />
      {error && <Alert variant="danger">{error}</Alert>}
      {!mfaRequired ? <div ref={containerRef} className="flex justify-center" /> : (
        <form onSubmit={(event) => { event.preventDefault(); if (recovery ? mfaCode.trim().length >= 8 : /^\d{6}$/.test(mfaCode)) complete(mfaCode.trim()); else setError(recovery ? "Enter a recovery code." : "Enter the 6-digit authenticator code."); }} className="rounded-xl border border-glass-border bg-base-raised p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink"><ShieldCheck className="h-4 w-4 text-brand-500" />Two-factor authentication</div>
          <p className="mt-1 text-xs leading-5 text-ink-muted">{recovery ? "Use one of your single-use recovery codes." : "Enter the code from your authenticator app."}</p>
          <input value={mfaCode} onChange={(e) => setMfaCode(recovery ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode={recovery ? "text" : "numeric"} maxLength={recovery ? 32 : 6} autoComplete="one-time-code" autoFocus className="mt-3 h-11 w-full rounded-lg border border-glass-border bg-base p-3 text-center font-mono tracking-[.2em] outline-none focus:border-brand-500" placeholder={recovery ? "XXXX-XXXX-XXXX" : "123456"} />
          <button type="submit" disabled={loading} className="mt-3 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Verifying…" : "Verify and continue"}</button>
          <button type="button" onClick={() => { setRecovery(v => !v); setMfaCode(""); setError(null); }} className="mt-3 w-full text-xs font-medium text-brand-500 hover:underline">{recovery ? "Use authenticator app" : "Use a recovery code"}</button>
        </form>
      )}
    </div>
  );
}
