"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Link2, Music2, RefreshCw, Shield, Unlink, Clock3, Sparkles, Globe2, MessageCircle, Cloud, Github, Music } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { connectedAccountsApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";
import type { ConnectedProvider } from "@/types/api";
import { GoogleConnectButton } from "@/components/auth/GoogleConnectButton";

const futureProviders: { id: ConnectedProvider; name: string; description: string }[] = [

];

function expiryLabel(value: string | null) {
  if (!value) return "Token status unavailable";
  const ms = new Date(value).getTime() - Date.now();
  if (ms <= 0) return "Access token expired";
  const minutes = Math.ceil(ms / 60000);
  return minutes < 60 ? `Access token refreshes in about ${minutes} min` : `Access token refreshes in about ${Math.ceil(minutes / 60)} hr`;
}

export default function ConnectedAppsPage() {
  const { showToast } = useToast();
  const accounts = useAsyncData(() => connectedAccountsApi.list().then((r) => r.accounts));
  const [notice, setNotice] = useState<string | null>(null);
  const [unlinkId, setUnlinkId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const google = useMemo(() => accounts.data?.find((a) => a.provider === "GOOGLE") ?? null, [accounts.data]);
  const googleScopes = new Set(google?.scope?.split(/\s+/).filter(Boolean));
  const googleCalendarConnected = googleScopes.has("https://www.googleapis.com/auth/calendar.events");
  const googleDriveConnected = googleScopes.has("https://www.googleapis.com/auth/drive.file");
  const googleGmailConnected = googleScopes.has("https://www.googleapis.com/auth/gmail.modify");
  const googleTasksConnected = googleScopes.has("https://www.googleapis.com/auth/tasks");
  const googleContactsConnected = googleScopes.has("https://www.googleapis.com/auth/contacts.readonly");
  const googleYouTubeConnected = googleScopes.has("https://www.googleapis.com/auth/youtube.readonly");
  const spotify = useMemo(() => accounts.data?.find((a) => a.provider === "SPOTIFY") ?? null, [accounts.data]);
  const discord = useMemo(() => accounts.data?.find((a) => a.provider === "DISCORD") ?? null, [accounts.data]);
  const microsoft = useMemo(() => accounts.data?.find((a) => a.provider === "MICROSOFT") ?? null, [accounts.data]);
  const github = useMemo(() => accounts.data?.find((a) => a.provider === "GITHUB") ?? null, [accounts.data]);
  const x = useMemo(() => accounts.data?.find((a) => a.provider === "X") ?? null, [accounts.data]);
  const instagram = useMemo(() => accounts.data?.find((a) => a.provider === "INSTAGRAM") ?? null, [accounts.data]);
  const tiktok = useMemo(() => accounts.data?.find((a) => a.provider === "TIKTOK") ?? null, [accounts.data]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("spotify");
    const googleConnect = params.get("connect") === "google";
    const googleCalendarResult = params.get("google_calendar");
    const discordResult = params.get("discord");
    const microsoftResult = params.get("microsoft");
    const githubResult = params.get("github");
    const xResult = params.get("x");
    const instagramResult = params.get("instagram");
    const tiktokResult = params.get("tiktok");
    if (result === "connected") {
      showToast({ title: "Spotify connected", description: "Your Spotify account is now linked to MAX.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (result === "error") {
      showToast({ title: "Spotify connection failed", description: "Spotify could not be connected. You can safely try again.", variant: "error" });
      window.history.replaceState({}, "", "/connected-apps");
    }
    if (microsoftResult === "connected") {
      showToast({ title: "Microsoft connected", description: "Your Microsoft account and approved Microsoft 365 services are now linked to MAX.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (microsoftResult === "error") {
      showToast({ title: "Microsoft connection failed", description: "Microsoft could not be connected. You can safely try again.", variant: "error" });
      window.history.replaceState({}, "", "/connected-apps");
    }
    if (discordResult === "connected") {
      showToast({ title: "Discord connected", description: "Your Discord account is now linked to MAX.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (discordResult === "error") {
      showToast({ title: "Discord connection failed", description: "Discord could not be connected. You can safely try again.", variant: "error" });
      window.history.replaceState({}, "", "/connected-apps");
    }
    if (xResult === "connected") {
      showToast({ title: "X connected", description: "Your X account is now linked to MAX.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (xResult === "error") {
      showToast({ title: "X connection failed", description: "X could not be connected. You can safely try again.", variant: "error" });
      window.history.replaceState({}, "", "/connected-apps");
    }
    if (instagramResult === "connected") { showToast({ title: "Instagram connected", description: "Your Instagram account is now linked to MAX.", variant: "success" }); accounts.refetch(); window.history.replaceState({}, "", "/connected-apps"); } else if (instagramResult === "error") { showToast({ title: "Instagram connection failed", description: "Instagram could not be connected. You can try again.", variant: "error" }); window.history.replaceState({}, "", "/connected-apps"); }
    if (tiktokResult === "connected") { showToast({ title: "TikTok connected", description: "Your TikTok account is now linked to MAX.", variant: "success" }); accounts.refetch(); window.history.replaceState({}, "", "/connected-apps"); } else if (tiktokResult === "error") { showToast({ title: "TikTok connection failed", description: "TikTok could not be connected. You can try again.", variant: "error" }); window.history.replaceState({}, "", "/connected-apps"); }
    if (githubResult === "connected") {
      showToast({ title: "GitHub connected", description: "Your GitHub account is now linked to MAX.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (githubResult === "error") {
      showToast({ title: "GitHub connection failed", description: "GitHub could not be connected. You can safely try again.", variant: "error" });
      window.history.replaceState({}, "", "/connected-apps");
    }
    if (googleCalendarResult === "connected") {
      showToast({ title: "Google services connected", description: "MAX can now use the Google services and permissions you approved.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (googleCalendarResult === "error") {
      showToast({ title: "Google connection failed", description: "Google services could not be connected. You can safely try again.", variant: "error" });
      window.history.replaceState({}, "", "/connected-apps");
    }
    if (googleConnect) {
      window.history.replaceState({}, "", "/connected-apps");
      showToast({ title: "Connect Google", description: "Choose your Google account below to link it to MAX.", variant: "success" });
      setTimeout(() => document.getElementById("google-connect")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
    if (params.get("connect") === "spotify") {
      window.history.replaceState({}, "", "/connected-apps");
      void connectSpotify();
    }
  }, []);

  async function connectDiscord() {
    try {
      const { authorizationUrl } = await connectedAccountsApi.discordConnect();
      window.location.assign(authorizationUrl);
    } catch (err) {
      showToast({ title: "Couldn't start Discord connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    }
  }

  async function connectMicrosoft() {
    try {
      const { authorizationUrl } = await connectedAccountsApi.microsoftConnect();
      window.location.assign(authorizationUrl);
    } catch (err) {
      showToast({ title: "Microsoft connection could not start", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    }
  }

  async function connectX() {
    try {
      const { authorizationUrl } = await connectedAccountsApi.xConnect();
      window.location.assign(authorizationUrl);
    } catch (err) {
      showToast({ title: "Couldn't start X connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    }
  }

  async function connectInstagram() { try { const { authorizationUrl } = await connectedAccountsApi.instagramConnect(); window.location.assign(authorizationUrl); } catch (err) { showToast({ title: "Couldn't start Instagram connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" }); } }
  async function connectTikTok() { try { const { authorizationUrl } = await connectedAccountsApi.tiktokConnect(); window.location.assign(authorizationUrl); } catch (err) { showToast({ title: "Couldn't start TikTok connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" }); } }

  async function connectGithub() {
    try {
      const { authorizationUrl } = await connectedAccountsApi.githubConnect();
      window.location.assign(authorizationUrl);
    } catch (err) {
      showToast({ title: "Couldn't start GitHub connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    }
  }

  async function connectSpotify() {
    try {
      const { authorizationUrl } = await connectedAccountsApi.spotifyConnect();
      window.location.assign(authorizationUrl);
    } catch (err) {
      showToast({ title: "Couldn't start Spotify connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    }
  }

  async function refreshSpotify() {
    setBusy(true);
    try {
      await connectedAccountsApi.spotifyRefresh();
      await accounts.refetch();
      showToast({ title: "Spotify connection refreshed", variant: "success" });
    } catch (err) {
      showToast({
        title: "Spotify needs attention",
        description: err instanceof ApiError ? err.message : "Please reconnect Spotify.",
        variant: "error",
      });
      await accounts.refetch();
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    if (!unlinkId) return;
    setBusy(true);
    try {
      await connectedAccountsApi.unlink(unlinkId);
      setUnlinkId(null);
      await accounts.refetch();
      showToast({ title: "Account unlinked", description: "The third-party connection has been removed from MAX.", variant: "success" });
    } catch (err) {
      showToast({ title: "Couldn't unlink account", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Connected Apps" description="Control third-party services connected to your MAX Account." />

      <Card className="border-brand-400/20 bg-brand-500/[.04]">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-400"><Sparkles className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-ink">Your MAX Account is the identity layer</p>
              <Badge variant="success"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Ready</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-muted">MAX services use your MAX Account. Third-party apps such as Spotify are separate OAuth connections and only receive the permissions you approve.</p>
          </div>
        </CardContent>
      </Card>

      {notice && <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4 text-sm text-ink-muted">{notice}</div>}

      <Card>
        <CardContent className="divide-y divide-glass-border p-0">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#4285F4]/10 text-[#4285F4]"><Globe2 className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink" id="google-connect">Google</p>
              <p className="text-xs text-ink-faint">Use your Google identity to sign in to MAX and connect Google services with permissions you approve.</p>
              {google && <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint"><span>Connected {new Date(google.linkedAt).toLocaleDateString()}</span>{googleCalendarConnected && <Badge variant="success">Calendar</Badge>}
                {googleDriveConnected && <Badge variant="success">Drive</Badge>}
                {googleGmailConnected && <Badge variant="success">Gmail</Badge>}
                {googleTasksConnected && <Badge variant="success">Tasks</Badge>}
                {googleContactsConnected && <Badge variant="success">Contacts</Badge>}
                {googleYouTubeConnected && <Badge variant="success">YouTube</Badge>}</div>}
            </div>
            {google ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Connected</Badge>
                {googleCalendarConnected && googleDriveConnected && googleGmailConnected && googleTasksConnected && googleContactsConnected && googleYouTubeConnected ? <Badge variant="success"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Google services ready</Badge> : <Button size="sm" variant="secondary" onClick={async () => { try { const { authorizationUrl } = await connectedAccountsApi.googleCalendarConnect(); window.location.assign(authorizationUrl); } catch (err) { showToast({ title: "Couldn't start Google connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" }); } }} disabled={busy}><Link2 className="h-3.5 w-3.5" /> Connect Google services</Button>}<Button size="sm" variant="ghost" onClick={() => setUnlinkId(google.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button>
              </div>
            ) : (
              <GoogleConnectButton onConnected={async () => { await accounts.refetch(); showToast({ title: "Google connected", description: "Your Google identity is now linked to your MAX Account.", variant: "success" }); }} />
            )}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1ed760]/10 text-[#1ed760]"><Music2 className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Spotify</p>
              <p className="text-xs text-ink-faint">Music profile and Spotify permissions approved through Spotify OAuth.</p>
              {spotify && <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-faint"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{expiryLabel(spotify.tokenExpiresAt)}</span><span>Linked {new Date(spotify.linkedAt).toLocaleDateString()}</span></div>}
            </div>
            {spotify ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={refreshSpotify} isLoading={busy}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
                <Button size="sm" variant="ghost" onClick={() => setUnlinkId(spotify.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button>
              </div>
            ) : <Button size="sm" onClick={connectSpotify}><Link2 className="h-3.5 w-3.5" /> Connect Spotify</Button>}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#5865F2]/10 text-[#5865F2]"><MessageCircle className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Discord</p>
              <p className="text-xs text-ink-faint">Connect your Discord identity, profile, and server memberships with permissions you approve.</p>
              {discord && <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-faint"><span>Linked {new Date(discord.linkedAt).toLocaleDateString()}</span><Badge variant="success">Identity</Badge><Badge variant="success">Servers</Badge></div>}
            </div>
            {discord ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={connectDiscord} disabled={busy}><RefreshCw className="h-3.5 w-3.5" /> Reconnect</Button>
                <Button size="sm" variant="ghost" onClick={() => setUnlinkId(discord.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button>
              </div>
            ) : <Button size="sm" onClick={connectDiscord}><Link2 className="h-3.5 w-3.5" /> Connect Discord</Button>}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><Cloud className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Microsoft</p>
              <p className="text-xs text-ink-faint">Connect Outlook, Calendar, OneDrive, To Do, Contacts, and other approved Microsoft 365 data through Microsoft Graph.</p>
              {microsoft && <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint"><span>Linked {new Date(microsoft.linkedAt).toLocaleDateString()}</span><Badge variant="success">Outlook</Badge><Badge variant="success">Calendar</Badge><Badge variant="success">OneDrive</Badge><Badge variant="success">To Do</Badge><Badge variant="success">Contacts</Badge></div>}
            </div>
            {microsoft ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={connectMicrosoft} disabled={busy}><RefreshCw className="h-3.5 w-3.5" /> Reconnect</Button>
                <Button size="sm" variant="ghost" onClick={() => setUnlinkId(microsoft.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button>
              </div>
            ) : <Button size="sm" onClick={connectMicrosoft}><Link2 className="h-3.5 w-3.5" /> Connect Microsoft</Button>}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink/10 text-ink"><Github className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">GitHub</p>
              <p className="text-xs text-ink-faint">Connect your GitHub identity so MAX can use the GitHub permissions granted to your MAX connection.</p>
              {github && <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint"><span>Linked {new Date(github.linkedAt).toLocaleDateString()}</span><Badge variant="success">Identity</Badge><Badge variant="success">Repositories</Badge></div>}
            </div>
            {github ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={connectGithub} disabled={busy}><RefreshCw className="h-3.5 w-3.5" /> Reconnect</Button>
                <Button size="sm" variant="ghost" onClick={() => setUnlinkId(github.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button>
              </div>
            ) : <Button size="sm" onClick={connectGithub}><Link2 className="h-3.5 w-3.5" /> Connect GitHub</Button>}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink/10 text-ink"><span className="text-lg font-bold">𝕏</span></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">X</p>
              <p className="text-xs text-ink-faint">Connect your X identity and approved X data to MAX through OAuth 2.0.</p>
              {x && <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint"><span>Linked {new Date(x.linkedAt).toLocaleDateString()}</span><Badge variant="success">Identity</Badge><Badge variant="success">Posts</Badge></div>}
            </div>
            {x ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={connectX} disabled={busy}><RefreshCw className="h-3.5 w-3.5" /> Reconnect</Button>
                <Button size="sm" variant="ghost" onClick={() => setUnlinkId(x.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button>
              </div>
            ) : <Button size="sm" onClick={connectX}><Link2 className="h-3.5 w-3.5" /> Connect X</Button>}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pink-500/10 text-pink-500"><span className="text-sm font-bold">IG</span></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">Instagram</p><p className="text-xs text-ink-faint">Connect an Instagram professional account through Instagram Login.</p>{instagram && <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint"><span>Linked {new Date(instagram.linkedAt).toLocaleDateString()}</span><Badge variant="success">Profile</Badge></div>}</div>
            {instagram ? <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={connectInstagram} disabled={busy}><RefreshCw className="h-3.5 w-3.5" /> Reconnect</Button><Button size="sm" variant="ghost" onClick={() => setUnlinkId(instagram.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button></div> : <Button size="sm" onClick={connectInstagram}><Link2 className="h-3.5 w-3.5" /> Connect Instagram</Button>}
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black/10 text-ink"><span className="text-lg font-bold">♪</span></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">TikTok</p><p className="text-xs text-ink-faint">Connect TikTok to let MAX use your approved profile and public video permissions.</p>{tiktok && <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint"><span>Linked {new Date(tiktok.linkedAt).toLocaleDateString()}</span><Badge variant="success">Profile</Badge><Badge variant="success">Videos</Badge></div>}</div>
            {tiktok ? <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={connectTikTok} disabled={busy}><RefreshCw className="h-3.5 w-3.5" /> Reconnect</Button><Button size="sm" variant="ghost" onClick={() => setUnlinkId(tiktok.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button></div> : <Button size="sm" onClick={connectTikTok}><Link2 className="h-3.5 w-3.5" /> Connect TikTok</Button>}
          </div>

          {futureProviders.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-5 opacity-80">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-ink-muted"><Link2 className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{p.name}</p><p className="text-xs text-ink-faint">{p.description}</p></div>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3 rounded-2xl border border-success/15 bg-success/5 p-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <p className="text-xs leading-5 text-ink-muted">Google, Microsoft, Spotify, Discord, GitHub, X, Instagram, and TikTok credentials are handled by MAX Auth. Connected Apps never receives third-party access or refresh tokens. Google Workspace access is limited to the scopes approved by the user.</p>
      </div>

      <Modal open={Boolean(unlinkId)} onClose={() => !busy && setUnlinkId(null)} title="Unlink account?" description="This removes the selected third-party connection from your MAX Account. You can connect it again later.">
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setUnlinkId(null)} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={unlink} isLoading={busy}>Unlink account</Button>
        </div>
      </Modal>
    </div>
  );
}
