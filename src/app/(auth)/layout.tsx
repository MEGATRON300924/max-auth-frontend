import Link from "next/link";
import { MaxLogo } from "@/components/layout/MaxLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f8fa] px-4 py-12 text-[#252b36] dark:bg-[#17191d] dark:text-[#e5e7eb]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[12%] h-80 w-80 rounded-full bg-blue-200/25 blur-3xl dark:bg-blue-900/15" />
        <div className="absolute -bottom-40 right-[10%] h-72 w-72 rounded-full bg-slate-200/40 blur-3xl dark:bg-slate-800/25" />
      </div>
      <div className="relative mb-8">
        <MaxLogo size={36} />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
      <p className="relative mt-8 text-center text-xs text-[#667085] dark:text-[#a2a8b3]">
        <Link href="/privacy-policy" className="transition-colors hover:text-[#344054] dark:hover:text-[#d0d5dd]">Privacy Policy</Link>
        {" · "}
        <Link href="/terms-of-service" className="transition-colors hover:text-[#344054] dark:hover:text-[#d0d5dd]">Terms of Service</Link>
      </p>
    </div>
  );
}
