"use client";

import { useState } from "react";
import { Apple, CheckCircle2, Copy, ExternalLink, Globe2, Monitor, Pencil, Plus, Shield, Smartphone, Trash2, X } from "lucide-react";
import { AuthFeatureShell, GlassCard, StatusPill } from "@/components/auth/AuthFeatureShell";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { oauthApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";
import type { OAuthApplicationType, OAuthClient, OAuthClientConfig } from "@/types/api";

const scopes = ["openid", "profile", "email"];
const appTypes = [
  { type: "WEB" as const, title: "Web application", description: "A website or server-rendered web app", icon: Globe2 },
  { type: "SPA" as const, title: "Single-page app", description: "A browser app such as React, Next.js or Vue", icon: Globe2 },
  { type: "ANDROID" as const, title: "Android app", description: "Native Android or Android-based app", icon: Smartphone },
  { type: "IOS" as const, title: "iPhone & iPad app", description: "Native iOS or iPadOS app", icon: Apple },
  { type: "DESKTOP" as const, title: "Desktop app", description: "Windows, macOS or Linux application", icon: Monitor },
];

function errorDescription(err: unknown, fallback: string) {
  if (!(err instanceof ApiError)) return fallback;
  return `${err.message} (${err.code}, HTTP ${err.status})${err.requestId ? ` • Request ID: ${err.requestId}` : ""}`;
}
function emptyConfig(type: OAuthApplicationType): OAuthClientConfig { return { applicationType: type, authorizedOrigins: [], packageName: null, bundleId: null, certificateFingerprints: [] }; }

export default function DeveloperPage() {
  const { showToast } = useToast();
  const clients = useAsyncData(() => oauthApi.listClients().then((r) => r.clients));
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<OAuthApplicationType | null>(null);
  const [name, setName] = useState("");
  const [redirectUris, setRedirectUris] = useState<string[]>([""]);
  const [authorizedOrigins, setAuthorizedOrigins] = useState<string[]>([""]);
  const [packageName, setPackageName] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [fingerprints, setFingerprints] = useState<string[]>([""]);
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, OAuthClientConfig>>({});
  const [savingConfig, setSavingConfig] = useState<string | null>(null);

  const resetCreate = () => { setCreateOpen(false); setSelectedType(null); setName(""); setRedirectUris([""]); setAuthorizedOrigins([""]); setPackageName(""); setBundleId(""); setFingerprints([""]); };
  const chooseType = (type: OAuthApplicationType) => { setSelectedType(type); setRedirectUris([""]); setAuthorizedOrigins([""]); setPackageName(""); setBundleId(""); setFingerprints([""]); };
  const updateList = (setter: (v: string[]) => void, values: string[], index: number, value: string) => { const next = [...values]; next[index] = value; setter(next); };
  const typeLabel = (type: OAuthApplicationType) => appTypes.find((item) => item.type === type)?.title ?? type;

  async function createClient() {
    if (!selectedType) return;
    const redirects = redirectUris.map((v) => v.trim()).filter(Boolean);
    const origins = authorizedOrigins.map((v) => v.trim()).filter(Boolean);
    if (!name.trim() || !redirects.length) { showToast({ title: "Complete the application details", description: "Application name and at least one redirect URI are required.", variant: "error" }); return; }
    if ((selectedType === "WEB" || selectedType === "SPA") && !origins.length) { showToast({ title: "Add an authorized site", variant: "error" }); return; }
    if (selectedType === "ANDROID" && !packageName.trim()) { showToast({ title: "Android package name required", variant: "error" }); return; }
    if (selectedType === "IOS" && !bundleId.trim()) { showToast({ title: "iOS bundle ID required", variant: "error" }); return; }
    try {
      setCreating(true);
      const result = await oauthApi.createClient({ name: name.trim(), redirectUris: redirects, scopes, isConfidential: selectedType === "WEB" || selectedType === "DESKTOP" });
      await oauthApi.updateClientConfig(result.client.clientId, { applicationType: selectedType, authorizedOrigins: origins, packageName: packageName.trim() || null, bundleId: bundleId.trim() || null, certificateFingerprints: fingerprints.map((v) => v.trim()).filter(Boolean) });
      setSecret(result.clientSecret ?? null); resetCreate(); clients.refetch(); showToast({ title: "Application created", description: `${result.client.name} is ready for MAX Identity.`, variant: "success" });
    } catch (err) { showToast({ title: "Couldn't create application", description: errorDescription(err, "Please try again."), variant: "error" }); }
    finally { setCreating(false); }
  }

  async function openEditor(client: OAuthClient) {
    if (editingClient === client.id) { setEditingClient(null); return; }
    setEditingClient(client.id);
    if (!configs[client.id]) { try { const result = await oauthApi.getClientConfig(client.clientId); setConfigs((current) => ({ ...current, [client.id]: result.config })); } catch (err) { showToast({ title: "Couldn't load application settings", description: errorDescription(err, "Please try again."), variant: "error" }); } }
  }
  async function saveConfig(client: OAuthClient) {
    const config = configs[client.id]; if (!config) return;
    const clean = { ...config, authorizedOrigins: config.authorizedOrigins.map((v) => v.trim()).filter(Boolean), certificateFingerprints: config.certificateFingerprints.map((v) => v.trim()).filter(Boolean) };
    try { setSavingConfig(client.id); const result = await oauthApi.updateClientConfig(client.clientId, clean); setConfigs((current) => ({ ...current, [client.id]: result.config })); showToast({ title: "Application settings saved", variant: "success" }); } catch (err) { showToast({ title: "Couldn't save settings", description: errorDescription(err, "Check the values and try again."), variant: "error" }); } finally { setSavingConfig(null); }
  }
  async function addRedirect(client: OAuthClient) {
    const value = window.prompt("New redirect URI", "https://example.com/auth/callback"); if (!value?.trim() || client.redirectUris.includes(value.trim())) return;
    try { await oauthApi.updateClient(client.id, { redirectUris: [...client.redirectUris, value.trim()] }); clients.refetch(); showToast({ title: "Redirect URI added", variant: "success" }); } catch (err) { showToast({ title: "Couldn't add redirect URI", description: errorDescription(err, "Please try again."), variant: "error" }); }
  }
  async function removeRedirect(client: OAuthClient, uri: string) {
    if (client.redirectUris.length <= 1) { showToast({ title: "Keep at least one redirect URI", variant: "error" }); return; }
    try { await oauthApi.updateClient(client.id, { redirectUris: client.redirectUris.filter((item) => item !== uri) }); clients.refetch(); showToast({ title: "Redirect URI removed", variant: "success" }); } catch (err) { showToast({ title: "Couldn't remove redirect URI", description: errorDescription(err, "Please try again."), variant: "error" }); }
  }
  async function revoke(id: string) {
    if (!window.confirm("Revoke this MAX Auth application? Existing access using it should stop working.")) return;
    try { await oauthApi.revokeClient(id); clients.refetch(); showToast({ title: "Application revoked", variant: "success" }); } catch (err) { showToast({ title: "Couldn't revoke application", description: errorDescription(err, "Please try again."), variant: "error" }); }
  }
  async function copy(value: string) { await navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1600); }

  return <AuthFeatureShell eyebrow="MAX Developers" title="Build with MAX Identity" description="Create and manage MAX Auth applications for websites, mobile apps and desktop software.">
    <div className="space-y-5">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Applications</h2><p className="text-sm text-ink-muted">Each client gets its own identity configuration and redirect rules.</p></div><button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"><Plus className="h-4 w-4" /> Create application</button></div>
        <div className="mt-5 space-y-3">
          {clients.isLoading ? <div className="h-24 animate-pulse rounded-2xl bg-white/5" /> : clients.error ? <div className="rounded-2xl border border-danger/20 bg-danger/5 p-5 text-sm text-danger">{clients.error}</div> : clients.data?.length ? clients.data.map((client) => {
            const config = configs[client.id] ?? emptyConfig("WEB"); const option = appTypes.find((item) => item.type === config.applicationType); const Icon = option?.icon ?? Globe2;
            return <div key={client.id} className="overflow-hidden rounded-2xl border border-white/8 bg-black/10"><div className="flex flex-wrap items-center gap-4 p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{client.name}</p><p className="truncate font-mono text-xs text-ink-faint">{client.clientId}</p><p className="mt-1 text-xs text-ink-muted">{typeLabel(config.applicationType)} · {client.redirectUris.length} redirect {client.redirectUris.length === 1 ? "URI" : "URIs"}</p></div><StatusPill tone={client.isActive ? "success" : "neutral"}>{client.isActive ? "Active" : "Revoked"}</StatusPill><button onClick={() => openEditor(client)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-ink-muted hover:bg-white/5 hover:text-ink"><Pencil className="h-3.5 w-3.5" /> Manage</button>{client.isActive && <button onClick={() => revoke(client.id)} className="rounded-lg p-2 text-ink-faint hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button>}</div>
              {editingClient === client.id && <div className="border-t border-white/8 p-5"><div className="grid gap-5 lg:grid-cols-2"><section><div className="flex items-center justify-between"><div><h3 className="font-semibold">Redirect URIs</h3><p className="mt-1 text-xs text-ink-muted">Authorization codes can only return to these exact addresses.</p></div><button onClick={() => addRedirect(client)} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 px-3 py-2 text-xs font-semibold text-brand-300"><Plus className="h-3.5 w-3.5" /> Add</button></div><div className="mt-3 space-y-2">{client.redirectUris.map((uri) => <div key={uri} className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/10 px-3 py-2"><code className="min-w-0 flex-1 break-all text-xs text-ink-muted">{uri}</code><button onClick={() => removeRedirect(client, uri)} className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-danger/10 hover:text-danger"><X className="h-4 w-4" /></button></div>)}</div></section><section><h3 className="font-semibold">Authorized sites</h3><p className="mt-1 text-xs text-ink-muted">Browser origins allowed to use this client.</p><div className="mt-3 space-y-2">{config.authorizedOrigins.map((origin, index) => <div key={`${origin}-${index}`} className="flex gap-2"><input value={origin} onChange={(e) => setConfigs((current) => ({ ...current, [client.id]: { ...config, authorizedOrigins: config.authorizedOrigins.map((v, i) => i === index ? e.target.value : v) } }))} placeholder="https://example.com" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-brand-400/50" /><button onClick={() => setConfigs((current) => ({ ...current, [client.id]: { ...config, authorizedOrigins: config.authorizedOrigins.filter((_, i) => i !== index) } }))} className="rounded-lg p-2 text-ink-faint hover:text-danger"><X className="h-4 w-4" /></button></div>)}<button onClick={() => setConfigs((current) => ({ ...current, [client.id]: { ...config, authorizedOrigins: [...config.authorizedOrigins, ""] } }))} className="text-xs font-semibold text-brand-300">+ Add authorized site</button></div></section></div>
                {(config.applicationType === "ANDROID" || config.applicationType === "IOS") && <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="text-xs font-semibold text-ink-muted">{config.applicationType === "ANDROID" ? "Android package name" : "iOS bundle ID"}</label><input value={config.applicationType === "ANDROID" ? config.packageName ?? "" : config.bundleId ?? ""} onChange={(e) => setConfigs((current) => ({ ...current, [client.id]: { ...config, ...(config.applicationType === "ANDROID" ? { packageName: e.target.value } : { bundleId: e.target.value }) } }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-brand-400/50" /></div><div><label className="text-xs font-semibold text-ink-muted">Signing certificate fingerprints</label><div className="mt-2 space-y-2">{config.certificateFingerprints.map((fp, index) => <input key={`${fp}-${index}`} value={fp} onChange={(e) => setConfigs((current) => ({ ...current, [client.id]: { ...config, certificateFingerprints: config.certificateFingerprints.map((v, i) => i === index ? e.target.value : v) } }))} placeholder="SHA-256 fingerprint" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-brand-400/50" />)}<button onClick={() => setConfigs((current) => ({ ...current, [client.id]: { ...config, certificateFingerprints: [...config.certificateFingerprints, ""] } }))} className="text-xs font-semibold text-brand-300">+ Add fingerprint</button></div></div></div>}
                <div className="mt-5 flex justify-end"><button onClick={() => saveConfig(client)} disabled={savingConfig === client.id} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{savingConfig === client.id ? "Saving…" : "Save application settings"}</button></div></div>}
            </div>;
          }) : <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-ink-muted">No applications registered yet.</p>}
        </div>
        {secret && <div className="mt-5 rounded-2xl border border-success/20 bg-success/5 p-4"><p className="flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 className="h-4 w-4" /> Client secret created</p><p className="mt-1 text-xs text-ink-muted">This secret is shown once. Never put it in a browser or mobile app.</p><div className="mt-3 flex items-center gap-2"><code className="min-w-0 flex-1 overflow-hidden text-ellipsis rounded-xl bg-black/20 px-3 py-2 text-xs">{showSecret ? secret : "•".repeat(Math.min(secret.length, 36))}</code><button onClick={() => setShowSecret((v) => !v)} className="rounded-lg p-2 text-xs text-ink-muted">{showSecret ? "Hide" : "Show"}</button><button onClick={() => copy(secret)} className="rounded-lg p-2 text-xs text-ink-muted">{copied ? "Copied" : "Copy"}</button></div><button onClick={() => setSecret(null)} className="mt-2 text-xs text-ink-faint">Dismiss</button></div>}
      </GlassCard>
      <div className="grid gap-5 lg:grid-cols-2"><GlassCard><h2 className="font-display text-lg font-semibold">OAuth configuration</h2><p className="mt-2 text-sm leading-6 text-ink-muted">Use Authorization Code + S256 PKCE. Browser and mobile clients do not need a secret.</p><div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-ink-muted">https://api.max-ai.name.ng/authorize</div></GlassCard><GlassCard><div className="flex items-center gap-3"><Shield className="h-5 w-5 text-success" /><div><p className="font-medium">MAX Identity SDKs</p><p className="text-xs text-ink-muted">Use PKCE on Android and iOS. Keep confidential secrets on your server.</p></div></div><a href="https://developers.max-ai.name.ng" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-300"><ExternalLink className="h-4 w-4" /> Open developer docs</a></GlassCard></div>
    </div>
    {createOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-base-raised shadow-2xl"><div className="flex items-center justify-between border-b border-white/8 px-5 py-4"><div><h2 className="font-display text-lg font-semibold">Create an application</h2><p className="text-xs text-ink-muted">Choose where your MAX Account sign-in will run.</p></div><button onClick={resetCreate} className="rounded-lg p-2 text-ink-faint hover:bg-white/5"><X className="h-5 w-5" /></button></div><div className="max-h-[75vh] overflow-y-auto p-5">{!selectedType ? <div className="grid gap-3 sm:grid-cols-2">{appTypes.map(({ type, title, description, icon: Icon }) => <button key={type} onClick={() => chooseType(type)} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-black/10 p-4 text-left hover:border-brand-400/40 hover:bg-brand-500/5"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><Icon className="h-5 w-5" /></div><div><p className="font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-ink-muted">{description}</p></div></button>)}</div> : <div><button onClick={() => setSelectedType(null)} className="mb-5 text-sm font-medium text-ink-muted hover:text-ink">← Change application type</button><div className="mb-5 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4"><p className="text-xs font-semibold uppercase tracking-[.12em] text-brand-300">{typeLabel(selectedType)}</p><p className="mt-1 text-sm text-ink-muted">MAX Auth will configure this client for the selected platform.</p></div><div className="space-y-4"><label className="block"><span className="text-sm font-medium">Application name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="My application" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-brand-400/50" /></label><div><div className="flex items-center justify-between"><span className="text-sm font-medium">Redirect URIs</span><button onClick={() => setRedirectUris([...redirectUris, ""])} className="text-xs font-semibold text-brand-300">+ Add another</button></div><div className="mt-2 space-y-2">{redirectUris.map((uri, index) => <div key={index} className="flex gap-2"><input value={uri} onChange={(e) => updateList(setRedirectUris, redirectUris, index, e.target.value)} placeholder={selectedType === "ANDROID" ? "com.example.app://oauth/callback" : selectedType === "IOS" ? "myapp://oauth/callback" : "https://example.com/auth/callback"} className="min-w-0 flex-1 h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-brand-400/50" />{redirectUris.length > 1 && <button onClick={() => setRedirectUris(redirectUris.filter((_, i) => i !== index))} className="rounded-lg p-2 text-ink-faint hover:text-danger"><X className="h-4 w-4" /></button>}</div>)}</div></div>{(selectedType === "WEB" || selectedType === "SPA") && <div><div className="flex items-center justify-between"><span className="text-sm font-medium">Authorized sites</span><button onClick={() => setAuthorizedOrigins([...authorizedOrigins, ""])} className="text-xs font-semibold text-brand-300">+ Add site</button></div><div className="mt-2 space-y-2">{authorizedOrigins.map((origin, index) => <input key={index} value={origin} onChange={(e) => updateList(setAuthorizedOrigins, authorizedOrigins, index, e.target.value)} placeholder="https://example.com" className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-brand-400/50" />)}</div></div>}{selectedType === "ANDROID" && <div className="grid gap-4 sm:grid-cols-2"><label><span className="text-sm font-medium">Package name</span><input value={packageName} onChange={(e) => setPackageName(e.target.value)} placeholder="com.example.app" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-brand-400/50" /></label><label><span className="text-sm font-medium">SHA-256 certificate</span><input value={fingerprints[0]} onChange={(e) => updateList(setFingerprints, fingerprints, 0, e.target.value)} placeholder="AB:CD:..." className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-brand-400/50" /></label></div>}{selectedType === "IOS" && <label className="block"><span className="text-sm font-medium">Bundle ID</span><input value={bundleId} onChange={(e) => setBundleId(e.target.value)} placeholder="com.example.app" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-brand-400/50" /></label>}<div className="flex justify-end gap-3 pt-3"><button onClick={resetCreate} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-ink-muted">Cancel</button><button onClick={createClient} disabled={creating} className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{creating ? "Creating…" : "Create application"}</button></div></div></div>}</div></div></div>}
  </AuthFeatureShell>;
}
