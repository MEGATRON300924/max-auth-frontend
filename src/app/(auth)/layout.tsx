import Link from "next/link";
import { MaxLogo } from "@/components/layout/MaxLogo";
import { AuroraBackground } from "@/components/layout/AuroraBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <AuroraBackground />
      <div className="relative mb-8">
        <MaxLogo size={36} />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
      <p className="relative mt-8 text-center text-xs text-ink-faint">
        <Link href="/privacy-policy" className="hover:text-ink-muted">Privacy Policy</Link>
        {" · "}
        <Link href="/terms-of-service" className="hover:text-ink-muted">Terms of Service</Link>
      </p>
    </div>
  );
}
