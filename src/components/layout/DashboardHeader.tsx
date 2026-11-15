"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User, Settings as SettingsIcon, Search, HelpCircle, Grid3X3 } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast({ title: "Signed out", variant: "success" });
      router.push("/sign-in");
    } catch {
      showToast({ title: "Couldn't sign out", description: "Please try again.", variant: "error" });
    }
  };

  const displayName = user?.displayName || user?.username || "Account";
  const profilePicture = user?.avatarUrl || "/user.png";

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-[62px] items-center gap-4 border-b border-glass-border bg-base px-4 sm:px-6 lg:px-8">
        <button className="grid h-9 w-9 shrink-0 place-items-center border border-glass-border text-ink-muted hover:bg-glass-hover lg:hidden"
          onClick={() => setMobileOpen(true)} aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden w-full max-w-[560px] md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input aria-label="Search MAX Account" placeholder="Search settings, apps, users and API resources"
            className="h-9 w-full rounded-none border border-glass-border bg-base-raised pl-9 pr-4 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-ink-muted focus:ring-0" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button aria-label="Help" className="grid h-9 w-9 place-items-center border border-transparent text-ink-muted hover:border-glass-border hover:bg-glass-hover"><HelpCircle className="h-4 w-4" /></button>
          <button aria-label="MAX apps" className="grid h-9 w-9 place-items-center border border-transparent text-ink-muted hover:border-glass-border hover:bg-glass-hover"><Grid3X3 className="h-4 w-4" /></button>
          <Dropdown trigger={
            <button aria-label={`Open account menu for ${displayName}`} className="ml-2 flex h-9 items-center gap-2 border border-glass-border bg-base-raised px-2">
              <img src={profilePicture} alt="" onError={(event) => { event.currentTarget.src = "/user.png"; }}
                className="h-6 w-6 border border-glass-border bg-base object-cover" referrerPolicy="no-referrer" />
              <span className="hidden max-w-[130px] truncate text-xs font-medium text-ink sm:block">{displayName}</span>
            </button>
          }>
            <DropdownItem onClick={() => router.push("/profile")}><User className="h-4 w-4" /> Profile</DropdownItem>
            <DropdownItem onClick={() => router.push("/settings")}><SettingsIcon className="h-4 w-4" /> Settings</DropdownItem>
            <div className="my-1 h-px bg-glass-border" />
            <DropdownItem onClick={handleLogout} danger><LogOut className="h-4 w-4" /> Sign out</DropdownItem>
          </Dropdown>
        </div>
      </header>

      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden">
        <button aria-label="Close navigation overlay" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" />
        <div className="absolute left-0 top-0 h-full w-[290px] border-r border-glass-border bg-base">
          <DashboardSidebar className="w-full" />
        </div>
        <button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="absolute right-4 top-4 grid h-9 w-9 place-items-center border border-glass-border bg-base text-ink"><X className="h-4 w-4" /></button>
      </div>}
    </>
  );
}
