"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  ShieldCheck,
  KeyRound,
  Laptop,
  Database,
  Users,
  CreditCard,
  Sparkles,
  Mic2,
  House,
  Link2,
  Code2,
  ExternalLink,
} from "lucide-react";
import { MaxLogo } from "./MaxLogo";
import { cn } from "@/lib/utils/cn";

const groups = [
  {
    label: "Account",
    items: [
      { href: "/dashboard", label: "Home", icon: Home },
      { href: "/profile", label: "Personal info", icon: User },
      { href: "/security", label: "Security & sign-in", icon: ShieldCheck },
      { href: "/passkeys", label: "Password & passkeys", icon: KeyRound },
      { href: "/devices", label: "Your devices", icon: Laptop },
      { href: "/privacy", label: "Data & privacy", icon: Database },
      { href: "/connected-apps", label: "People & sharing", icon: Users },
      { href: "/settings", label: "Payments & subscriptions", icon: CreditCard },
    ],
  },
  {
    label: "MAX services",
    items: [
      { href: "/ai-personalization", label: "MAX AI", icon: Sparkles },
      { href: "/voice", label: "MAX Voice", icon: Mic2 },
      { href: "/home", label: "MAX Home", icon: House },
      { href: "/connected-apps", label: "Connected apps", icon: Link2 },
    ],
  },
  {
    label: "Developer",
    items: [{ href: "https://developers.max-ai.name.ng", label: "Developer platform", icon: Code2, external: true }],
  },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full w-[280px] shrink-0 flex-col bg-transparent", className)}>
      <div className="px-6 pb-5 pt-7">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5">
          <MaxLogo size={31} showWordmark={false} />
          <span className="text-[22px] font-normal tracking-[-0.03em] text-ink">MAX Account</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-8" aria-label="MAX Account">
        {groups.map((group) => (
          <div key={group.label} className="mb-7 last:mb-0">
            <p className="mb-2 px-4 text-xs font-medium text-ink-muted">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon, external }) => {
                const active = !external && (href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === href || pathname.startsWith(`${href}/`));
                const className = cn(
                  "flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
                    : "text-ink-muted hover:bg-base-raised hover:text-ink"
                );

                if (external) {
                  return <a key={`${href}-${label}`} href={href} className={className}><Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" /><span>{label}</span><ExternalLink className="ml-auto h-3.5 w-3.5 opacity-60" aria-hidden="true" /></a>;
                }

                return <Link key={`${href}-${label}`} href={href} aria-current={active ? "page" : undefined} className={className}><Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" /><span>{label}</span></Link>;
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-7 pb-7">
        <p className="text-xs leading-5 text-ink-faint">One MAX Account for your MAX services.</p>
      </div>
    </aside>
  );
}
