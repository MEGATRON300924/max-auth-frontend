import Link from "next/link";
import { Compass } from "lucide-react";
import { MaxLogo } from "@/components/layout/MaxLogo";
import { Button } from "@/components/ui/Button";
export default function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-base px-4 text-center text-ink">
    <div className="mb-8"><MaxLogo size={32} /></div>
    <div className="flex h-14 w-14 items-center justify-center border border-glass-border bg-base-raised text-ink-muted"><Compass className="h-6 w-6" /></div>
    <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight text-ink">404</h1>
    <p className="mt-2 max-w-sm text-sm text-ink-muted">This page doesn&apos;t exist in the MAX AI Ecosystem. Let&apos;s get you back on track.</p>
    <Link href="/" className="mt-8"><Button>Back to home</Button></Link>
  </main>;
}