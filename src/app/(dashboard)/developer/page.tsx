"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, KeyRound, Plus, Shield, Trash2, Eye, EyeOff } from "lucide-react";
import { AuthFeatureShell, GlassCard, StatusPill } from "@/components/auth/AuthFeatureShell";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { oauthApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";

const scopes = ["openid", "profile", "email"];

export default function DeveloperPage() {
  const { showToast } = useToast();
  const clients = useAsyncData(() => oauthApi.listClients().then((r) => r.clients));
  const [name, setName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  async function createClient() {
    const appName = name.trim();
    const redirect = redirectUri.trim();
    if (!appName || !redirect) {
      showToast({ title: "Complete the application details", description: "An application name and redirect URI are required.", variant: "error" });
      return;
    }
    try {
      setCreating(true);
      const result = await oauthApi.createClient({ name: appName, redirectUris: [redirect], scopes });
      setSecret(result.clientSecret);
      setName("");
      setRedirectUri("");
      clients.refetch();
      showToast({ title: "Application registered", description: "Save the client secret now. It may only be shown once.", variant: "success" });
    } catch (err) {
      showToast({ title: "Couldn't register application", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    } finally {
      setCreating(false);
    }
  }

  async function revoke(clientId: string) {
    if (!window.confirm("Revoke this MAX Auth application? Existing access using it should stop working.")) return;
    try {
      await oauthApi.revokeClient(clientId);
      clients.refetch();
      showToast({ title: "Application revoked", variant: "success" });
    } catch (err) {
      showToast({ title: "Couldn't revoke application", description: err instanceof ApiError ? err.message : undefined, variant: "error" });
    }
  }

  async function copy(value: string) {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return <AuthFeatureShell eyebrow="MAX Developers" title="Build with MAX Identity" description="Register OAuth applications, manage credentials and prepare your products for Continue with MAX AI.">
    <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <GlassCard>
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Applications</h2><p className="text-sm text-ink-muted">OAuth clients registered to your MAX account.</p></div><StatusPill tone="success">Developer mode</StatusPill></div>
        <div className="mt-5 space-y-2">
          {clients.isLoading ? <div className="h-20 animate-pulse rounded-2xl bg-white/5" /> : clients.data?.length ? clients.data.map((client) => <div key={client.id} className="rounded-2xl border border-white/8 bg-black/10 p-4"><div className="flex items-center gap-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><KeyRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{client.name}</p><p className="truncate font-mono text-xs text-ink-faint">{client.clientId}</p></div><StatusPill tone={client.isActive ? "success" : "neutral"}>{client.isActive ? "Active" : "Revoked"}</StatusPill><button onClick={() => revoke(client.clientId)} aria-label={`Revoke ${client.name}`} className="rounded-lg p-2 text-ink-faint hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button></div><div className="mt-3 text-xs text-ink-faint">Redirect: <span className="font-mono">{client.redirectUris[0] ?? "—"}</span></div></div>) : <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-ink-muted">No applications registered yet.</p>}
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Application name" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-ink-faint focus:border-brand-400/50" /><input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} placeholder="https://example.com/callback" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-ink-faint focus:border-brand-400/50" /></div>
        <button disabled={creating} onClick={createClient} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" /> {creating ? "Registering…" : "Register application"}</button>
        {secret && <div className="mt-4 rounded-2xl border border-success/20 bg-success/5 p-4"><p className="flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 className="h-4 w-4" /> Client secret created</p><p className="mt-1 text-xs text-ink-muted">Store this secret securely. Do not put it in browser or mobile client code.</p><div className="mt-3 flex items-center gap-2"><code className="min-w-0 flex-1 overflow-hidden text-ellipsis rounded-xl bg-black/20 px-3 py-2 text-xs">{showSecret ? secret : "•".repeat(Math.min(secret.length, 36))}</code><button onClick={() => setShowSecret((v) => !v)} className="rounded-lg p-2 text-ink-muted hover:text-ink" aria-label="Toggle secret visibility">{showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button onClick={() => copy(secret)} className="rounded-lg p-2 text-ink-muted hover:text-ink" aria-label="Copy client secret"><Copy className="h-4 w-4" /></button></div><button onClick={() => setSecret(null)} className="mt-2 text-xs text-ink-faint hover:text-ink">Dismiss secret</button></div>}
      </GlassCard>
      <div className="space-y-5"><GlassCard><h2 className="font-display text-lg font-semibold">Integration</h2><p className="mt-2 text-sm leading-6 text-ink-muted">Use OAuth 2.0 with PKCE for public clients and keep confidential client secrets on your server.</p><div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-ink-muted">https://auth.max-ai.name.ng/authorize</div><button onClick={() => copy("Continue with MAX AI")} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-300 hover:text-brand-200"><ExternalLink className="h-4 w-4" /> {copied ? "Copied" : "Copy integration label"}</button></GlassCard><GlassCard><div className="flex items-center gap-3"><Shield className="h-5 w-5 text-success" /><div><p className="font-medium">Security first</p><p className="text-xs text-ink-muted">Redirect URIs should be HTTPS in production and client secrets must remain server-side.</p></div></div></GlassCard></div>
    </div>
  </AuthFeatureShell>;
}
