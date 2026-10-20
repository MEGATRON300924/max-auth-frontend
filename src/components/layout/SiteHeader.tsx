"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { MaxLogo } from "./MaxLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";

const links = [
  { href: "/#products", label: "Products" },
  { href: "/#security", label: "Security" },
  { href: "/#developers", label: "Developers" },
  { href: "/business", label: "Businesses" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/65 shadow-[0_8px_30px_-24px_rgba(15,23,42,.45)] backdrop-blur-2xl dark:border-white/[.08] dark:bg-slate-950/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="MAX Auth home"><MaxLogo size={30} /></Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-ink-muted transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button size="sm" onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-semibold text-ink-muted transition-colors hover:text-ink">Sign in</Link>
              <Button size="sm" onClick={() => router.push("/create-account")}>Create account</Button>
            </>
          )}
        </div>

        <button className="rounded-xl border border-glass-border/70 bg-white/45 p-2 text-ink shadow-sm backdrop-blur-xl dark:bg-white/[.05] md:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-glass-border/70 bg-white/85 px-4 py-4 shadow-lg backdrop-blur-2xl dark:bg-slate-950/90 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-glass-hover hover:text-ink">
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-glass-border pt-3">
              <Link href="/sign-in" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-muted hover:bg-glass-hover hover:text-ink">Sign in</Link>
              <Link href="/create-account"><Button className="w-full">Create account</Button></Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
