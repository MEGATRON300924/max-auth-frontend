"use client";

import { useEffect, useState } from "react";
import { Bell, Globe2, Monitor, Moon, ShieldCheck, Smartphone, Sun, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/useToast";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={value}
      className={`relative h-6 w-11 rounded-full border transition-colors ${value ? "border-brand-600 bg-brand-600" : "border-glass-border bg-glass"}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${value ? "left-6" : "left-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [dark, setDark] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("max-auth-theme", next ? "dark" : "light");
  };

  const save = () =>
    showToast({
      title: "Preferences saved",
      description: "Your local MAX Auth preferences have been saved.",
      variant: "success",
    });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage the MAX Account experience, notifications and security preferences." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Experience</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4 rounded-lg border border-glass-border p-4">
              {dark ? <Moon className="h-5 w-5 text-ink-muted" /> : <Sun className="h-5 w-5 text-ink-muted" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Dark appearance</p>
                <p className="text-xs leading-5 text-ink-faint">Use the dark MAX Auth interface.</p>
              </div>
              <Toggle value={dark} onChange={toggleTheme} />
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-glass-border p-4">
              <Monitor className="h-5 w-5 text-ink-muted" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Compact dashboard</p>
                <p className="text-xs leading-5 text-ink-faint">Reduce spacing on dense account screens.</p>
              </div>
              <Toggle value={compact} onChange={() => setCompact(!compact)} />
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-glass-border p-4">
              <Globe2 className="h-5 w-5 text-ink-muted" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Language & region</p>
                <p className="text-xs leading-5 text-ink-faint">Inherited from your MAX Account profile.</p>
              </div>
              <span className="text-xs font-medium text-ink-faint">Account</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4 rounded-lg border border-glass-border p-4">
              <Bell className="h-5 w-5 text-ink-muted" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Account notifications</p>
                <p className="text-xs leading-5 text-ink-faint">Important MAX Account and product updates.</p>
              </div>
              <Toggle value={notifications} onChange={() => setNotifications(!notifications)} />
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-glass-border p-4">
              <ShieldCheck className="h-5 w-5 text-ink-muted" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Security alerts</p>
                <p className="text-xs leading-5 text-ink-faint">New sign-ins, password changes and security events.</p>
              </div>
              <Toggle value={securityAlerts} onChange={() => setSecurityAlerts(!securityAlerts)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Account preferences</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="secondary" onClick={save}><Smartphone className="h-4 w-4" /> Save preferences</Button>
            <Button variant="secondary" onClick={() => showToast({ title: "Preferences reset", variant: "success" })}>Reset local preferences</Button>
            <Button variant="danger" onClick={() => showToast({ title: "Account deletion", description: "Use Security → Delete account to permanently delete your MAX Account.", variant: "error" })}><Trash2 className="h-4 w-4" /> Delete account</Button>
          </div>
          <p className="mt-4 text-xs text-ink-faint">UI preferences are currently local until corresponding backend persistence is connected.</p>
        </CardContent>
      </Card>
    </div>
  );
}
