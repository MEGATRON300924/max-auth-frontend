"use client";
import { useState } from "react";
import { Fingerprint, KeyRound, Smartphone, ShieldCheck, ToggleRight } from "lucide-react";
import { AuthFeatureShell, GlassCard, FeatureRow, StatusPill } from "@/components/auth/AuthFeatureShell";

export default function TwoFactorPage() {
  const [enabled, setEnabled] = useState(false);
  return <AuthFeatureShell title="Two-factor authentication" description="Add another layer of protection to your MAX Account. The controls are ready for the backend implementation." eyebrow="Security"><GlassCard><FeatureRow icon={<Smartphone className="h-5 w-5" />} title="Authenticator app" description="Use a time-based verification code when signing in." action={<button onClick={() => setEnabled(!enabled)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${enabled ? "bg-success/10 text-success" : "bg-white/10 text-ink-muted"}`}>{enabled ? "Enabled" : "Enable"}</button>} /><FeatureRow icon={<Fingerprint className="h-5 w-5" />} title="Passkeys" description="Sign in with your device biometrics or security key." action={<StatusPill>Coming soon</StatusPill>} /><FeatureRow icon={<KeyRound className="h-5 w-5" />} title="Recovery codes" description="Generate one-time backup codes for account recovery." action={<StatusPill>Coming soon</StatusPill>} /><FeatureRow icon={<ShieldCheck className="h-5 w-5" />} title="Login protection" description="Monitor suspicious sign-in attempts and protect your sessions." action={<ToggleRight className="h-5 w-5 text-success" />} /></GlassCard><p className="mt-4 text-xs text-ink-faint">{enabled ? "UI state enabled. Do not treat this as active security until the backend confirms enrollment." : "Your account currently has no authenticator enrollment recorded by this frontend."}</p></AuthFeatureShell>;
}
