"use client";
import { useState } from "react";
import { Fingerprint, KeyRound, Laptop, ShieldCheck } from "lucide-react";
import { AuthFeatureShell, GlassCard, FeatureRow, StatusPill } from "@/components/auth/AuthFeatureShell";

export default function PasskeysPage() {
 const [registered,setRegistered]=useState(false);
 return <AuthFeatureShell title="Passkeys" description="Use a device passkey instead of typing a password. The frontend is ready for WebAuthn enrollment when the backend endpoints are enabled." eyebrow="Security"><GlassCard><FeatureRow icon={<Fingerprint className="h-5 w-5" />} title="This device" description="Use Face ID, Touch ID, Windows Hello or a hardware security key." action={<button onClick={()=>setRegistered(true)} className="rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white">{registered ? "Registered" : "Add passkey"}</button>} /><FeatureRow icon={<Laptop className="h-5 w-5" />} title="Other devices" description="Passkeys can be synced by your device platform or stored on security keys." action={<StatusPill>Coming soon</StatusPill>} /><FeatureRow icon={<KeyRound className="h-5 w-5" />} title="Password fallback" description="Keep a secure recovery method available in case a passkey is unavailable." /></GlassCard>{registered && <p className="mt-4 flex items-center gap-2 text-sm text-warning"><ShieldCheck className="h-4 w-4" /> Demo enrollment only — WebAuthn registration is not active yet.</p>}</AuthFeatureShell>;
}
