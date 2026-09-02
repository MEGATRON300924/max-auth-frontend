"use client";

import { useState } from "react";
import { ShieldCheck, Smartphone, Fingerprint, KeyRound, Copy, RefreshCw } from "lucide-react";
import { AuthFeatureShell, GlassCard, FeatureRow, StatusPill } from "@/components/auth/AuthFeatureShell";

export default function TwoFactorPage() {
  const [enabled, setEnabled] = useState(false);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const start = () => { setNotice("Enter the 6-digit code from your authenticator app to finish setup."); setCode(""); };
  const verify = () => { if (/^\d{6}$/.test(code)) { setEnabled(true); setVerified(true); setNotice("Authenticator setup completed in the interface. Backend enrollment still needs to be enabled."); } else setNotice("Enter a valid 6-digit code."); };
  return <AuthFeatureShell eyebrow="Security" title="Two-factor authentication" description="Add a second verification step to protect your MAX Account.">
    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <GlassCard><FeatureRow icon={<Smartphone className="h-5 w-5" />} title="Authenticator app" description="Use an authenticator such as Google Authenticator, Microsoft Authenticator or 1Password." action={<StatusPill tone={enabled ? "success" : "warning"}>{enabled ? "Enabled" : "Not enabled"}</StatusPill>} />{!enabled && <button onClick={start} className="mt-5 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-400">Set up authenticator</button>}{notice && <div className="mt-4 rounded-xl border border-brand-400/15 bg-brand-500/5 p-3 text-xs text-ink-muted">{notice}</div>}{notice && !enabled && <div className="mt-4 flex gap-2"><input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="123456" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-center tracking-[.3em] outline-none" /><button onClick={verify} className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white">Verify</button></div>}</GlassCard>
      <div className="space-y-5"><GlassCard><FeatureRow icon={<Fingerprint className="h-5 w-5" />} title="Passkeys" description="Use biometrics or a security key for phishing-resistant sign-in." action={<StatusPill>Available</StatusPill>} /><button className="mt-4 text-sm font-medium text-brand-300" onClick={() => window.location.assign("/passkeys")}>Manage passkeys</button></GlassCard><GlassCard><FeatureRow icon={<KeyRound className="h-5 w-5" />} title="Recovery codes" description="Keep backup codes for emergencies." action={<StatusPill>Available</StatusPill>} /><button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-300" onClick={() => window.location.assign("/recovery-codes")}><Copy className="h-4 w-4" /> Manage recovery codes</button></GlassCard></div>
    </div><p className="mt-4 text-xs text-ink-faint">This UI does not itself enable 2FA. Actual TOTP secret generation, verification, backup-code storage and login enforcement must be performed by MAX Auth's backend.</p>
  </AuthFeatureShell>;
}
