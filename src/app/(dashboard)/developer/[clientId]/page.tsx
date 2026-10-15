"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, Download, KeyRound, Save, ShieldCheck } from "lucide-react";
import { AuthFeatureShell, GlassCard, StatusPill } from "@/components/auth/AuthFeatureShell";
import { useToast } from "@/lib/hooks/useToast";
import { oauthApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";
import type { OAuthClient, OAuthClientConfig, OAuthClientConfigUpdate, OAuthPermission } from "@/types/api";

const permissions: { id: OAuthPermission; title: string; description: string }[] = [
  { id: "openid", title: "Sign in with MAX", description: "Authenticate the user and receive a stable account subject." },
  { id: "profile", title: "Basic profile", description: "Share the user's display name and username." },
  { id: "email", title: "Email address", description: "Share the email address associated with the MAX Account." },
  { id: "account:read", title: "Account details", description: "Read basic MAX account information." },
  { id: "identity:read", title: "User ID", description: "Read the signed-in MAX account identifier." },
  { id: "profile:read", title: "Extended profile", description: "Read additional profile details and profile picture." },
  { id: "email:read", title: "Email verification", description: "Read email verification status." },
  { id: "memory:read", title: "MAX Memory", description: "Read memory data the user has explicitly approved." },
  { id: "offline_access", title: "Stay signed in", description: "Use refresh tokens for longer sessions." },
];
const appTypeOptions = ["WEB", "SPA", "ANDROID", "IOS", "DESKTOP"] as const;
type AppType = typeof appTypeOptions[number];
const emptyConfig = (): OAuthClientConfig => ({ applicationType: "WEB", authorizedOrigins: [], packageName: null, bundleId: null, certificateFingerprints: [], logoUrl: null, displayName: null, websiteUrl: null, manifestUrl: null, verificationStatus: "UNVERIFIED", verifiedAt: null });
const errorText = (error: unknown) => error instanceof ApiError ? `${error.message} (${error.code}, HTTP ${error.status})` : error instanceof Error ? error.message : "Please try again.";

export default function OAuthClientDetailsPage() {
  const params = useParams<{ clientId: string }>();
  const { showToast } = useToast();
  const [client, setClient] = useState<OAuthClient | null>(null);
  const [config, setConfig] = useState<OAuthClientConfig>(emptyConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await oauthApi.listClients();
      const found = result.clients.find((item) => item.id === params.clientId || item.clientId === params.clientId);
      if (!found) {
        setClient(null);
        return;
      }
      setClient(found);
      try {
        const configResult = await oauthApi.getClientConfig(found.clientId);
        setConfig(configResult.config);
      } catch {
        setConfig(emptyConfig());
      }
    } catch (error) {
      showToast({ title: "Couldn't load application", description: errorText(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [params.clientId, showToast]);

  useEffect(() => { void load(); }, [load]);

  async function saveSettings() {
    if (!client) return;
    const origins = config.authorizedOrigins.map((item) => item.trim()).filter(Boolean);
    const update: OAuthClientConfigUpdate = {
      applicationType: config.applicationType,
      authorizedOrigins: origins,
      certificateFingerprints: config.certificateFingerprints.map((item) => item.trim()).filter(Boolean),
      logoUrl: config.logoUrl || null,
      displayName: config.displayName?.trim() || null,
      websiteUrl: config.websiteUrl?.trim() || null,
      manifestUrl: config.manifestUrl?.trim() || null,
    };
    if (config.packageName?.trim()) update.packageName = config.packageName.trim();
    if (config.bundleId?.trim()) update.bundleId = config.bundleId.trim();
    try {
      setSaving(true);
      const result = await oauthApi.updateClientConfig(client.clientId, update);
      setConfig(result.config);
      showToast({ title: "Application settings saved", variant: "success" });
    } catch (error) {
      showToast({ title: "Couldn't save settings", description: errorText(error), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function resetSecret() {
    if (!client?.isConfidential || !client.isActive) return;
    if (!window.confirm(`Reset the secret for "${client.name}"? The current secret will stop working immediately. Update your server environment after saving the new secret.`)) return;
    try {
      setResetting(true);
      const result = await oauthApi.rotateClientSecret(client.id);
      if (!result.clientSecret) throw new Error("MAX Auth did not return a new secret. Check the server logs before retrying.");
      setSecret(result.clientSecret);
      showToast({ title: "Secret reset", description: "Save or download the new secret now. It will not be shown again.", variant: "success" });
    } catch (error) {
      showToast({ title: "Could not reset secret", description: errorText(error), variant: "error" });
    } finally {
      setResetting(false);
    }
  }

  function downloadSecret() {
    if (!client || !secret) return;
    const payload = {
      name: client.name,
      client_id: client.clientId,
      client_secret: secret,
      auth_url: "https://auth.max-ai.name.ng/api/v1/oauth/authorize",
      token_uri: "https://auth.max-ai.name.ng/api/v1/oauth/token",
      issuer: "https://auth.max-ai.name.ng",
      redirect_uris: client.redirectUris,
      scopes: client.scopes,
      confidential: true,
      note: "Keep this file private. Do not commit it to source control or include it in browser/mobile code. This secret is shown only once."
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `max-oauth-${client.clientId}-credentials.json`;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    showToast({ title: "Download requested", description: "If your browser blocked the file, use Copy credentials JSON instead.", variant: "success" });
  }

  async function copySecret() {
    if (!client || !secret) return;
    const payload = JSON.stringify({ client_id: client.clientId, client_secret: secret }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      showToast({ title: "Credentials copied", description: "Store them somewhere secure.", variant: "success" });
    } catch {
      showToast({ title: "Clipboard unavailable", description: "Use the download button or copy the displayed secret manually.", variant: "error" });
    }
  }

  async function updateScopes(nextScopes: OAuthPermission[]) {
    if (!client) return;
    try {
      await oauthApi.updateClient(client.id, { scopes: nextScopes });
      setClient({ ...client, scopes: nextScopes });
      showToast({ title: "Permissions updated", variant: "success" });
    } catch (error) {
      showToast({ title: "Could not update permissions", description: errorText(error), variant: "error" });
    }
  }

  async function updateClientType(isConfidential: boolean) {
    if (!client || client.isConfidential === isConfidential) return;
    const nextType = isConfidential ? "Confidential" : "Public";
    const warning = isConfidential
      ? "Switching to Confidential means this application must authenticate token requests with a client secret. Never use a confidential client in browser or mobile code."
      : "Switching to Public disables client-secret authentication. Use Authorization Code with PKCE. Existing authorization codes, access tokens, refresh tokens and consent grants for this client will be revoked, so users may need to sign in and approve access again.";
    if (!window.confirm(`Change this OAuth client to ${nextType}?\n\n${warning}\n\nContinue?`)) return;
    try {
      const result = await oauthApi.updateClient(client.id, { isConfidential });
      setClient(result.client);
      setSecret(null);
      showToast({ title: `Client type changed to ${nextType}`, description: "The new authentication mode has been saved.", variant: "success" });
    } catch (error) {
      showToast({ title: "Could not change client type", description: errorText(error), variant: "error" });
    }
  }

  async function addRedirect() {
    if (!client) return;
    const value = window.prompt("Enter the exact redirect URI (including https://)");
    if (!value?.trim()) return;
    try {
      new URL(value.trim());
      await oauthApi.updateClient(client.id, { redirectUris: [...client.redirectUris, value.trim()] });
      setClient({ ...client, redirectUris: [...client.redirectUris, value.trim()] });
      showToast({ title: "Redirect URI added", variant: "success" });
    } catch (error) {
      showToast({ title: "Could not add redirect URI", description: errorText(error), variant: "error" });
    }
  }

  async function removeRedirect(uri: string) {
    if (!client || client.redirectUris.length <= 1) return;
    try {
      const next = client.redirectUris.filter((item) => item !== uri);
      await oauthApi.updateClient(client.id, { redirectUris: next });
      setClient({ ...client, redirectUris: next });
      showToast({ title: "Redirect URI removed", variant: "success" });
    } catch (error) {
      showToast({ title: "Could not remove redirect URI", description: errorText(error), variant: "error" });
    }
  }

  if (loading) return <AuthFeatureShell eyebrow="MAX Developers" title="Loading application…" description="Fetching this OAuth client's settings."><div className="h-32 animate-pulse rounded-2xl bg-white/5" /></AuthFeatureShell>;
  if (!client) return <AuthFeatureShell eyebrow="MAX Developers" title="Application not found" description="This client may have been removed or you may not have access to it."><Link href="/developer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm"><ArrowLeft className="h-4 w-4" /> Back to applications</Link></AuthFeatureShell>;

  return <AuthFeatureShell eyebrow="MAX Developers" title={config.displayName || client.name} description="Manage this OAuth client, its permissions, branding and credentials.">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Link href="/developer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to applications</Link>
      <StatusPill tone={client.isActive ? "success" : "neutral"}>{client.isActive ? "Active" : "Revoked"}</StatusPill>
    </div>
    <div className="space-y-5">
      <GlassCard>
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="font-semibold">Client identity</h2><p className="text-xs text-ink-muted">Created {new Date(client.createdAt).toLocaleDateString()}</p></div></div>
        <label className="mt-5 block text-xs font-semibold text-ink-muted">Client ID</label>
        <div className="mt-2 flex flex-wrap items-center gap-2"><code className="min-w-0 flex-1 break-all rounded-xl bg-black/20 p-3 text-xs">{client.clientId}</code><button onClick={() => void navigator.clipboard.writeText(client.clientId).then(() => showToast({ title: "Client ID copied", variant: "success" })).catch(() => showToast({ title: "Couldn't copy client ID", variant: "error" }))} className="rounded-xl border border-white/10 p-3" aria-label="Copy client ID"><Copy className="h-4 w-4" /></button></div>
        <label className="mt-5 block text-xs font-semibold text-ink-muted">Application display name</label>
        <input value={config.displayName ?? client.name} onChange={(event) => setConfig({ ...config, displayName: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-ink-muted">Application type<select value={config.applicationType} onChange={(event) => setConfig({ ...config, applicationType: event.target.value as AppType })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-ink">{appTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label className="block text-xs font-semibold text-ink-muted">Website URL<input value={config.websiteUrl ?? ""} onChange={(event) => setConfig({ ...config, websiteUrl: event.target.value || null })} placeholder="https://example.com" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /></label>
          <label className="block text-xs font-semibold text-ink-muted">Logo URL<input value={config.logoUrl ?? ""} onChange={(event) => setConfig({ ...config, logoUrl: event.target.value || null })} placeholder="https://example.com/logo.png" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /></label>
          <label className="block text-xs font-semibold text-ink-muted">Manifest URL<input value={config.manifestUrl ?? ""} onChange={(event) => setConfig({ ...config, manifestUrl: event.target.value || null })} placeholder="https://example.com/.well-known/max-auth.json" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /></label>
        </div>
        <div className="mt-4"><label className="block text-xs font-semibold text-ink-muted">Authorized origins (one per line)<textarea value={config.authorizedOrigins.join("\n")} onChange={(event) => setConfig({ ...config, authorizedOrigins: event.target.value.split("\n") })} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" placeholder="https://example.com" /></label></div>
        {config.applicationType === "ANDROID" && <label className="mt-4 block text-xs font-semibold text-ink-muted">Android package name<input value={config.packageName ?? ""} onChange={(event) => setConfig({ ...config, packageName: event.target.value || null })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /></label>}
        {config.applicationType === "IOS" && <label className="mt-4 block text-xs font-semibold text-ink-muted">iOS bundle ID<input value={config.bundleId ?? ""} onChange={(event) => setConfig({ ...config, bundleId: event.target.value || null })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /></label>}
        <button onClick={() => void saveSettings()} disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save settings"}</button>
      </GlassCard>
      <GlassCard>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-brand-400" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Client authentication type</h2>
            <p className="mt-1 text-xs leading-5 text-ink-muted">Choose whether this app uses PKCE as a public client or authenticates with a secret from a secure server.</p>
          </div>
          <StatusPill tone={client.isConfidential ? "warning" : "success"}>{client.isConfidential ? "Confidential" : "Public"}</StatusPill>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => void updateClientType(false)} disabled={!client.isConfidential || !client.isActive} aria-pressed={!client.isConfidential} className={`rounded-xl border p-4 text-left transition disabled:cursor-default ${!client.isConfidential ? "border-brand-500/50 bg-brand-500/10" : "border-white/10 hover:bg-white/5"}`}>
            <span className="flex items-center justify-between gap-2 text-sm font-semibold">Public client {!client.isConfidential && <CheckCircle2 className="h-4 w-4 text-brand-400" />}</span>
            <span className="mt-1 block text-xs leading-5 text-ink-muted">For browser, SPA and mobile apps. Uses Authorization Code with PKCE and never sends a client secret.</span>
          </button>
          <button type="button" onClick={() => void updateClientType(true)} disabled={client.isConfidential || !client.isActive} aria-pressed={client.isConfidential} className={`rounded-xl border p-4 text-left transition disabled:cursor-default ${client.isConfidential ? "border-brand-500/50 bg-brand-500/10" : "border-white/10 hover:bg-white/5"}`}>
            <span className="flex items-center justify-between gap-2 text-sm font-semibold">Confidential client {client.isConfidential && <CheckCircle2 className="h-4 w-4 text-brand-400" />}</span>
            <span className="mt-1 block text-xs leading-5 text-ink-muted">For trusted server-side apps that can securely store a client secret.</span>
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-ink-muted">Changing this setting revokes existing tokens and consent grants for this client. The change applies immediately after confirmation.</p>
      </GlassCard>
      <GlassCard>
        <h2 className="font-semibold">Redirect URIs</h2><p className="mt-1 text-xs text-ink-muted">These must exactly match the redirect URI sent during OAuth sign-in.</p>
        <div className="mt-4 space-y-2">{client.redirectUris.map((uri) => <div key={uri} className="flex items-center gap-2 rounded-xl border border-white/8 p-3"><code className="min-w-0 flex-1 break-all text-xs text-ink-muted">{uri}</code><button onClick={() => void removeRedirect(uri)} disabled={client.redirectUris.length <= 1} className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30">Remove</button></div>)}</div>
        <button onClick={() => void addRedirect()} className="mt-4 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold">+ Add redirect URI</button>
      </GlassCard>
      <GlassCard>
        <h2 className="font-semibold">Permissions / scopes</h2><p className="mt-1 text-xs text-ink-muted">Choose the information and access this client may request. Changing scopes can affect existing grants.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{permissions.map((permission) => { const active = client.scopes.includes(permission.id); return <button type="button" key={permission.id} onClick={() => void updateScopes(active ? client.scopes.filter((scope) => scope !== permission.id) as OAuthPermission[] : [...client.scopes, permission.id] as OAuthPermission[])} className={`rounded-xl border p-4 text-left ${active ? "border-brand-500/40 bg-brand-500/5" : "border-white/10 hover:bg-white/5"}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{permission.title}</span>{active && <CheckCircle2 className="h-4 w-4 text-brand-400" />}</div><p className="mt-1 text-xs text-ink-muted">{permission.description}</p><code className="mt-2 block text-[11px] text-ink-faint">{permission.id}</code></button>; })}</div>
      </GlassCard>
      <GlassCard>
        <div className="flex items-start gap-3"><KeyRound className="mt-1 h-5 w-5 text-brand-400" /><div className="min-w-0 flex-1"><h2 className="font-semibold">Client secret</h2><p className="mt-1 text-xs leading-5 text-ink-muted">Resetting immediately invalidates the previous secret. The new secret is shown once only. Update your server environment after saving it.</p></div></div>
        {!client.isConfidential ? <p className="mt-4 rounded-xl border border-white/10 p-3 text-sm text-ink-muted">This is a public client and does not use a client secret.</p> : <button onClick={() => void resetSecret()} disabled={resetting || !client.isActive} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-500/30 px-4 py-2.5 text-sm font-semibold text-amber-300 disabled:opacity-50"><KeyRound className="h-4 w-4" />{resetting ? "Resetting…" : "Reset Secret"}</button>}
        {secret && <div className="mt-5 rounded-xl border border-success/20 bg-success/5 p-4"><p className="text-sm font-semibold text-success">New secret generated — save it now</p><p className="mt-1 text-xs text-ink-muted">Download the JSON file or copy the credentials before leaving this page.</p><label className="mt-4 block text-xs font-semibold text-ink-muted">Client secret</label><code className="mt-2 block break-all rounded-xl bg-black/20 p-3 text-xs">{secret}</code><div className="mt-4 flex flex-wrap gap-2"><button onClick={downloadSecret} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" /> Download credentials JSON</button><button onClick={() => void copySecret()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold"><Copy className="h-4 w-4" /> Copy credentials JSON</button><button onClick={() => setSecret(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm">I've saved it</button></div></div>}
      </GlassCard>
    </div>
  </AuthFeatureShell>;
}
