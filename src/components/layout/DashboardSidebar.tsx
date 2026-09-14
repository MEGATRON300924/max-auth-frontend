"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Sparkles,
  ShieldCheck,
  Laptop,
  History,
  KeyRound,
  Link2,
  Settings,
  Code2,
  Fingerprint,
  LockKeyhole,
  LifeBuoy,
  Database,
  Mic2,
  Home,
} from "lucide-react";
import { MaxLogo } from "./MaxLogo";
import { cn } from "@/lib/utils/cn";

const groups = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/privacy", label: "Privacy & Data", icon: Database },
    ],
  },
  {
    label: "Security",
    items: [
      { href: "/security", label: "Security", icon: ShieldCheck },
      { href: "/devices", label: "Devices", icon: Laptop },
      { href: "/sessions", label: "Sessions", icon: KeyRound },
      { href: "/login-history", label: "Login History", icon: History },
      { href: "/two-factor", label: "Two-Factor", icon: LockKeyhole },
      { href: "/passkeys", label: "Passkeys", icon: Fingerprint },
      { href: "/recovery-codes", label: "Recovery Codes", icon: LifeBuoy },
    ],
  },
  {
    label: "MAX Ecosystem",
    items: [
      { href: "/ai-personalization", label: "AI Personalization", icon: Sparkles },
      { href: "/voice", label: "MAX Voice", icon: Mic2 },
      { href: "/home", label: "MAX Home", icon: Home },
      { href: "/connected-apps", label: "Connected Apps", icon: Link2 },
    ],
  },
  {
    label: "Developer",
    items: [{ href: "/developer", label: "Developer Platform", icon: Code2 }],
  },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full w-64 shrink-0 flex-col border-r border-glass-border bg-base-raised", className)}>
      <div className="flex h-16 shrink-0 items-center border-b border-glass-border px-5">
        <MaxLogo size={27} />
        <div className="ml-2.5">
          <p className="text-sm font-bold tracking-tight text-ink">MAX Auth</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-ink-faint">Identity Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="MAX Account">
        {groups.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150",
                      active
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "text-ink-muted hover:bg-glass-hover hover:text-ink"
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-600" />}
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-glass-border px-5 py-4">
        <p className="text-[11px] leading-5 text-ink-faint">One MAX Account. Every product in the ecosystem.</p>
      </div>
    </aside>
  );
}
