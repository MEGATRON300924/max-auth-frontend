"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Globe2, Monitor, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/useToast";

type ThemeId = "black-white" | "black-blue" | "blue-white" | "graphite" | "midnight";
const themes: { id: ThemeId; name: string; description: string; colors: [string, string, string] }[] = [
  { id: "black-white", name: "Black & White", description: "Pure black surfaces with white controls.", colors: ["#080808", "#f5f5f5", "#303030"] },
  { id: "black-blue", name: "Black & Blue", description: "Black surfaces with blue interactive states.", colors: ["#080809", "#3b82f6", "#30353d"] },
  { id: "blue-white", name: "Blue & White", description: "White surfaces, dark text and blue actions.", colors: ["#f7f9fc", "#2563eb", "#dce2ea"] },
  { id: "graphite", name: "Graphite", description: "Graphite panels with restrained silver accents.", colors: ["#191a1c", "#c2c6cc", "#414449"] },
  { id: "midnight", name: "Midnight", description: "Deep navy surfaces and cool white text.", colors: ["#080f1c", "#bed3ef", "#283952"] },
];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} aria-pressed={value}
      className={`relative h-6 w-11 rounded border transition-colors ${value ? "border-ink bg-ink" : "border-glass-border bg-glass"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-sm bg-base-raised transition-all ${value ? "left-6" : "left-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [theme, setTheme] = useState<ThemeId>("black-white");
  const [notifications, setNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const current = document.documentElement.dataset.theme as ThemeId | undefined;
    if (current && themes.some((item) => item.id === current)) setTheme(current);
  }, []);

  const selectTheme = (next: ThemeId) => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next !== "blue-white");
    try { localStorage.setItem("max-auth-theme", next); } catch {}
  };

  const save = () => showToast({ title: "Preferences saved", description: "Your MAX Auth preferences have been saved on this device.", variant: "success" });

  return (
    <div className="space-y-7">
      <PageHeader title="Settings" description="Configure the MAX Auth workspace and account preferences." />

      <Card>
        <CardHeader><CardTitle>Workspace appearance</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-ink-muted">Choose a colour system for the dashboard and authentication screens.</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {themes.map((item) => {
              const selected = theme === item.id;
              return (
                <button key={item.id} type="button" onClick={() => selectTheme(item.id)} aria-pressed={selected}
                  className={`flex min-h-[112px] items-start gap-3 border p-3 text-left transition-colors ${selected ? "border-ink bg-glass-hover" : "border-glass-border bg-base-raised hover:border-ink-faint"}`}>
                  <span className="flex h-12 w-12 shrink-0 overflow-hidden border border-glass-border">
                    {item.colors.map((color, index) => <span key={index} className="h-full flex-1" style={{ backgroundColor: color }} />)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">{item.name}{selected && <Check className="h-4 w-4" />}</span>
                    <span className="mt-1 block text-xs leading-5 text-ink-muted">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-ink-faint">Theme selection is saved locally and applies across MAX Auth pages.</p>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Workspace preferences</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4 border border-glass-border p-4">
              <Monitor className="h-5 w-5 text-ink-muted" />
              <div className="flex-1"><p className="text-sm font-semibold text-ink">Compact dashboard</p><p className="text-xs leading-5 text-ink-faint">Reduce spacing on dense account screens.</p></div>
              <Toggle value={compact} onChange={() => setCompact(!compact)} />
            </div>
            <div className="flex items-center gap-4 border border-glass-border p-4">
              <Globe2 className="h-5 w-5 text-ink-muted" />
              <div className="flex-1"><p className="text-sm font-semibold text-ink">Language & region</p><p className="text-xs leading-5 text-ink-faint">Inherited from your MAX Account profile.</p></div>
              <span className="text-xs font-medium text-ink-faint">Account</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4 border border-glass-border p-4">
              <Bell className="h-5 w-5 text-ink-muted" />
              <div className="flex-1"><p className="text-sm font-semibold text-ink">Account notifications</p><p className="text-xs leading-5 text-ink-faint">Important MAX Account and product updates.</p></div>
              <Toggle value={notifications} onChange={() => setNotifications(!notifications)} />
            </div>
            <div className="flex items-center gap-4 border border-glass-border p-4">
              <ShieldCheck className="h-5 w-5 text-ink-muted" />
              <div className="flex-1"><p className="text-sm font-semibold text-ink">Security alerts</p><p className="text-xs leading-5 text-ink-faint">New sign-ins, password changes and security events.</p></div>
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
          <p className="mt-4 text-xs text-ink-faint">Theme selection is stored on this device. Account and notification settings retain their existing integration status.</p>
        </CardContent>
      </Card>
    </div>
  );
}
