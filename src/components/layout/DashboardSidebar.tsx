"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, User, ShieldCheck, KeyRound, Laptop, Database, Users, Mic2, Link2, Code2, Building2, ClipboardCheck } from "lucide-react";
import { MaxLogo } from "./MaxLogo";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/tokenStore";
import { cn } from "@/lib/utils/cn";
type SidebarItem = { href: string; label: string; icon?: typeof Home; iconSrc?: string; imageSrc?: string };
type SidebarGroup = { label: string; items: SidebarItem[] };
const groups: SidebarGroup[] = [
  { label: "Developer", items: [
    { href: "/developer", label: "Applications", icon: Code2 },
    { href: "/developer/docs", label: "Documentation", icon: KeyRound },
  ] },
  { label: "Account", items: [
    { href: "/dashboard", label: "Overview", iconSrc: "/home-smile-svgrepo-com.svg" },
    { href: "/profile", label: "Personal info", icon: User },
    { href: "/security", label: "Security & sign-in", iconSrc: "/password-minimalistic-input-svgrepo-com.svg" },
    { href: "/passkeys", label: "Password & passkeys", icon: KeyRound },
    { href: "/devices", label: "Your devices", iconSrc: "/devices-svgrepo-com%20(1).svg" },
    { href: "/privacy", label: "Data & privacy", iconSrc: "/privacy-dashboard-svgrepo-com.svg" },
    { href: "/connected-apps", label: "People & sharing", icon: Users },
    { href: "/settings", label: "Payments & subscriptions", iconSrc: "/pay-svgrepo-com.svg" },
  ] },
  { label: "MAX services", items: [
    { href: "/ai-personalization", label: "MAX AI", icon: Database },
    { href: "/voice", label: "MAX Voice", icon: Mic2 },
    { href: "/home", label: "MAX Home", imageSrc: "/max_home.png" },
    { href: "/connected-apps", label: "Connected apps", icon: Link2 },
  ] },
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
    const spotlightApi = (process.env.NEXT_PUBLIC_SPOTLIGHT_API_URL || "https://max-spotlight-graph-api.onrender.com/api/v1").replace(/\/$/, "");
    const checkOwnerAccess = async () => {
      try {
        const token = tokenStore.get() || await apiClient.silentRefresh();
        if (!token) return;
        const response = await fetch(spotlightApi + "/me/managed-entities", { headers: { Accept: "application/json", Authorization: "Bearer " + token }, cache: "no-store" });
        if (!response.ok) return;
        const body = await response.json();
        if (active) setCanManageKnowledgePanel(Array.isArray(body.entities) && body.entities.length > 0);
      } catch { if (active) setCanManageKnowledgePanel(false); }
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
    ...(canManageKnowledgePanel ? [{ href: "/knowledge-panel", label: "Knowledge Panel", icon: Database }] : []),
  ];
  const visibleGroups = administrationItems.length ? [...groups, { label: "Administration", items: administrationItems }] : groups;
  return (
    <aside className={cn("flex h-full w-[250px] shrink-0 flex-col border-r border-glass-border bg-base", className)}>
      <div className="border-b border-glass-border px-5 pb-5 pt-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5"><MaxLogo size={31} showWordmark={false} /><span className="text-[16px] font-semibold tracking-tight text-ink">MAX Auth</span></Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-8" aria-label="MAX Account">
        {visibleGroups.map((group) => <div key={group.label} className="mb-5 last:mb-0">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon, iconSrc, imageSrc }) => {
              const active = href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`);
              const itemClass = cn("flex min-h-10 items-center gap-3 border-l-2 px-3 text-[13px] font-medium transition-colors", active ? "border-ink bg-glass-hover text-ink" : "border-transparent text-ink-muted hover:bg-glass-hover hover:text-ink");
              return <Link key={`${href}-${label}`} href={href} aria-current={active ? "page" : undefined} className={itemClass}>
                {imageSrc ? <Image src={imageSrc} alt="" width={22} height={22} className="h-[22px] w-[22px] shrink-0 object-contain" /> :
                  iconSrc ? <img src={iconSrc} alt="" width={19} height={19} className="h-[19px] w-[19px] shrink-0 object-contain dark:brightness-0 dark:invert" /> :
                  Icon ? <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" /> : null}
                <span>{label}</span>
              </Link>;
            })}
          </div>
        </div>)}
      </nav>
      <div className="border-t border-glass-border px-5 py-4"><p className="text-[11px] leading-5 text-ink-faint">Identity & developer platform</p></div>
    </aside>
  );
}