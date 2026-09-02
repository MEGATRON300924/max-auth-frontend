"use client";

import { BookOpen, Check, Code2, Copy, ExternalLink, KeyRound, ShieldCheck } from "lucide-react";
import { AuthFeatureShell, GlassCard, StatusPill } from "@/components/auth/AuthFeatureShell";

const steps = [
  "Create an OAuth application in the Developer Platform.",
  "Register exact HTTPS redirect URIs.",
  "Use Authorization Code + PKCE for browser/mobile clients.",
  "Send users to MAX Auth for consent and authorization.",
  "Exchange the authorization code on your server.",
];

export default function DeveloperDocsPage() {
  const label = "Continue with MAX AI";
  return (
    <AuthFeatureShell eyebrow="MAX Developers" title="Developer documentation" description="Everything partners need to add MAX identity to their applications without exposing client secrets.">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
        <GlassCard>
          <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-brand-300" /><div><h2 className="font-display text-lg font-semibold">Integration flow</h2><p className="text-sm text-ink-muted">Production-ready architecture for Continue with MAX AI.</p></div></div>
          <div className="mt-5 space-y-3">{steps.map((step, i) => <div key={step} className="flex gap-3 rounded-2xl border border-white/8 bg-black/10 p-4"><div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-300">{i + 1}</div><p className="text-sm leading-6 text-ink-muted">{step}</p></div>)}</div>
          <div className="mt-5 rounded-2xl border border-brand-400/20 bg-brand-500/5 p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /><p className="text-sm font-semibold">Security requirement</p></div><p className="mt-2 text-xs leading-5 text-ink-muted">Never put a confidential client secret in browser, mobile, or public source code. Validate state, issuer, redirect URI and PKCE on the backend.</p></div>
        </GlassCard>
        <div className="space-y-5">
          <GlassCard><div className="flex items-center gap-3"><Code2 className="h-5 w-5 text-brand-300" /><h2 className="font-display text-lg font-semibold">Endpoints</h2></div><div className="mt-4 space-y-2 font-mono text-xs"><div className="rounded-xl border border-white/10 bg-black/20 p-3">GET /authorize</div><div className="rounded-xl border border-white/10 bg-black/20 p-3">POST /token</div><div className="rounded-xl border border-white/10 bg-black/20 p-3">GET /userinfo</div></div><StatusPill tone="warning" className="mt-4">Backend OAuth activation required</StatusPill></GlassCard>
          <GlassCard><h2 className="font-display text-lg font-semibold">Branding</h2><p className="mt-2 text-sm text-ink-muted">Use this exact label on your sign-in button.</p><div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-sm font-medium">{label}</span><button onClick={() => navigator.clipboard?.writeText(label)} aria-label="Copy integration label" className="rounded-lg p-2 text-ink-muted hover:bg-white/5"><Copy className="h-4 w-4" /></button></div><p className="mt-3 text-xs text-ink-faint">Official MAX Auth authorization endpoint: auth.max-ai.name.ng/authorize</p></GlassCard>
          <GlassCard><div className="flex items-center gap-3"><KeyRound className="h-5 w-5 text-brand-300" /><div><p className="font-medium">SDKs</p><p className="text-xs text-ink-muted">JavaScript, Flutter, Android and iOS SDK surfaces can be added as the API stabilizes.</p></div></div><button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-300">View API reference <ExternalLink className="h-4 w-4" /></button></GlassCard>
        </div>
      </div>
    </AuthFeatureShell>
  );
}
