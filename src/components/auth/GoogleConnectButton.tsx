"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Link2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { connectedAccountsApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      theme: "outline" | "filled_blue";
      size: "large";
      width: number;
      text: "continue_with";
    },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

export function GoogleConnectButton({ onConnected }: { onConnected: () => Promise<void> | void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const render = () => {
    if (!clientId || !window.google || !containerRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        setLoading(true);
        setError(null);
        try {
          await connectedAccountsApi.googleConnect(credential);
          await onConnected();
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Google could not be connected.");
        } finally {
          setLoading(false);
        }
      },
    });
    containerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: 220,
      text: "continue_with",
    });
  };

  useEffect(() => {
    render();
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="flex flex-col items-end gap-2">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={render} />
      {error && <Alert variant="danger">{error}</Alert>}
      <div ref={containerRef} className={loading ? "pointer-events-none opacity-60" : ""} />
      {loading && (
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
          <Link2 className="h-3.5 w-3.5 animate-pulse" /> Connecting Google…
        </span>
      )}
    </div>
  );
}
