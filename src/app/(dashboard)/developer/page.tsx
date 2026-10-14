"use client";

import { useEffect, useState } from "react";
import { Apple, CheckCircle2, Download, Globe2, KeyRound, Monitor, Pencil, Plus, RotateCcw, ShieldCheck, Smartphone, Trash2, X } from "lucide-react";
import { AuthFeatureShell, GlassCard, StatusPill } from "@/components/auth/AuthFeatureShell";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { oauthApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";
import type { OAuthApplicationType, OAuthClient, OAuthClientConfig, OAuthClientConfigUpdate, OAuthPermission } from "@/types/api";

const permissionOptions: { id: OAuthPermission; title: string; description: string }[] = [
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
const appTypes = [
  { type: "WEB" as const, title: "Web application", description: "A website or server-rendered web app", icon: Globe2 },
  { type: "SPA" as const, title: "Single-page app", description: "React, Next.js, Vue or another browser app", icon: Globe2 },
  { type: "ANDROID" as const, title: "Android app", description: "Native Android application", icon: Smartphone },
  { type: "IOS" as const, title: "iPhone & iPad app", description: "Native iOS or iPadOS application", icon: Apple },
  { type: "DESKTOP" as const, title: "Desktop app", description: "Windows, macOS or Linux application", icon: Monitor },
];
function emptyConfig(type: OAuthApplicationType): OAuthClientConfig { return { applicationType: type, authorizedOrigins: [], packageName: null, bundleId: null, certificateFingerprints: [], logoUrl: null, displayName: null, websiteUrl: null, manifestUrl: null, verificationStatus: "UNVERIFIED", verifiedAt: null }; }
function describeError(err: unknown) { return err instanceof ApiError ? `${err.message} (${err.code}, HTTP ${err.status})` : "Please try again."; }

export default function DeveloperPage() {
  const { showToast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [onboardingPurposes, setOnboardingPurposes] = useState<string[]>([]);
  const [onboardingProjectType, setOnboardingProjectType] = useState("");
  const [onboardingCapabilities, setOnboardingCapabilities] = useState<string[]>([]);
  const [onboardingHelp, setOnboardingHelp] = useState<string[]>([]);
  const [onboardingDescription, setOnboardingDescription] = useState("");
  useEffect(() => {
    try {
      setShowOnboarding(window.localStorage.getItem("max-auth:developer-onboarding-complete") !== "1");
      const saved = window.localStorage.getItem("max-auth:developer-onboarding");
      if (saved) {
        const parsed = JSON.parse(saved) as { purposes?: unknown; projectType?: unknown; capabilities?: unknown; help?: unknown; description?: unknown };
        if (Array.isArray(parsed.purposes)) setOnboardingPurposes(parsed.purposes.filter((value): value is string => typeof value === "string"));
        if (typeof parsed.projectType === "string") setOnboardingProjectType(parsed.projectType);
        if (Array.isArray(parsed.capabilities)) setOnboardingCapabilities(parsed.capabilities.filter((value): value is string => typeof value === "string"));
        if (Array.isArray(parsed.help)) setOnboardingHelp(parsed.help.filter((value): value is string => typeof value === "string"));
        if (typeof parsed.description === "string") setOnboardingDescription(parsed.description);
      }
    } catch {
      setShowOnboarding(false);
    }
  }, []);
  const toggleOnboardingValue = (current: string[], value: string, update: (next: string[]) => void) => update(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const finishOnboarding = (skip = false) => {
    try {
      if (!skip) window.localStorage.setItem("max-auth:developer-onboarding", JSON.stringify({ purposes: onboardingPurposes, projectType: onboardingProjectType, capabilities: onboardingCapabilities, help: onboardingHelp, description: onboardingDescription }));
      window.localStorage.setItem("max-auth:developer-onboarding-complete", "1");
    } catch { /* Setup must never block client management. */ }
    setShowOnboarding(false);
  };
  const clients = useAsyncData(() => oauthApi.listClients().then((r) => r.clients));
  const [createOpen, setCreateOpen] = useState(false); const [selectedType, setSelectedType] = useState<OAuthApplicationType | null>(null); const [name, setName] = useState(""); const [redirectUris, setRedirectUris] = useState<string[]>([""]); const [origins, setOrigins] = useState<string[]>([""]); const defaultPermissions: OAuthPermission[] = ["openid", "profile", "email", "offline_access"];
  const [permissions, setPermissions] = useState<OAuthPermission[]>(defaultPermissions); const [packageName, setPackageName] = useState(""); const [bundleId, setBundleId] = useState(""); const [fingerprints, setFingerprints] = useState<string[]>([""]); const [creating, setCreating] = useState(false); const [credentials, setCredentials] = useState<{ clientId: string; clientSecret: string; name: string; redirectUris: string[]; scopes: string[] } | null>(null); const [editing, setEditing] = useState<string | null>(null); const [configs, setConfigs] = useState<Record<string, OAuthClientConfig>>({}); const [saving, setSaving] = useState<string | null>(null); const [rotating, setRotating] = useState<string | null>(null);
  const reset = () => { setCreateOpen(false); setSelectedType(null); setName(""); setRedirectUris([""]); setOrigins([""]); setPermissions(defaultPermissions); setPackageName(""); setBundleId(""); setFingerprints([""]); };
  const togglePermission = (permission: OAuthPermission) => setPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]);
  const updateArray = (values: string[], setter: (value: string[]) => void, index: number, value: string) => { const next = [...values]; next[index] = value; setter(next); };
  const typeLabel = (type: OAuthApplicationType) => appTypes.find((item) => item.type === type)?.title ?? type;

  function downloadCredentials() {
    if (!credentials) return;
    const payload = {
      name: credentials.name,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      auth_url: "https://auth.max-ai.name.ng/api/v1/oauth/authorize",
      token_uri: "https://auth.max-ai.name.ng/api/v1/oauth/token",
      issuer: "https://auth.max-ai.name.ng",
      redirect_uris: credentials.redirectUris,
      scopes: credentials.scopes,
      confidential: true,
      note: "Keep this file private. Do not commit it to source control or include it in browser/mobile code. The client secret is shown only once."
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `max-oauth-${credentials.clientId}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function createClient() {
    if (!selectedType) return; const redirects = redirectUris.map((v) => v.trim()).filter(Boolean); const cleanOrigins = origins.map((v) => v.trim()).filter(Boolean);
    if (!name.trim() || !redirects.length || !permissions.length) { showToast({ title: "Complete the application details", description: "Add a name, redirect URI and at least one permission.", variant: "error" }); return; }
    if ((selectedType === "WEB" || selectedType === "SPA") && !cleanOrigins.length) { showToast({ title: "Add an authorized site", variant: "error" }); return; }
    if (selectedType === "ANDROID" && !packageName.trim()) { showToast({ title: "Android package name required", variant: "error" }); return; }
    if (selectedType === "IOS" && !bundleId.trim()) { showToast({ title: "iOS Bundle ID required", variant: "error" }); return; }
    try {
      setCreating(true);
      const result = await oauthApi.createClient({ name: name.trim(), redirectUris: redirects, scopes: permissions, isConfidential: selectedType === "WEB" || selectedType === "DESKTOP" });
      reset();
      setCredentials(result.clientSecret ? { clientId: result.client.clientId, clientSecret: result.clientSecret, name: result.client.name, redirectUris: result.client.redirectUris, scopes: result.client.scopes } : null);
      clients.refetch();
      showToast({ title: "Application created", description: "Your client ID is ready. You can manage its configuration below.", variant: "success" });
      try {
        const configPayload: OAuthClientConfigUpdate = {
          applicationType: selectedType,
          authorizedOrigins: cleanOrigins,
          certificateFingerprints: fingerprints.map((v) => v.trim()).filter(Boolean),
          displayName: name.trim(),
        };
        if (packageName.trim()) configPayload.packageName = packageName.trim();
        if (bundleId.trim()) configPayload.bundleId = bundleId.trim();
        if (cleanOrigins[0]) configPayload.websiteUrl = cleanOrigins[0];
        await oauthApi.updateClientConfig(result.client.clientId, configPayload);
        clients.refetch();
      } catch (configError) {
        showToast({ title: "Application created, configuration needs attention", description: describeError(configError), variant: "error" });
      }
    } catch (err) {
      showToast({ title: "Couldn't create application", description: describeError(err), variant: "error" });
    } finally {
      setCreating(false);
    }
  }
  async function rotateExistingClientSecret(client: OAuthClient) {
    if (!client.isConfidential) {
      showToast({ title: "No client secret for this application", description: "Public clients do not use a client secret. Only confidential clients can rotate one.", variant: "error" });
      return;
    }
    if (!window.confirm(`Rotate the secret for "${client.name}"? Its current secret will stop working immediately. Save the new secret and update your server environment before using the client again.`)) return;
    try {
      setRotating(client.id);
      const result = await oauthApi.rotateClientSecret(client.clientId);
      if (!result.clientSecret) throw new Error("MAX Auth did not return a new client secret. Check the application logs before retrying.");
      setCredentials({
        clientId: result.clientId || client.clientId,
        clientSecret: result.clientSecret,
        name: client.name,
        redirectUris: client.redirectUris,
        scopes: client.scopes,
      });
      showToast({ title: "Client secret rotated", description: "Download the JSON credentials now. The previous secret is no longer valid.", variant: "success" });
    } catch (err) {
      showToast({ title: "Could not rotate client secret", description: describeError(err), variant: "error" });
    } finally {
      setRotating(null);
    }
  }

  async function openEditor(client: OAuthClient) { if (editing === client.id) { setEditing(null); return; } setEditing(client.id); if (!configs[client.id]) { try { const result = await oauthApi.getClientConfig(client.clientId); setConfigs((current) => ({ ...current, [client.id]: result.config })); } catch (err) { showToast({ title: "Couldn't load application settings", description: describeError(err), variant: "error" }); } } }
  async function updateScopes(client: OAuthClient, scopes: OAuthPermission[]) { try { await oauthApi.updateClient(client.id, { scopes }); await clients.refetch(); showToast({ title: "Permissions updated", variant: "success" }); } catch (err) { showToast({ title: "Could not update permissions", description: describeError(err), variant: "error" }); } }
  async function save(client: OAuthClient) { const config = configs[client.id]; if (!config) return; let authorizedOrigins = config.authorizedOrigins.map((v) => v.trim()).filter(Boolean); if ((config.applicationType === "WEB" || config.applicationType === "SPA") && !authorizedOrigins.length) { try { authorizedOrigins = [new URL(client.redirectUris[0]).origin]; } catch { showToast({ title: "Couldn't save settings", description: "Add a valid HTTPS redirect URI before saving.", variant: "error" }); return; } } const clean: OAuthClientConfigUpdate = { applicationType: config.applicationType, authorizedOrigins, certificateFingerprints: config.certificateFingerprints.map((v) => v.trim()).filter(Boolean), logoUrl: config.logoUrl || null, displayName: config.displayName?.trim() || null, websiteUrl: config.websiteUrl?.trim() || null, manifestUrl: config.manifestUrl?.trim() || null }; if (config.packageName?.trim()) clean.packageName = config.packageName.trim(); if (config.bundleId?.trim()) clean.bundleId = config.bundleId.trim(); try { setSaving(client.id); const result = await oauthApi.updateClientConfig(client.clientId, clean); setConfigs((current) => ({ ...current, [client.id]: result.config })); showToast({ title: "Application settings saved", variant: "success" }); } catch (err) { showToast({ title: "Couldn't save settings", description: describeError(err), variant: "error" }); } finally { setSaving(null); } }
  async function revoke(id: string) { if (!window.confirm("Revoke this MAX Auth application?")) return; try { await oauthApi.revokeClient(id); clients.refetch(); showToast({ title: "Application revoked", variant: "success" }); } catch (err) { showToast({ title: "Couldn't revoke application", description: describeError(err), variant: "error" }); } }

  if (showOnboarding === null) return <div className="min-h-40" aria-busy="true" />;
  if (showOnboarding) return <AuthFeatureShell eyebrow="MAX Developers" title="Welcome to MAX Auth" description="Before you register an OAuth client, tell us a little about what you’re building. This is optional setup and takes about a minute.">
    <div className="space-y-5">
      <GlassCard>
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-lg font-semibold">What are you using MAX Auth for?</h2><p className="mt-1 text-sm text-ink-muted">Choose any that apply.</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-ink-muted">1 of 4</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["web", "Web application"], ["mobile", "Mobile application"], ["desktop", "Desktop software"], ["backend", "Backend or API"], ["game", "Game or game service"], ["other", "Something else"],
          ].map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-3 text-sm hover:bg-white/5"><input type="checkbox" checked={onboardingPurposes.includes(value)} onChange={() => toggleOnboardingValue(onboardingPurposes, value, setOnboardingPurposes)} className="h-4 w-4 accent-blue-500" />{label}</label>)}
        </div>
      </GlassCard>
      <GlassCard>
        <h2 className="font-display text-lg font-semibold">What kind of project is it?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["personal", "Personal project"], ["startup", "Startup or small team"], ["business", "Business"], ["learning", "School or learning"], ["client", "Client project"],
          ].map(([value, label]) => <button key={value} type="button" onClick={() => setOnboardingProjectType(value)} className={onboardingProjectType === value ? "rounded-xl border border-brand-500 bg-brand-500/10 px-3 py-2.5 text-sm text-ink" : "rounded-xl border border-white/10 px-3 py-2.5 text-sm text-ink-muted hover:bg-white/5"}>{label}</button>)}
        </div>
      </GlassCard>
      <GlassCard>
        <h2 className="font-display text-lg font-semibold">What do you want help with?</h2>
        <p className="mt-1 text-sm text-ink-muted">These are preferences, not permissions. Every client’s scopes are still chosen explicitly.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["signin", "Sign in with MAX"], ["profile", "Account profile information"], ["offline", "Longer sessions where supported"], ["manage", "Manage multiple applications"],
          ].map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-3 text-sm hover:bg-white/5"><input type="checkbox" checked={onboardingCapabilities.includes(value)} onChange={() => toggleOnboardingValue(onboardingCapabilities, value, setOnboardingCapabilities)} className="h-4 w-4 accent-blue-500" />{label}</label>)}
        </div>
        <div className="mt-5 border-t border-white/10 pt-4"><p className="text-sm font-semibold">What would be useful as you get started?</p><div className="mt-3 flex flex-wrap gap-2">{[
          ["guides", "Step-by-step guides"], ["examples", "Code examples"], ["oauth", "OAuth and security help"], ["none", "I’ll explore myself"],
        ].map(([value, label]) => <button key={value} type="button" onClick={() => toggleOnboardingValue(onboardingHelp, value, setOnboardingHelp)} className={onboardingHelp.includes(value) ? "rounded-xl border border-brand-500 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-ink" : "rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-ink-muted hover:bg-white/5"}>{label}</button>)}</div></div>
      </GlassCard>
      <GlassCard>
        <label className="block text-sm font-semibold" htmlFor="developer-project-description">Tell us about your project <span className="font-normal text-ink-muted">(optional)</span></label>
        <p className="mt-1 text-sm text-ink-muted">Don’t include passwords, client secrets or private user data.</p>
        <textarea id="developer-project-description" value={onboardingDescription} onChange={(event) => setOnboardingDescription(event.target.value.slice(0, 600))} maxLength={600} rows={3} placeholder="I’m building…" className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-brand-500" />
        <p className="mt-1 text-right text-xs text-ink-muted">{onboardingDescription.length}/600</p>
      </GlassCard>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-lg text-xs leading-5 text-ink-muted">Your answers stay in this browser on this device. They won’t grant any permissions or change existing clients.</p><div className="flex gap-2"><button type="button" onClick={() => finishOnboarding(true)} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-ink-muted hover:bg-white/5">Skip for now</button><button type="button" onClick={() => finishOnboarding(false)} className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-400">Finish setup and continue</button></div></div>
    </div>
  </AuthFeatureShell>;

  return <AuthFeatureShell eyebrow="MAX Developers" title="Build with MAX Identity" description="Create and manage MAX Auth applications, permissions and verified client configuration.">
    <div className="space-y-5"><GlassCard><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Applications</h2><p className="text-sm text-ink-muted">Every client gets its own identity configuration and redirect rules.</p></div><div className="flex gap-2"><a href="/client-tester" target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-white/5"><KeyRound className="h-4 w-4" /> Test Client ID</a><button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Create application</button></div></div>
      <div className="mt-5 space-y-3">{clients.isLoading ? <div className="h-24 animate-pulse rounded-2xl bg-white/5" /> : clients.error ? <div className="rounded-2xl bg-danger/5 p-5 text-sm text-danger">{clients.error}</div> : clients.data?.length ? clients.data.map((client) => { const config = configs[client.id] ?? emptyConfig("WEB"); const option = appTypes.find((item) => item.type === config.applicationType) ?? appTypes[0]; const Icon = option.icon; return <div key={client.id} className="overflow-hidden rounded-2xl border border-white/8 bg-black/10"><div className="flex flex-wrap items-center gap-4 p-4"><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-brand-500/10 text-brand-300">{config.logoUrl ? <img src={config.logoUrl} alt="" className="h-full w-full object-cover" /> : <Icon className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><p className="font-medium">{config.displayName || client.name}</p><p className="truncate font-mono text-xs text-ink-faint">{client.clientId}</p><p className="mt-1 text-xs text-ink-muted">{typeLabel(config.applicationType)} · {client.scopes.length} permissions · {client.redirectUris.length} redirect URI{client.redirectUris.length === 1 ? "" : "s"}</p></div><StatusPill tone={client.isActive ? "success" : "neutral"}>{client.isActive ? "Active" : "Revoked"}</StatusPill>{client.isActive && client.isConfidential && <button onClick={() => void rotateExistingClientSecret(client)} disabled={rotating === client.id} title="Generate a new one-time secret; the current secret will stop working" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-ink-muted disabled:opacity-50"><RotateCcw className="h-3.5 w-3.5" />{rotating === client.id ? "Rotating…" : "Rotate secret"}</button>}<button onClick={() => openEditor(client)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-ink-muted"><Pencil className="h-3.5 w-3.5" /> Manage</button>{client.isActive && <button onClick={() => revoke(client.id)} className="rounded-lg p-2 text-ink-faint hover:text-danger"><Trash2 className="h-4 w-4" /></button>}</div>
      {editing === client.id && <div className="border-t border-white/8 p-5"><div className="grid gap-6 lg:grid-cols-2"><section><h3 className="font-semibold">Branding</h3><p className="mt-1 text-xs text-ink-muted">Shown on the MAX sign-in and consent screen.</p><div className="mt-3 space-y-3"><input value={config.displayName ?? ""} onChange={(e) => setConfigs((c) => ({ ...c, [client.id]: { ...config, displayName: e.target.value } }))} placeholder="Company or application name" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /><input value={config.logoUrl ?? ""} onChange={(e) => setConfigs((c) => ({ ...c, [client.id]: { ...config, logoUrl: e.target.value || null } }))} placeholder="https://example.com/logo.png" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /><input value={config.websiteUrl ?? ""} onChange={(e) => setConfigs((c) => ({ ...c, [client.id]: { ...config, websiteUrl: e.target.value || null } }))} placeholder="https://example.com" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /></div></section><section><h3 className="font-semibold">MAX client manifest</h3><p className="mt-1 text-xs text-ink-muted">Optional hosted configuration used for verification and diagnostics.</p><input value={config.manifestUrl ?? ""} onChange={(e) => setConfigs((c) => ({ ...c, [client.id]: { ...config, manifestUrl: e.target.value || null } }))} placeholder="https://example.com/.well-known/max-auth.json" className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" /><div className="mt-3 flex items-center gap-2 text-xs text-ink-muted"><ShieldCheck className="h-4 w-4 text-brand-400" /> Verification: <b>{config.verificationStatus ?? "UNVERIFIED"}</b></div></section></div>
        <section className="mt-6"><h3 className="font-semibold">Permissions</h3><p className="mt-1 text-xs text-ink-muted">Choose exactly what this client may request from MAX users.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{permissionOptions.map((permission) => { const active = client.scopes.includes(permission.id); return <button key={permission.id} onClick={() => updateScopes(client, active ? client.scopes.filter((scope) => scope !== permission.id) as OAuthPermission[] : [...client.scopes, permission.id] as OAuthPermission[])} className={`rounded-xl border p-3 text-left ${active ? "border-brand-500/30 bg-brand-500/5" : "border-white/8"}`}><p className="text-sm font-semibold">{permission.title}</p><p className="mt-1 text-xs text-ink-muted">{permission.description}</p></button>; })}</div></section>
        <div className="mt-6 grid gap-6 lg:grid-cols-2"><section><div className="flex items-center justify-between"><h3 className="font-semibold">Redirect URIs</h3><button onClick={() => { const value = window.prompt("Redirect URI"); if (value?.trim()) oauthApi.updateClient(client.id, { redirectUris: [...client.redirectUris, value.trim()] }).then(() => clients.refetch()); }} className="text-xs font-semibold text-brand-300">+ Add</button></div><div className="mt-3 space-y-2">{client.redirectUris.map((uri) => <div key={uri} className="flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2"><code className="min-w-0 flex-1 break-all text-xs text-ink-muted">{uri}</code><button onClick={() => { if (client.redirectUris.length > 1) oauthApi.updateClient(client.id, { redirectUris: client.redirectUris.filter((item) => item !== uri) }).then(() => clients.refetch()); }}><X className="h-4 w-4 text-ink-faint" /></button></div>)}</div></section><section><h3 className="font-semibold">Platform identity</h3><div className="mt-3 rounded-xl border border-white/8 p-3 text-xs text-ink-muted"><p>Type: <b className="text-ink">{typeLabel(config.applicationType)}</b></p>{config.packageName && <p className="mt-2">Package: <code>{config.packageName}</code></p>}{config.bundleId && <p className="mt-2">Bundle ID: <code>{config.bundleId}</code></p>}{config.certificateFingerprints.length > 0 && <p className="mt-2">Signing fingerprints: {config.certificateFingerprints.length}</p>}</div></section></div>
        <div className="mt-6 flex justify-end"><button onClick={() => save(client)} disabled={saving === client.id} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving === client.id ? "Saving…" : "Save settings"}</button></div></div>}</div>; }) : <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-ink-muted">No applications registered yet.</p>}</div>
      {credentials && <div className="mt-5 rounded-2xl border border-success/20 bg-success/5 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> Client credentials ready — save these now</p><p className="mt-1 text-xs leading-5 text-ink-muted">This is the only time MAX Auth will show this client secret. Download the JSON file and store it in a secure location. Never put a confidential client secret in browser/mobile code or commit it to Git.</p><div className="mt-3"><p className="text-xs font-semibold text-ink-muted">Client ID</p><code className="mt-1 block overflow-auto rounded-xl bg-black/20 p-3 text-xs">{credentials.clientId}</code><p className="mt-3 text-xs font-semibold text-ink-muted">Client secret</p><code className="mt-1 block overflow-auto rounded-xl bg-black/20 p-3 text-xs">{credentials.clientSecret}</code></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={downloadCredentials} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" /> Download JSON credentials</button><button onClick={() => setCredentials(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-ink-muted">Dismiss</button></div></div>}</GlassCard></div>

    {createOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111216] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="font-display text-xl font-semibold">Create MAX application</h2><p className="mt-1 text-sm text-ink-muted">Register the app before integrating MAX Auth.</p></div><button onClick={reset}><X /></button></div>{!selectedType ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{appTypes.map((item) => { const Icon = item.icon; return <button key={item.type} onClick={() => setSelectedType(item.type)} className="rounded-2xl border border-white/8 p-4 text-left hover:border-brand-500/40"><Icon className="h-5 w-5 text-brand-400" /><p className="mt-3 font-semibold">{item.title}</p><p className="mt-1 text-xs text-ink-muted">{item.description}</p></button>; })}</div> : <div className="mt-6 space-y-5"><button onClick={() => setSelectedType(null)} className="text-xs font-semibold text-brand-300">← Change application type</button><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Application name" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm" /><div><p className="text-sm font-semibold">Redirect URI(s)</p>{redirectUris.map((value, index) => <input key={index} value={value} onChange={(e) => updateArray(redirectUris, setRedirectUris, index, e.target.value)} placeholder="https://example.com/auth/callback" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" />)}<button onClick={() => setRedirectUris([...redirectUris, ""])} className="mt-2 text-xs font-semibold text-brand-300">+ Add redirect URI</button></div>{(selectedType === "WEB" || selectedType === "SPA") && <div><p className="text-sm font-semibold">Authorized site(s)</p>{origins.map((value, index) => <input key={index} value={value} onChange={(e) => updateArray(origins, setOrigins, index, e.target.value)} placeholder="https://example.com" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm" />)}</div>}{selectedType === "ANDROID" && <input value={packageName} onChange={(e) => setPackageName(e.target.value)} placeholder="Android package name" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm" />}{selectedType === "IOS" && <input value={bundleId} onChange={(e) => setBundleId(e.target.value)} placeholder="iOS Bundle ID" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm" />}<div><p className="text-sm font-semibold">Permissions</p><p className="mt-1 text-xs text-ink-muted">Users will only be asked to approve the permissions you select.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{permissionOptions.map((permission) => { const active = permissions.includes(permission.id); return <button key={permission.id} onClick={() => togglePermission(permission.id)} className={`rounded-xl border p-3 text-left ${active ? "border-brand-500/40 bg-brand-500/5" : "border-white/8"}`}><p className="text-sm font-semibold">{permission.title}</p><p className="mt-1 text-xs text-ink-muted">{permission.description}</p></button>; })}</div></div><button onClick={createClient} disabled={creating} className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{creating ? "Creating application…" : "Create application"}</button></div>}</div></div>}
  </AuthFeatureShell>;
}
