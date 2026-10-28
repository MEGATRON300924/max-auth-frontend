"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User, Settings as SettingsIcon, Search, HelpCircle, Grid3X3 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
      <header className="sticky top-0 z-30 flex min-h-[76px] items-center gap-4 border-b border-white/35 bg-white/60 px-4 shadow-[0_8px_28px_-24px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:px-6 lg:px-8 dark:border-white/[.06] dark:bg-slate-950/55">
        <button
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-base-raised lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden w-full max-w-[520px] md:block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <input
            aria-label="Search MAX Account"
            placeholder="Search MAX Account"
            className="h-12 w-full rounded-full border border-white/65 bg-white/60 pl-12 pr-5 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.75),0_8px_24px_-20px_rgba(15,23,42,.3)] outline-none backdrop-blur-xl transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/[.04]"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button aria-label="Help" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-base-raised hover:text-ink">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button aria-label="MAX apps" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-base-raised hover:text-ink">
            <Grid3X3 className="h-5 w-5" />
          </button>

          <Dropdown
            trigger={
              <button aria-label={`Open account menu for ${displayName}`} className="ml-1 flex h-11 w-11 items-center justify-center rounded-full p-0.5 hover:bg-base-raised">
                <img
                  src={profilePicture}
                  alt={`${displayName} profile`}
                  onError={(event) => {
                    if (event.currentTarget.src !== new URL("/user.png", window.location.origin).href) {
                      event.currentTarget.src = "/user.png";
                    }
                  }}
                  className="h-9 w-9 rounded-full border border-glass-border bg-base-raised object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            }
          >
            <DropdownItem onClick={() => router.push("/profile")}>
              <User className="h-4 w-4" /> Profile
            </DropdownItem>
            <DropdownItem onClick={() => router.push("/settings")}>
              <SettingsIcon className="h-4 w-4" /> Settings
            </DropdownItem>
            <div className="my-1 h-px bg-glass-border" />
            <DropdownItem onClick={handleLogout} danger>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownItem>
          </Dropdown>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full w-[300px] border-r border-white/20 bg-white/75 shadow-2xl backdrop-blur-2xl dark:bg-slate-950/85"
            >
              <DashboardSidebar className="w-full" />
            </motion.div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-base-raised text-ink shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
