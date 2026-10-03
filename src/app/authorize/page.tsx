"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

type OAuthRequest = { client_id: string; client_name: string; client_logo?: string; client_website?: string; redirect_uri: string; response_type: string; scope: string; state: string; code_challenge: string; code_challenge_method: string; request_token: string; };

function getRequest(): OAuthRequest | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = (key: keyof OAuthRequest) => params.get(key) || "";
  const request = {
    client_id: value("client_id"), client_name: value("client_name"), client_logo: params.get("client_logo") || undefined, client_website: params.get("client_website") || undefined,
    redirect_uri: value("redirect_uri"), response_type: value("response_type"), scope: value("scope"), state: value("state"), code_challenge: value("code_challenge"), code_challenge_method: value("code_challenge_method"), request_token: value("request_token"),
  };
  if (!request.client_id || !request.client_name || !request.redirect_uri || !request.state || !request.code_challenge || !request.request_token) return null;
  return request;
}

export default function AuthorizePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [request, setRequest] = useState<OAuthRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setRequest(getRequest()); }, []);
  const returnTo = useMemo(() => {
    if (!request) return "/dashboard";
    const params = new URLSearchParams({ client_id: request.client_id, client_name: request.client_name, redirect_uri: request.redirect_uri, response_type: request.response_type, scope: request.scope, state: request.state, code_challenge: request.code_challenge, code_challenge_method: request.code_challenge_method, request_token: request.request_token });
    if (request.client_logo) params.set("client_logo", request.client_logo);
    if (request.client_website) params.set("client_website", request.client_website);
    return `/authorize?${params.toString()}`;
  }, [request]);
  useEffect(() => { if (!isLoading && !isAuthenticated && request) window.location.assign(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`); }, [isAuthenticated, isLoading, request, returnTo]);
  useEffect(() => { if (request) document.title = `Continue to ${request.client_name}`; }, [request]);
  const approve = async () => {
    if (!request) return; setProcessing(true); setError(null);
    try {
      const result = await apiClient.post<{ redirectUri: string }>("/oauth/authorize/approve", { clientId: request.client_id, redirectUri: request.redirect_uri, scopes: request.scope, codeChallenge: request.code_challenge, codeChallengeMethod: request.code_challenge_method, state: request.state, requestToken: request.request_token });
      window.location.assign(result.redirectUri);
    } catch (err) { setError(err instanceof Error ? err.message : "MAX Auth could not approve this request. Please try again."); setProcessing(false); }
  };
  const deny = () => {
    if (!request) return; const callback = new URL(request.redirect_uri); callback.searchParams.set("error", "access_denied"); callback.searchParams.set("error_description", "The user denied the authorization request."); callback.searchParams.set("state", request.state); window.location.assign(callback.toString());
  };
  if (!request) return <main className="min-h-screen bg-[#f8f9fa] px-4 py-10 dark:bg-[#202124]"><div className="mx-auto flex min-h-[80vh] max-w-[450px] items-center"><section className="w-full rounded-[16px] border border-[#dadce0] bg-white p-8 text-center shadow-sm dark:border-[#5f6368] dark:bg-[#292a2d]"><XCircle className="mx-auto h-10 w-10 text-[#d93025]" /><h1 className="mt-4 text-2xl font-normal">Invalid authorization request</h1><p className="mt-2 text-sm text-[#5f6368] dark:text-[#bdc1c6]">This authorization request is missing required information or has expired.</p></section></div></main>;
  if (isLoading || !isAuthenticated) return <main className="min-h-screen bg-[#f8f9fa] px-4 py-10 dark:bg-[#202124]"><div className="mx-auto flex min-h-[80vh] max-w-[450px] items-center"><section className="w-full rounded-[16px] border border-[#dadce0] bg-white p-8 text-center shadow-sm dark:border-[#5f6368] dark:bg-[#292a2d]"><div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#e8eaed] dark:bg-[#3c4043]" /><p className="mt-5 text-sm text-[#5f6368] dark:text-[#bdc1c6]">Preparing secure authorization…</p></section></div></main>;
  const scopes = [...new Set(request.scope.split(" ").filter(Boolean))];
  return <main className="min-h-screen bg-[#f8f9fa] px-4 py-8 text-[#202124] dark:bg-[#202124] dark:text-[#e8eaed] sm:py-12"><div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[450px] items-center justify-center"><section className="w-full rounded-[16px] border border-[#dadce0] bg-white px-7 py-8 shadow-sm dark:border-[#5f6368] dark:bg-[#292a2d] sm:px-9"><div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-[14px] border border-[#dadce0] bg-white dark:border-[#5f6368]">{request.client_logo ? <img src={request.client_logo} alt="" className="h-9 w-9 object-contain" /> : <span className="text-lg font-semibold">M</span>}</div><h1 className="mt-5 text-[24px] font-normal">Continue to {request.client_name}</h1><p className="mt-2 text-[15px] leading-6 text-[#5f6368] dark:text-[#bdc1c6]">You are signed in with your MAX Account.</p></div><div className="mt-7 rounded-[12px] border border-[#dadce0] p-4 dark:border-[#5f6368]"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f3f4] dark:bg-[#3c4043]"><UserRound className="h-4 w-4 text-[#5f6368]" /></div><div><p className="text-sm font-medium">MAX Account</p><p className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">Authorize this application</p></div></div></div><div className="mt-5"><p className="text-sm font-medium">This app is requesting:</p><div className="mt-3 space-y-2">{scopes.map((scope) => <div key={scope} className="flex items-center gap-2 text-sm text-[#5f6368] dark:text-[#bdc1c6]"><CheckCircle2 className="h-4 w-4 text-[#0b57d0] dark:text-[#8ab4f8]" />{scope}</div>)}</div></div>{error && <div className="mt-5"><Alert variant="danger">{error}</Alert></div>}<div className="mt-7 grid grid-cols-2 gap-3"><Button type="button" variant="secondary" onClick={deny} disabled={processing}>Cancel</Button><Button type="button" onClick={approve} isLoading={processing}>Allow access</Button></div><div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#5f6368] dark:text-[#bdc1c6]"><ShieldCheck className="h-4 w-4" /> Secure authorization with MAX Auth</div></section></div></main>;
}