"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Globe2, Link2, Music2, MessageCircle, Github, Camera, X, Shield, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { connectedAccountsApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";
import type { ConnectedProvider } from "@/types/api";

const providers: { id: ConnectedProvider; name: string; icon: typeof Github; description: string }[] = [
  { id: "GOOGLE", name: "Google", icon: Globe2, description: "Use your Google identity with MAX." },
  { id: "X", name: "X", icon: X, description: "Connect your X account." },
  { id: "INSTAGRAM", name: "Instagram", icon: Camera, description: "Connect your Instagram identity." },
  { id: "SNAPCHAT", name: "Snapchat", icon: Camera, description: "Connect your Snapchat identity." },
  { id: "SPOTIFY", name: "Spotify", icon: Music2, description: "Connect your music profile." },
  { id: "DISCORD", name: "Discord", icon: MessageCircle, description: "Connect your Discord identity." },
  { id: "GITHUB", name: "GitHub", icon: Github, description: "Connect your developer identity." },
];

export default function ConnectedAppsPage() {
  const { showToast } = useToast();
  const accounts = useAsyncData(() => connectedAccountsApi.list().then((r) => r.accounts));
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spotify = params.get("spotify");
    if (spotify === "connected") {
      showToast({ title: "Spotify connected", description: "Your Spotify account is now linked to MAX.", variant: "success" });
      accounts.refetch();
      window.history.replaceState({}, "", "/connected-apps");
    } else if (spotify === "error") {
      showToast({ title: "Spotify connection failed", description: "Spotify could not be connected. Please try again.", variant: "error" });
      window.history.replaceState({}, "", "/connected-apps");
    }
  }, []);

  const connect = async (provider: ConnectedProvider, name: string) => {
    if (provider !== "SPOTIFY") {
      setNotice(name + " is prepared as a future connected service. Its secure provider handshake will be enabled when that integration is ready.");
      showToast({ title: name + " integration is coming", description: "Your MAX Account already handles MAX service sign-in.", variant: "info" });
      return;
    }
    try {
      const { authorizationUrl } = await connectedAccountsApi.spotifyConnect();
      window.location.assign(authorizationUrl);
    } catch (err) {
      showToast({ title: "Couldn't start Spotify connection", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connect") !== "spotify") return;

    window.history.replaceState({}, "", "/connected-apps");

    void connect("SPOTIFY", "Spotify");
  }, []);

  const unlink = async (id: string) => {
    try { await connectedAccountsApi.unlink(id); showToast({ title: "Account unlinked", variant: "success" }); accounts.refetch(); }
    catch (err) { showToast({ title: "Couldn't unlink account", description: err instanceof ApiError ? err.message : undefined, variant: "error" }); }
  };

  return <div className="space-y-6">
    <PageHeader title="Connected Apps" description="Control the services connected to your MAX Account and the permissions they receive." />
    <Card className="border-brand-400/20 bg-brand-500/[.04]">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">MAX connection complete</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            Your MAX Account is the single sign-in for the MAX ecosystem. When MAX AI and the other MAX services are ready, they will use this same account automatically — no separate sign-in for each service.
          </p>
        </div>
      </CardContent>
    </Card>
    {notice && <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4 text-sm text-ink-muted">{notice}</div>}
    <Card><CardContent className="divide-y divide-glass-border p-0">
      {providers.map((p) => { const account = accounts.data?.find((a) => a.provider === p.id); const Icon = p.icon; return <div key={p.id} className="flex items-center gap-4 p-5"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-ink-muted"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{p.name}</p><p className="text-xs text-ink-faint">{p.description}</p></div>{account ? <><span className="inline-flex items-center gap-1.5 text-xs font-medium text-success"><CheckCircle2 className="h-4 w-4" /> Connected</span><Button variant="ghost" size="sm" onClick={() => unlink(account.id)}>Unlink</Button></> : <Button variant="secondary" size="sm" onClick={() => connect(p.id, p.name)}>Connect</Button>}</div>; })}
    </CardContent></Card>
    <div className="flex gap-3 rounded-2xl border border-brand-400/15 bg-brand-500/5 p-4"><Link2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" /><p className="text-xs leading-5 text-ink-muted">Your MAX Account is already connected across the MAX ecosystem. Third-party providers such as Spotify are separate connections and will only receive the permissions you approve.</p></div>
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4"><Shield className="mt-0.5 h-5 w-5 shrink-0 text-success" /><p className="text-xs leading-5 text-ink-muted">MAX services will use your existing MAX Account session. Third-party connections such as Spotify will use their own secure OAuth consent flow and will not require another MAX Account sign-in.</p></div>
  </div>;
}
