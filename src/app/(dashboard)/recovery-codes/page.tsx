"use client";

import { useEffect, useState } from "react";
import { Copy, Download, KeyRound, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { AuthFeatureShell, GlassCard, FeatureRow } from "@/components/auth/AuthFeatureShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/lib/hooks/useToast";
import { ApiError } from "@/lib/api/ApiError";
import { mfaApi } from "@/lib/api/mfa";

export default function RecoveryPage() {
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [generated, setGenerated] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void mfaApi.status().then((s) => { setEnabled(s.enabled); setRemaining(s.recoveryCodesRemaining); }).catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load recovery status.")).finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    if (!password || !code) { setError("Enter your password and current authenticator or recovery code."); return; }
    setBusy(true); setError(null);
    try {
      const result = await mfaApi.regenerateRecoveryCodes(password, code);
      setGenerated(result.recoveryCodes);
      setRemaining(result.recoveryCodes.length);
      setPassword(""); setCode("");
      showToast({ title: "Recovery codes regenerated", variant: "success" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't regenerate recovery codes.");
    } finally { setBusy(false); }
  };

  const copy = async () => {
    if (!generated) return;
    await navigator.clipboard?.writeText(generated.join("\n"));
    showToast({ title: "Recovery codes copied", variant: "success" });
  };

  const download = () => {
    if (!generated) return;
    const blob = new Blob(["MAX Account recovery codes\n\n" + generated.join("\n") + "\n\nEach code can be used once. Keep these private."], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "max-account-recovery-codes.txt"; a.click(); URL.revokeObjectURL(url);
  };

  return <AuthFeatureShell title="Recovery codes" description="Manage the one-time backup codes for your MAX Account." eyebrow="Security">
    {error && <Alert variant="danger">{error}</Alert>}
    {!loading && !enabled ? (
      <GlassCard><FeatureRow icon={<ShieldCheck className="h-5 w-5" />} title="Two-factor authentication is not enabled" description="Recovery codes become available after you enable an authenticator." action={<Button size="sm" onClick={() => window.location.assign("/two-factor")}>Set up 2-step verification</Button>} /></GlassCard>
    ) : (
      <>
        <GlassCard>
          <FeatureRow icon={<KeyRound className="h-5 w-5" />} title="Backup codes" description={`${remaining} code${remaining === 1 ? "" : "s"} remaining. Regenerating invalidates the previous set.`} action={<span className="text-xs font-semibold text-success">Protected</span>} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="MAX Account password" type="password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Authenticator or recovery code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456 or XXXX-XXXX-XXXX" />
          </div>
          <Button className="mt-4" onClick={generate} isLoading={busy}><RefreshCw className="h-4 w-4" /> Regenerate codes</Button>
        </GlassCard>

        {generated && <GlassCard className="mt-5 border-brand-500/30">
          <div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-base font-semibold text-ink">Your new recovery codes</h2><p className="mt-1 text-xs leading-5 text-ink-muted">Save these now. MAX will not display the plaintext codes again after you leave this page.</p></div><ShieldCheck className="h-5 w-5 text-brand-500" /></div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{generated.map((c) => <code key={c} className="rounded-xl border border-glass-border bg-base p-3 text-center text-xs text-ink-muted">{c}</code>)}</div>
          <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={copy}><Copy className="h-3.5 w-3.5" /> Copy all</Button><Button size="sm" variant="secondary" onClick={download}><Download className="h-3.5 w-3.5" /> Download</Button><Button size="sm" variant="ghost" onClick={() => setGenerated(null)}>Hide codes</Button></div>
        </GlassCard>}
      </>
    )}
  </AuthFeatureShell>;
}
