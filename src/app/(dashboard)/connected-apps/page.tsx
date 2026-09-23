"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Link2, Music2, RefreshCw, Shield, Unlink, Clock3, Sparkles, Globe2 } from "lucide-react";
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
  { id: "DISCORD", name: "Discord", description: "Connect your Discord identity when the integration is released." },
  { id: "GITHUB", name: "GitHub", description: "Connect your developer identity when the integration is released." },
  { id: "X", name: "X", description: "Connect your X identity when the integration is released." },
  { id: "INSTAGRAM", name: "Instagram", description: "Connect your Instagram identity when the integration is released." },
  { id: "SNAPCHAT", name: "Snapchat", description: "Connect your Snapchat identity when the integration is released." },
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
  const spotify = useMemo(() => accounts.data?.find((a) => a.provider === "SPOTIFY") ?? null, [accounts.data]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("spotify");
    const googleConnect = params.get("connect") === "google";
    const googleCalendarResult = params.get("google_calendar");
    if (result === "connected") {
      showToast({ title: "Spotify connected", description: "Your Spotify account is now linked to MAX.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (result === "error") {
      showToast({ title: "Spotify connection failed", description: "Spotify could not be connected. You can safely try again.", variant: "error" });
      window.history.replaceState({}, "", "/connected-apps");
    }
    if (googleCalendarResult === "connected") {
      showToast({ title: "Google Calendar connected", description: "MAX can now use the Google Calendar permissions you approved.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (googleCalendarResult === "error") {
      showToast({ title: "Google Calendar connection failed", description: "Google Calendar could not be connected. You can safely try again.", variant: "error" });
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
                {googleContactsConnected && <Badge variant="success">Contacts</Badge>}</div>}
            </div>
            {google ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Connected</Badge>
                {googleCalendarConnected && googleDriveConnected && googleGmailConnected && googleTasksConnected && googleContactsConnected ? <Badge variant="success"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Google services ready</Badge> : <Button size="sm" variant="secondary" onClick={async () => { try { const { authorizationUrl } = await connectedAccountsApi.googleCalendarConnect(); window.location.assign(authorizationUrl); } catch (err) { showToast({ title: "Couldn't start Google connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" }); } }} disabled={busy}><Link2 className="h-3.5 w-3.5" /> Connect Google services</Button>}<Button size="sm" variant="ghost" onClick={() => setUnlinkId(google.id)} disabled={busy}><Unlink className="h-3.5 w-3.5" /> Unlink</Button>
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
        <p className="text-xs leading-5 text-ink-muted">Google and Spotify credentials are handled by MAX Auth. Connected Apps never receives third-party access or refresh tokens. Google Workspace access is limited to the scopes approved by the user.</p>
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
