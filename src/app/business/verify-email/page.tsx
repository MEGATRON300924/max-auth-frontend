"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleAlert, LoaderCircle, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";

export default function VerifyBusinessEmailPage() {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your business email…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const businessId = params.get("businessId");
    const token = params.get("token");
    if (!businessId || !token) { setState("error"); setMessage("This verification link is incomplete. Open the full link from your business email."); return; }
    apiClient.post<{ business: { displayName: string } }>(`/businesses/${encodeURIComponent(businessId)}/verify-email`, { token }, { skipAuth: true })
      .then(({ business }) => { setState("success"); setMessage(`The business email for ${business.displayName} has been verified.`); })
      .catch((error) => { setState("error"); setMessage(error instanceof Error ? error.message : "This verification link is invalid or expired."); });
  }, []);

  return <div className="min-h-screen bg-base text-ink"><SiteHeader /><main className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-4 py-14"><section className="w-full max-w-xl rounded-3xl border border-glass-border bg-base-raised p-8 text-center shadow-sm sm:p-10"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{state === "loading" ? <LoaderCircle className="h-7 w-7 animate-spin" /> : state === "success" ? <CheckCircle2 className="h-7 w-7" /> : <CircleAlert className="h-7 w-7" />}</span><h1 className="mt-5 text-2xl font-semibold">{state === "success" ? "Business email verified" : state === "error" ? "Verification couldn't be completed" : "Verifying your email"}</h1><p className="mt-3 text-sm leading-6 text-ink-muted">{message}</p><p className="mt-4 text-xs leading-5 text-ink-muted"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Email verification confirms access to the address. It does not certify legal business registration.</p><div className="mt-7"><Link href="/business"><Button>Go to business portal</Button></Link></div></section></main><SiteFooter /></div>;
}
