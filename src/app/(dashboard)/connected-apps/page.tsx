"use client";

import { useState } from "react";
import { CheckCircle2, Globe2, Link2, Music2, MessageCircle, Github, Camera, X, Shield } from "lucide-react";
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

  const linked = new Set((accounts.data ?? []).map((a) => a.provider));
  const connect = (name: string) => {
    setNotice(`${name} OAuth is ready for integration, but the provider backend handshake is not enabled yet.`);
    showToast({ title: `${name} connection is not active yet`, variant: "error" });
  };

  const unlink = async (id: string) => {
    try { await connectedAccountsApi.unlink(id); showToast({ title: "Account unlinked", variant: "success" }); accounts.refetch(); }
    catch (err) { showToast({ title: "Couldn't unlink account", description: err instanceof ApiError ? err.message : undefined, variant: "error" }); }
  };

  return <div className="space-y-6">
    <PageHeader title="Connected Apps" description="Control the services connected to your MAX Account and the permissions they receive." />
    {notice && <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4 text-sm text-ink-muted">{notice}</div>}
    <Card><CardContent className="divide-y divide-glass-border p-0">
      {providers.map((p) => { const account = accounts.data?.find((a) => a.provider === p.id); const Icon = p.icon; return <div key={p.id} className="flex items-center gap-4 p-5"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-ink-muted"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{p.name}</p><p className="text-xs text-ink-faint">{p.description}</p></div>{account ? <><span className="inline-flex items-center gap-1.5 text-xs font-medium text-success"><CheckCircle2 className="h-4 w-4" /> Connected</span><Button variant="ghost" size="sm" onClick={() => unlink(account.id)}>Unlink</Button></> : <Button variant="secondary" size="sm" onClick={() => connect(p.name)}>Connect</Button>}</div>; })}
    </CardContent></Card>
    <div className="flex gap-3 rounded-2xl border border-brand-400/15 bg-brand-500/5 p-4"><Link2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" /><p className="text-xs leading-5 text-ink-muted">Connecting a provider never automatically grants a third-party app access to your MAX Account. Partner permissions are controlled separately through OAuth consent.</p></div>
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4"><Shield className="mt-0.5 h-5 w-5 shrink-0 text-success" /><p className="text-xs leading-5 text-ink-muted">Provider connection buttons are intentionally gated until the backend OAuth handshakes are configured. This prevents the frontend from pretending a secure connection exists.</p></div>
  </div>;
}
