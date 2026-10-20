"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, LoaderCircle, Users } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";

export default function AcceptBusinessInvitationPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<"waiting" | "loading" | "success" | "error">("waiting");
  const [message, setMessage] = useState("Sign in with the MAX Account invited to this business.");
  const [token, setToken] = useState("");

  useEffect(() => { setToken(new URLSearchParams(window.location.search).get("token") || ""); }, []);
  useEffect(() => {
    if (isLoading || !token || !isAuthenticated || state === "success" || state === "error") return;
    setState("loading");
    apiClient.post<{ business: { displayName: string } }>("/businesses/invitations/accept", { token })
      .then(({ business }) => { setState("success"); setMessage(`You have joined ${business.displayName}.`); })
      .catch((error) => { setState("error"); setMessage(error instanceof Error ? error.message : "We couldn't accept this invitation."); });
  }, [isLoading, isAuthenticated, token, state]);

  const signInHref = `/sign-in?next=${encodeURIComponent(`/business/invitations/accept?token=${token}`)}`;
  return <div className="min-h-screen bg-base text-ink"><SiteHeader /><main className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-4 py-14"><section className="w-full max-w-xl rounded-3xl border border-glass-border bg-base-raised p-8 text-center shadow-sm sm:p-10"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{state === "loading" || (state === "waiting" && isLoading) ? <LoaderCircle className="h-7 w-7 animate-spin" /> : state === "success" ? <CheckCircle2 className="h-7 w-7" /> : state === "error" ? <CircleAlert className="h-7 w-7" /> : <Users className="h-7 w-7" />}</span><h1 className="mt-5 text-2xl font-semibold">{state === "success" ? "You're part of the team" : state === "error" ? "Invitation couldn't be accepted" : "Join a business on MAX"}</h1><p className="mt-3 text-sm leading-6 text-ink-muted">{message}</p>{state === "waiting" && !isLoading && !isAuthenticated && <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href={signInHref}><Button>Sign in to accept</Button></Link><Link href="/create-account"><Button variant="secondary">Create a MAX Account</Button></Link></div>}{state === "success" && <div className="mt-7"><Button onClick={() => router.push("/business")}>Open business portal</Button></div>}{state === "error" && <div className="mt-7"><Link href="/business"><Button variant="secondary">Return to business portal</Button></Link></div>}</section></main><SiteFooter /></div>;
}
