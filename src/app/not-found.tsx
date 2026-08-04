import Link from "next/link";
import { Compass } from "lucide-react";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { MaxLogo } from "@/components/layout/MaxLogo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <AuroraBackground variant="subtle" />
      <div className="relative mb-8"><MaxLogo size={32} /></div>
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-glass text-brand-300 backdrop-blur-md">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="relative mt-6 font-display text-5xl font-semibold tracking-tight text-ink">404</h1>
      <p className="relative mt-2 max-w-sm text-sm text-ink-muted">This page doesn&apos;t exist in the MAX AI Ecosystem. Let&apos;s get you back on track.</p>
      <Link href="/" className="relative mt-8"><Button>Back to home</Button></Link>
    </div>
  );
}
