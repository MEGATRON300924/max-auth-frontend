"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, KeyRound, Plus, Shield, Trash2 } from "lucide-react";
import { AuthFeatureShell, GlassCard, StatusPill } from "@/components/auth/AuthFeatureShell";

export default function DeveloperPage() {
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [clients, setClients] = useState([{ name: "MAX AI", id: "max_ai_first_party", status: "First-party" }]);

  function createClient() {
    if (!name.trim()) return;
    setClients((items) => [...items, { name: name.trim(), id: `max_${crypto.randomUUID().slice(0, 8)}`, status: "Active" }]);
    setName(""); setCreated(true);
  }

  return <AuthFeatureShell eyebrow="MAX Developers" title="Build with MAX Identity" description="Manage applications that use Continue with MAX AI. The interface is ready for OAuth clients, permissions, branding and analytics as the backend capabilities come online.">
    <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <GlassCard>
        <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-semibold">Applications</h2><p className="text-sm text-ink-muted">Apps connected to your MAX identity platform.</p></div><StatusPill tone="success">Developer mode</StatusPill></div>
        <div className="mt-5 space-y-2">{clients.map((client) => <div key={client.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-black/10 p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><KeyRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{client.name}</p><p className="truncate font-mono text-xs text-ink-faint">{client.id}</p></div><StatusPill tone={client.status === "Active" ? "success" : "neutral"}>{client.status}</StatusPill><button aria-label={`Delete ${client.name}`} className="rounded-lg p-2 text-ink-faint hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button></div>)}</div>
        <div className="mt-5 flex gap-2"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Application name" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-ink-faint focus:border-brand-400/50" /><button onClick={createClient} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-400"><Plus className="h-4 w-4" /> Add app</button></div>
        {created && <p className="mt-3 flex items-center gap-2 text-xs text-success"><CheckCircle2 className="h-4 w-4" /> Application created locally. OAuth registration will persist it once the backend endpoint is live.</p>}
      </GlassCard>
      <div className="space-y-5"><GlassCard><h2 className="font-display text-lg font-semibold">Integration</h2><p className="mt-2 text-sm leading-6 text-ink-muted">Your future partner integration will use a standard OAuth authorization flow with PKCE.</p><div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-ink-muted">https://auth.max-ai.name.ng/authorize</div><button className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-300 hover:text-brand-200"><ExternalLink className="h-4 w-4" /> View developer docs</button></GlassCard><GlassCard><div className="flex items-center gap-3"><Shield className="h-5 w-5 text-success" /><div><p className="font-medium">Security first</p><p className="text-xs text-ink-muted">Client secrets belong on servers, never in browser code.</p></div></div><button onClick={() => { navigator.clipboard?.writeText("Continue with MAX AI"); setCopied(true); }} className="mt-4 inline-flex items-center gap-2 text-xs text-ink-muted hover:text-ink"><Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy integration label"}</button></GlassCard></div>
    </div>
  </AuthFeatureShell>;
}
