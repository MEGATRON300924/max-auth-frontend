"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, KeyRound, ShieldCheck } from "lucide-react";
import { testOAuthClient, type OAuthClientTestResult } from "@/lib/api/security";
import type { OAuthPermission } from "@/types/api";

const permissions: { id: OAuthPermission; title: string; description: string }[] = [
  { id: "identity:read", title: "User ID", description: "Allow the client to identify the signed-in MAX account." },
  { id: "profile:read", title: "Basic profile", description: "Name, username and profile picture." },
  { id: "email:read", title: "Email address", description: "The user's email and verification state." },
  { id: "memory:read", title: "MAX Memory", description: "Allow the client to request the user's MAX memory data." },
  { id: "offline_access", title: "Stay signed in", description: "Allow a refresh token for longer-lived sessions." },
];

export default function ClientTesterPage() {
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [selected, setSelected] = useState<OAuthPermission[]>(["identity:read"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OAuthClientTestResult | null>(null);
  const [error, setError] = useState("");

  const toggle = (scope: OAuthPermission) => setSelected((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  async function runTest() {
    setError(""); setResult(null);
    if (!clientId.trim()) { setError("Enter a MAX Client ID first."); return; }
    try { setLoading(true); setResult(await testOAuthClient(clientId, redirectUri, selected)); } catch (err) { setError(err instanceof Error ? err.message : "Unable to test this client."); } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#fafafa] px-5 py-12 text-ink dark:bg-[#08090b]">
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-500"><KeyRound className="h-6 w-6" /></div><p className="text-sm font-semibold text-brand-500">MAX Auth</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Client ID Tester</h1><p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">Check whether a MAX OAuth client is registered correctly, verify its redirect URI, and preview the permissions it can request.</p></div>
      <section className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="grid gap-4 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="text-xs font-semibold text-ink-muted">MAX Client ID</span><input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="max_client_..." className="mt-2 w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 font-mono text-sm outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/[0.03]" /></label><label className="block sm:col-span-2"><span className="text-xs font-semibold text-ink-muted">Redirect URI <span className="font-normal">(optional)</span></span><input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} placeholder="https://example.com/auth/callback" className="mt-2 w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/[0.03]" /></label></div>
        <div className="mt-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Permissions to test</h2><p className="mt-1 text-xs text-ink-muted">These are the permissions the client is asking MAX Auth for.</p></div><button type="button" onClick={() => setSelected([])} className="text-xs font-semibold text-brand-500">Clear</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{permissions.map((permission) => { const active = selected.includes(permission.id); return <button key={permission.id} type="button" onClick={() => toggle(permission.id)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-brand-500/40 bg-brand-500/5" : "border-black/8 bg-black/[0.015] dark:border-white/10 dark:bg-white/[0.02]"}`}><span className={`mt-0.5 h-4 w-4 rounded-full border-2 ${active ? "border-brand-500 bg-brand-500" : "border-black/20 dark:border-white/20"}`} /><span><span className="block text-sm font-semibold">{permission.title}</span><span className="mt-1 block text-xs leading-5 text-ink-muted">{permission.description}</span><code className="mt-2 block text-[10px] text-ink-faint">{permission.id}</code></span></button>; })}</div></div>
        {error && <div className="mt-5 flex gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}
        <button onClick={runTest} disabled={loading} className="mt-6 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50">{loading ? "Testing client…" : "Test Client ID"}</button>
      </section>
      {result && <section className="mt-5 rounded-3xl border border-black/8 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"><div className="flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-full ${result.valid ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{result.valid ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}</div><div><h2 className="font-semibold">{result.valid ? "Client is ready" : "Client needs attention"}</h2><p className="text-xs text-ink-muted">{result.client?.name || result.clientId}</p></div></div>{result.client && <div className="mt-5 flex items-center gap-3 rounded-2xl bg-black/[0.02] p-4 dark:bg-white/[0.03]"><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-brand-500/10">{result.client.logoUrl ? <img src={result.client.logoUrl} alt="" className="h-full w-full object-cover" /> : <ShieldCheck className="h-5 w-5 text-brand-500" />}</div><div><p className="text-sm font-semibold">{result.client.name}</p><p className="text-xs text-ink-muted">{result.client.applicationType || "OAuth application"} · {result.client.verificationStatus}</p></div></div>}<div className="mt-5 space-y-2">{result.checks.map((check) => <div key={check.key} className="flex items-start gap-3 rounded-xl border border-black/6 p-3 dark:border-white/8"><span className={check.ok ? "text-success" : "text-danger"}>{check.ok ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}</span><div><p className="text-sm font-medium">{check.label}</p><p className="text-xs text-ink-muted">{check.detail}</p></div></div>)}</div>{result.allowedScopes && <div className="mt-5"><p className="text-xs font-semibold text-ink-muted">Registered permissions</p><div className="mt-2 flex flex-wrap gap-2">{result.allowedScopes.map((scope) => <code key={scope} className="rounded-lg bg-black/5 px-2 py-1 text-[11px] dark:bg-white/8">{scope}</code>)}</div></div>}</section>}
      <p className="mt-6 text-center text-xs text-ink-faint">Testing a Client ID never reveals client secrets or user credentials.</p>
    </div>
  </main>;
}
