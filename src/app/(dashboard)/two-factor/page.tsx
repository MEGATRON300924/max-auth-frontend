"use client";

import { useEffect, useState } from "react";
import { Copy, KeyRound, Lock, ShieldCheck, Smartphone, RefreshCw, Eye, EyeOff } from "lucide-react";
import { AuthFeatureShell, GlassCard, FeatureRow, StatusPill } from "@/components/auth/AuthFeatureShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/lib/hooks/useToast";
import { ApiError } from "@/lib/api/ApiError";
import { mfaApi, type MfaSetup } from "@/lib/api/mfa";

export default function TwoFactorPage() {
  const { showToast } = useToast();
  const [status, setStatus] = useState({ enabled: false, method: null as string | null, recoveryCodesRemaining: 0 });
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionPassword, setActionPassword] = useState("");
  const [actionCode, setActionCode] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMode, setActionMode] = useState<"regenerate" | "disable" | null>(null);

  const load = async () => {
    try { setStatus(await mfaApi.status()); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't load MFA status."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const start = async () => {
    setError(null); setNotice(null); setBusy(true);
    try {
      const result = await mfaApi.setup(password);
      setSetup(result); setPassword(""); setCode("");
      setNotice("Your authenticator secret is ready. Add it to your authenticator app, then enter the current 6-digit code below.");
    } catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't start authenticator setup."); }
    finally { setBusy(false); }
  };

  const enable = async () => {
    if (!setup) return;
    setError(null);
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6-digit code from your authenticator app."); return; }
    setBusy(true);
    try {
      const result = await mfaApi.enable(password, code);
      setRecoveryCodes(result.recoveryCodes);
      setSetup(null); setPassword(""); setCode("");
      await load();
      showToast({ title: "Two-factor authentication enabled", variant: "success" });
    } catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't enable two-factor authentication."); }
    finally { setBusy(false); }
  };

  const copy = async (text: string, title = "Copied") => {
    try { await navigator.clipboard.writeText(text); showToast({ title, variant: "success" }); }
    catch { setNotice("Copy isn't available here. Select and copy the text manually."); }
  };

  const downloadCodes = () => {
    if (!recoveryCodes) return;
    const blob = new Blob(["MAX Account recovery codes\n\n" + recoveryCodes.join("\n") + "\n\nEach code can be used once. Keep these somewhere safe."], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "max-account-recovery-codes.txt"; a.click(); URL.revokeObjectURL(url);
  };

  const openAction = (mode: "regenerate" | "disable") => {
    setActionMode(mode); setActionPassword(""); setActionCode(""); setError(null); setConfirmOpen(true);
  };

  const runAction = async () => {
    if (!actionMode) return;
    if (!actionPassword || !actionCode) { setError("Enter your password and authenticator or recovery code."); return; }
    setActionBusy(true); setError(null);
    try {
      if (actionMode === "regenerate") {
        const result = await mfaApi.regenerateRecoveryCodes(actionPassword, actionCode);
        setRecoveryCodes(result.recoveryCodes); setConfirmOpen(false);
        await load(); showToast({ title: "Recovery codes regenerated", variant: "success" });
      } else {
        await mfaApi.disable(actionPassword, actionCode);
        setConfirmOpen(false); setRecoveryCodes(null); await load();
        showToast({ title: "Two-factor authentication disabled", variant: "success" });
      }
    } catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't complete the security change."); }
    finally { setActionBusy(false); }
  };

  const secretDisplay = setup?.secret ? (showSecret ? setup.secret : "•••• •••• ••••") : "";

  return <AuthFeatureShell eyebrow="Security" title="Two-factor authentication" description="Add a second verification step to protect your MAX Account at sign-in.">
    {error && <Alert variant="danger">{error}</Alert>}
    {notice && <div className="mb-5"><Alert variant="info">{notice}</Alert></div>}
    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <GlassCard>
        <FeatureRow icon={<Smartphone className="h-5 w-5" />} title="Authenticator app" description="Use Google Authenticator, Microsoft Authenticator, 1Password or another standards-based TOTP app." action={<StatusPill tone={status.enabled ? "success" : "warning"}>{loading ? "Loading…" : status.enabled ? "Enabled" : "Not enabled"}</StatusPill>} />

        {!status.enabled && !setup && (
          <div className="mt-5 space-y-4">
            <Input label="MAX Account password" type="password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Confirm your password" />
            <Button onClick={start} isLoading={busy} className="w-full">Set up authenticator</Button>
          </div>
        )}

        {!status.enabled && setup && (
          <div className="mt-5 space-y-5">
            <div className="rounded-xl border border-glass-border bg-base p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Setup key</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="min-w-0 flex-1 break-all rounded-lg bg-black/5 p-3 text-sm font-mono dark:bg-white/5">{secretDisplay}</div>
                <button type="button" onClick={() => setShowSecret(v => !v)} className="rounded-lg p-2 text-ink-muted hover:bg-glass-hover" aria-label={showSecret ? "Hide setup key" : "Show setup key"}>{showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button type="button" onClick={() => copy(setup.secret, "Setup key copied")} className="rounded-lg p-2 text-ink-muted hover:bg-glass-hover" aria-label="Copy setup key"><Copy className="h-4 w-4" /></button>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink-faint">In your authenticator, choose “Add account” → “Enter setup key manually”. Account: your MAX email · Issuer: MAX Account · 6 digits · 30 seconds.</p>
            </div>
            <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
              <p className="text-sm font-semibold text-ink">Verify the authenticator</p>
              <p className="mt-1 text-xs text-ink-muted">Enter the current code shown by your authenticator to activate MFA.</p>
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" className="mt-3 h-12 w-full rounded-lg border border-glass-border bg-base px-4 text-center font-mono text-lg tracking-[.3em] outline-none focus:border-brand-500" />
            </div>
            <div className="flex gap-3"><Button variant="secondary" onClick={() => { setSetup(null); setPassword(""); setCode(""); }}>Cancel</Button><Button onClick={enable} isLoading={busy} className="flex-1">Enable MFA</Button></div>
          </div>
        )}

        {status.enabled && (
          <div className="mt-5 rounded-xl border border-success/20 bg-success/5 p-4">
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-success" /><div><p className="text-sm font-semibold text-ink">Your account is protected with an authenticator</p><p className="mt-1 text-xs leading-5 text-ink-muted">MAX will ask for a verification code whenever you sign in. Recovery codes provide emergency access if you lose your authenticator.</p></div></div>
          </div>
        )}
      </GlassCard>

      <div className="space-y-5">
        <GlassCard>
          <FeatureRow icon={<KeyRound className="h-5 w-5" />} title="Recovery codes" description="Single-use backup codes for when you can't access your authenticator." action={<StatusPill>{status.enabled ? status.recoveryCodesRemaining + " left" : "Available after setup"}</StatusPill>} />
          {status.enabled && <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => openAction("regenerate")}><RefreshCw className="h-4 w-4" /> Regenerate</Button><Button size="sm" variant="ghost" onClick={() => setRecoveryCodes(null)}>Hide</Button></div>}
        </GlassCard>
        <GlassCard>
          <FeatureRow icon={<ShieldCheck className="h-5 w-5" />} title="Security controls" description="Changing or disabling MFA requires your password plus a current authenticator or recovery code." />
          {status.enabled && <Button variant="danger" size="sm" className="mt-4" onClick={() => openAction("disable")}>Disable MFA</Button>}
        </GlassCard>
      </div>
    </div>

    {recoveryCodes && (
      <GlassCard className="mt-5 border-brand-500/30">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-ink">Save your recovery codes</h2><p className="mt-1 text-xs leading-5 text-ink-muted">These codes are shown after they are generated. Store them somewhere safe. Each code works once.</p></div><ShieldCheck className="h-5 w-5 text-brand-500" /></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{recoveryCodes.map((item) => <div key={item} className="rounded-lg border border-glass-border bg-base p-2.5 text-center text-xs font-mono">{item}</div>)}</div>
        <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => copy(recoveryCodes.join("\n"), "Recovery codes copied")}><Copy className="h-4 w-4" /> Copy all</Button><Button size="sm" variant="secondary" onClick={downloadCodes}>Download</Button><Button size="sm" variant="ghost" onClick={() => setRecoveryCodes(null)}>I've saved them</Button></div>
      </GlassCard>
    )}

    <p className="mt-4 text-xs leading-5 text-ink-faint">The setup key and recovery codes stay in this browser's UI and are not sent to analytics services.</p>

    <Modal open={confirmOpen} onClose={() => !actionBusy && setConfirmOpen(false)} title={actionMode === "disable" ? "Disable two-factor authentication?" : "Regenerate recovery codes"} description={actionMode === "disable" ? "This removes the second sign-in step and revokes active OAuth access for your account." : "Your current recovery codes will stop working and be replaced with a new set."}>
      <div className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <Input label="MAX Account password" type="password" icon={<Lock className="h-4 w-4" />} value={actionPassword} onChange={(e) => setActionPassword(e.target.value)} />
        <Input label="Authenticator or recovery code" value={actionCode} onChange={(e) => setActionCode(e.target.value)} placeholder="123456 or XXXX-XXXX-XXXX" />
        <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button variant={actionMode === "disable" ? "danger" : "primary"} onClick={runAction} isLoading={actionBusy}>{actionMode === "disable" ? "Disable MFA" : "Regenerate codes"}</Button></div>
      </div>
    </Modal>
  </AuthFeatureShell>;
}
