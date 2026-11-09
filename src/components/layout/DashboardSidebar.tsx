"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  Building2,
  ClipboardCheck,
} from "lucide-react";
import { MaxLogo } from "./MaxLogo";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/tokenStore";
import { cn } from "@/lib/utils/cn";

type SidebarItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

type SidebarGroup = {
  label: string;
  items: SidebarItem[];
};

const groups: SidebarGroup[] = [
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
    items: [
      { href: "/developer", label: "Developer platform", icon: Code2 },
    ],
  },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [canReviewSpotlight, setCanReviewSpotlight] = useState(false);
  const [canManageKnowledgePanel, setCanManageKnowledgePanel] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient.get<{ permissions?: { spotlightEntities?: { canReview?: boolean } } }>("/profile/permissions")
      .then((result) => { if (active) setCanReviewSpotlight(result.permissions?.spotlightEntities?.canReview === true); })
      .catch(() => { if (active) setCanReviewSpotlight(false); });
    const spotlightApi=(process.env.NEXT_PUBLIC_SPOTLIGHT_API_URL || "https://max-spotlight-graph-api.onrender.com/api/v1").replace(/\/$/,"");
    const checkOwnerAccess=async()=>{
      try {
        const token=tokenStore.get() || await apiClient.silentRefresh();
        if(!token) return;
        const response=await fetch(spotlightApi+"/me/managed-entities",{headers:{Accept:"application/json",Authorization:"Bearer "+token},cache:"no-store"});
        if(!response.ok) return;
        const body=await response.json();
        if(active) setCanManageKnowledgePanel(Array.isArray(body.entities) && body.entities.length>0);
      } catch { if(active) setCanManageKnowledgePanel(false); }
    };
    void checkOwnerAccess();
    return () => { active = false; };
  }, []);

  const administrationItems: SidebarItem[] = [
    ...(user?.isAdmin ? [
      { href: "/admin", label: "Admin console", icon: ShieldCheck },
      { href: "/admin/organisations", label: "Organisation review", icon: Building2 },
    ] : []),
    ...(canReviewSpotlight ? [{ href: "/spotlight-review", label: "Spotlight review", icon: ClipboardCheck }] : []),
    ...(canManageKnowledgePanel ? [{ href: "/knowledge-panel", label: "Knowledge Panel", icon: Sparkles }] : []),
  ];
  const visibleGroups = administrationItems.length
    ? [...groups, { label: "Administration", items: administrationItems }]
    : groups;

  return (
    <aside className={cn("flex h-full w-[280px] shrink-0 flex-col bg-transparent", className)}>
      <div className="px-6 pb-5 pt-7">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5">
          <MaxLogo size={31} showWordmark={false} />
          <span className="text-[22px] font-normal tracking-[-0.03em] text-ink">MAX Account</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-8" aria-label="MAX Account">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-7 last:mb-0">
            <p className="mb-2 px-4 text-xs font-medium text-ink-muted">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === href || pathname.startsWith(`${href}/`);
                const className = cn(
                  "flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
                    : "text-ink-muted hover:bg-base-raised hover:text-ink"
                );

                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={className}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                );
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
