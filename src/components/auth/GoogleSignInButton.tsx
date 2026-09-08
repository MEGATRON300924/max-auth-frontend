"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/auth/useAuth";

interface GoogleAccountsId { initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean }) => void; renderButton: (element: HTMLElement, options: { theme: "outline" | "filled_blue"; size: "large"; width: number; text: "continue_with" }) => void; }
declare global { interface Window { google?: { accounts: { id: GoogleAccountsId } } } }

export function GoogleSignInButton() {
  const { googleLogin } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const render = () => {
    if (!clientId || !window.google || !containerRef.current) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }) => { setError(null); try { await googleLogin(credential); } catch (err) { setError(err instanceof Error ? err.message : "Google Sign-In failed"); } } });
    containerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(containerRef.current, { theme: "outline", size: "large", width: 420, text: "continue_with" });
  };

  useEffect(() => { render(); }, [clientId]);
  if (!clientId) return null;
  return <div className="space-y-2"><Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={render} />{error && <Alert variant="danger">{error}</Alert>}<div ref={containerRef} className="flex justify-center" /></div>;
}
