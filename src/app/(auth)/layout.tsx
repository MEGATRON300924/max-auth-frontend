"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaxLogo } from "@/components/layout/MaxLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The split-screen sign-in page owns its full-screen layout. Do not constrain
  // it with the centered max-w-md card used by the other authentication pages.
  if (pathname === "/sign-in") {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-base text-ink">
        {children}
      </div>
    );
  }

  return (
    <div className="aurora-canvas relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-base px-4 py-12 text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-blue-400/20 blur-[90px] dark:bg-blue-500/15" />
        <div className="absolute -right-28 top-[18%] h-[26rem] w-[26rem] rounded-full bg-violet-400/15 blur-[100px] dark:bg-violet-500/15" />
        <div className="absolute -bottom-48 left-[28%] h-[28rem] w-[28rem] rounded-full bg-cyan-300/15 blur-[100px] dark:bg-cyan-500/10" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:radial-gradient(rgb(100_116_139)_0.7px,transparent_0.7px)] [background-size:18px_18px]" />
      </div>
      <div className="relative mb-8 rounded-2xl border border-white/50 bg-white/45 px-5 py-3 shadow-[0_10px_40px_-24px_rgba(15,23,42,.3)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[.04]">
        <MaxLogo size={36} />
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
