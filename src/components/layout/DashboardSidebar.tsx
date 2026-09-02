"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Sparkles, ShieldCheck, Laptop, History, KeyRound, Link2, Settings, Code2, Fingerprint, LockKeyhole, LifeBuoy, Database, Mic2, Home } from "lucide-react";
import { MaxLogo } from "./MaxLogo";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/ai-personalization", label: "AI Personalization", icon: Sparkles },
  { href: "/security", label: "Security", icon: ShieldCheck },
  { href: "/devices", label: "Devices", icon: Laptop },
  { href: "/voice", label: "MAX Voice", icon: Mic2 },
  { href: "/home", label: "MAX Home", icon: Home },
  { href: "/sessions", label: "Sessions", icon: KeyRound },
  { href: "/login-history", label: "Login History", icon: History },
  { href: "/connected-apps", label: "Connected Apps", icon: Link2 },
  { href: "/developer", label: "Developer Platform", icon: Code2 },
  { href: "/two-factor", label: "Two-Factor", icon: LockKeyhole },
  { href: "/passkeys", label: "Passkeys", icon: Fingerprint },
  { href: "/recovery-codes", label: "Recovery Codes", icon: LifeBuoy },
  { href: "/privacy", label: "Privacy & Data", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  return <aside className={cn("flex h-full w-64 shrink-0 flex-col border-r border-glass-border bg-base-raised/60 backdrop-blur-xl", className)}>
    <div className="flex h-16 items-center px-5"><MaxLogo size={28} /></div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
      {nav.map(({ href, label, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150", active ? "bg-brand-500/15 text-brand-300 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]" : "text-ink-muted hover:bg-white/5 hover:text-ink")}><Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />{label}</Link> })}
    </nav>
    <div className="border-t border-glass-border p-4"><p className="text-xs text-ink-faint">One MAX Account. Every product in the ecosystem.</p></div>
  </aside>;
}
