"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clipboard, Code2, ExternalLink, Save, Sparkles } from "lucide-react";
import { AuthFeatureShell, GlassCard } from "@/components/auth/AuthFeatureShell";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { oauthApi } from "@/lib/api/security";
import type { OAuthClient, OAuthClientConfig, OAuthClientConfigUpdate } from "@/types/api";

function defaultConfig(client: OAuthClient): OAuthClientConfig {
  return {
    applicationType: "WEB",
    authorizedOrigins: [],
    packageName: null,
    bundleId: null,
    certificateFingerprints: [],
    autoPrompt: false,
    popupPlacement: "bottom-right",
    popupFrequency: "session",
    promptDelay: 1500,
    displayName: client.name,
    websiteUrl: null,
    logoUrl: null,
    manifestUrl: null,
    verificationStatus: "UNVERIFIED",
    verifiedAt: null,
  };
}

export default function PopupSettingsPage() {
  const { showToast } = useToast();
  const clients = useAsyncData(() => oauthApi.listClients().then((result) => result.clients));
  const [selectedClientId, setSelectedClientId] = useState("");
  const [config, setConfig] = useState<OAuthClientConfig | null>(null);
  const [redirectUri, setRedirectUri] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedClient = useMemo(
    () => clients.data?.find((client) => client.clientId === selectedClientId) ?? null,
    [clients.data, selectedClientId],
  );

  useEffect(() => {
    if (!selectedClientId && clients.data?.length) {
      const firstWebClient = clients.data.find((client) => client.isActive && client.redirectUris.length > 0) ?? clients.data[0];
      setSelectedClientId(firstWebClient.clientId);
    }
  }, [clients.data, selectedClientId]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedClient) {
      setConfig(null);
      setRedirectUri("");
      return;
    }
    setLoadingConfig(true);
    oauthApi.getClientConfig(selectedClient.clientId)
      .then(({ config: saved }) => {
        if (cancelled) return;
        const merged = { ...defaultConfig(selectedClient), ...saved };
        setConfig(merged);
        setRedirectUri(selectedClient.redirectUris[0] ?? "");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setConfig(defaultConfig(selectedClient));
        setRedirectUri(selectedClient.redirectUris[0] ?? "");
        showToast({
          title: "Couldn't load popup settings",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "error",
        });
      })
      .finally(() => { if (!cancelled) setLoadingConfig(false); });
    return () => { cancelled = true; };
  }, [selectedClient, showToast]);

  const snippet = useMemo(() => {
    if (!selectedClient || !config || !redirectUri) return "";
    const attributes = [
      `data-client-id="${selectedClient.clientId}"`,
      `data-redirect-uri="${redirectUri}"`,
      `data-auto-prompt="${config.autoPrompt ? "true" : "false"}"`,
      `data-prompt-delay="${config.promptDelay ?? 1500}"`,
      `data-placement="${config.popupPlacement ?? "bottom-right"}"`,
      `data-frequency="${config.popupFrequency ?? "session"}"`,
      "defer",
    ].join(" ");
    return `<script src="https://api.max-ai.name.ng/sdk/max-auth.js" ${attributes}></script>`;
  }, [selectedClient, config, redirectUri]);

  function updateConfig(patch: Partial<OAuthClientConfig>) {
    setConfig((current) => current ? { ...current, ...patch } : current);
    setCopied(false);
  }

  async function saveSettings() {
    if (!selectedClient || !config) return;
    if (!redirectUri || !selectedClient.redirectUris.includes(redirectUri)) {
      showToast({ title: "Choose a registered redirect URI", description: "The snippet must use a redirect URI already registered for this application.", variant: "error" });
      return;
    }
    const payload: OAuthClientConfigUpdate = {
      applicationType: config.applicationType,
      authorizedOrigins: config.authorizedOrigins,
      certificateFingerprints: config.certificateFingerprints,
      packageName: config.packageName ?? undefined,
      bundleId: config.bundleId ?? undefined,
      logoUrl: config.logoUrl ?? null,
      displayName: config.displayName ?? null,
      websiteUrl: config.websiteUrl ?? null,
      manifestUrl: config.manifestUrl ?? null,
      autoPrompt: Boolean(config.autoPrompt),
      popupPlacement: config.popupPlacement ?? "bottom-right",
      popupFrequency: config.popupFrequency ?? "session",
      promptDelay: config.promptDelay ?? 1500,
    };
    try {
      setSaving(true);
      const result = await oauthApi.updateClientConfig(selectedClient.clientId, payload);
      setConfig({ ...config, ...result.config });
      showToast({ title: "Popup settings saved", description: "Your integration snippet now reflects the saved settings.", variant: "success" });
    } catch (error) {
      showToast({ title: "Couldn't save popup settings", description: error instanceof Error ? error.message : "Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function copySnippet() {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      showToast({ title: "Integration snippet copied", variant: "success" });
    } catch {
      showToast({ title: "Couldn't copy automatically", description: "Select the snippet and copy it manually.", variant: "error" });
    }
  }

  return (
    <AuthFeatureShell
      eyebrow="MAX for Developers"
      title="Sign-in popup settings"
      description="Configure the MAX Auth popup for each registered website and generate an integration snippet you can copy directly into your site."
    >
      <div className="space-y-5">
        <GlassCard>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Registered application</h2>
              <p className="mt-1 text-sm text-ink-muted">Settings are saved to the selected MAX Auth client.</p>
            </div>
            <a href="/developer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-ink-muted hover:bg-white/5">
              Manage applications <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {clients.isLoading ? <div className="mt-5 h-12 animate-pulse rounded-xl bg-white/5" /> : clients.error ? (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">{clients.error}</p>
          ) : !clients.data?.length ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5">
              <p className="font-medium">No applications registered yet</p>
              <p className="mt-1 text-sm text-ink-muted">Register your website first, then return here to configure its popup.</p>
              <a href="/developer" className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white">Register an application</a>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Application
                <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#17191f] px-3 py-3 text-sm outline-none focus:border-brand-500">
                  {clients.data.map((client) => <option key={client.clientId} value={client.clientId}>{client.name}{client.isActive ? "" : " (revoked)"}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Redirect URI for snippet
                <select value={redirectUri} onChange={(event) => setRedirectUri(event.target.value)} disabled={!selectedClient?.redirectUris.length} className="mt-2 w-full rounded-xl border border-white/10 bg-[#17191f] px-3 py-3 text-sm outline-none focus:border-brand-500 disabled:opacity-50">
                  {selectedClient?.redirectUris.map((uri) => <option key={uri} value={uri}>{uri}</option>)}
                </select>
              </label>
            </div>
          )}
        </GlassCard>

        {selectedClient && config && (
          <>
            <GlassCard>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><Sparkles className="h-5 w-5" /></div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-semibold">Automatic prompting</h2>
                  <p className="mt-1 text-sm text-ink-muted">When enabled, the popup can appear automatically on your registered site after the selected delay. Visitors can always dismiss it.</p>
                </div>
                <button type="button" role="switch" aria-checked={Boolean(config.autoPrompt)} onClick={() => updateConfig({ autoPrompt: !config.autoPrompt })} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${config.autoPrompt ? "bg-brand-500" : "bg-white/20"}`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${config.autoPrompt ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">Popup placement
                  <select value={config.popupPlacement ?? "bottom-right"} onChange={(event) => updateConfig({ popupPlacement: event.target.value as OAuthClientConfig["popupPlacement"] })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#17191f] px-3 py-3 text-sm outline-none focus:border-brand-500">
                    <option value="bottom-right">Bottom right</option><option value="top-right">Top right</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">Prompt frequency
                  <select value={config.popupFrequency ?? "session"} onChange={(event) => updateConfig({ popupFrequency: event.target.value as OAuthClientConfig["popupFrequency"] })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#17191f] px-3 py-3 text-sm outline-none focus:border-brand-500">
                    <option value="always">Every page load</option><option value="session">Once per browser session</option><option value="once">Once on this browser</option>
                  </select>
                </label>
                <label className="block text-sm font-medium sm:col-span-2">Prompt delay
                  <select value={String(config.promptDelay ?? 1500)} onChange={(event) => updateConfig({ promptDelay: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#17191f] px-3 py-3 text-sm outline-none focus:border-brand-500 sm:max-w-sm">
                    <option value="0">Immediately</option><option value="1500">1.5 seconds</option><option value="3000">3 seconds</option><option value="5000">5 seconds</option><option value="10000">10 seconds</option>
                  </select>
                </label>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <p className="text-xs text-ink-muted">{loadingConfig ? "Loading saved settings…" : "Changes are not saved until you select Save settings."}</p>
                <button type="button" onClick={saveSettings} disabled={saving || loadingConfig} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save settings"}
                </button>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-display text-lg font-semibold">Integration snippet</h2><p className="mt-1 text-sm text-ink-muted">Copy this snippet into your website. It includes your saved popup settings.</p></div>
                <button type="button" onClick={copySnippet} disabled={!snippet || loadingConfig} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-ink hover:bg-white/5 disabled:opacity-50">
                  {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}{copied ? "Copied" : "Copy snippet"}
                </button>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-blue-100"><code>{loadingConfig ? "Loading saved configuration…" : snippet || "Register a redirect URI for this application to generate the snippet."}</code></pre>
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-white/[0.03] p-3 text-xs leading-5 text-ink-muted">
                <Code2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p>The snippet contains a public client ID and display settings only. Never place a client secret in browser code. Automatic prompting is a convenience, not a guarantee: browser policies and visitor choices can prevent a popup from appearing.</p>
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </AuthFeatureShell>
  );
}
