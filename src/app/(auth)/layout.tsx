"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaxLogo } from "@/components/layout/MaxLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/sign-in") {
    return <div className="min-h-screen w-full overflow-x-hidden bg-base text-ink">{children}</div>;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-base px-4 py-12 text-ink">
      <div className="relative mb-8 flex items-center gap-3 border border-glass-border bg-base-raised px-5 py-3">
        <MaxLogo size={30} />
        <span className="text-sm font-semibold tracking-tight">MAX Auth</span>
      </div>
      <div className="relative w-full max-w-md">{children}</div>
      <p className="relative mt-8 text-center text-xs text-ink-faint">
        <Link href="/privacy-policy" className="transition-colors hover:text-ink">Privacy Policy</Link>
        {" · "}
        <Link href="/terms-of-service" className="transition-colors hover:text-ink">Terms of Service</Link>
      </p>
    </div>
  );
}
