"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User, Settings as SettingsIcon, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { DashboardSidebar } from "./DashboardSidebar";
import { getInitials } from "@/lib/utils/formatters";

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

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-glass-border bg-base-raised px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border border-glass-border bg-base-raised p-2 text-ink lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-ink-faint">MAX Account</p>
            <p className="text-sm font-semibold text-ink">Identity & security</p>
          </div>
        </div>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-lg border border-glass-border bg-base-raised px-2 py-1.5 text-sm transition-colors hover:bg-glass-hover">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-[11px] font-bold text-white">
                {getInitials(displayName)}
              </span>
              <span className="hidden max-w-[10rem] truncate font-semibold text-ink sm:inline">{displayName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
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
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/45"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full shadow-xl"
            >
              <DashboardSidebar className="w-72" />
            </motion.div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-4 top-4 rounded-lg border border-white/10 bg-slate-900 p-2 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
