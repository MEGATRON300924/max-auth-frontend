import Link from "next/link";
import { ShieldCheck, KeyRound, Smartphone, Fingerprint, Globe, Sparkles, ArrowRight, Lock } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const products = [
  { name: "MAX AI", desc: "Conversational intelligence, everywhere you work." },
  { name: "MAX Cloud", desc: "Storage and sync across every device." },
  { name: "MAX Home", desc: "One control center for a smarter home." },
  { name: "MAX Music", desc: "Your library, tuned to how you listen." },
  { name: "MAX Browser", desc: "Fast, private, built around you." },
  { name: "MAX Studio", desc: "Creative tools for makers and teams." },
  { name: "MAX Security", desc: "Protection that watches your whole account." },
  { name: "MAX Pay", desc: "Payments, simplified across the ecosystem." },
];

const securityFeatures = [
  { icon: Lock, title: "Argon2id password hashing", desc: "Your password is never stored in plain text — only a memory-hard, industry-standard hash." },
  { icon: KeyRound, title: "Rotating session tokens", desc: "Every session refresh issues a brand-new token pair, so a stolen token has a short shelf life." },
  { icon: Smartphone, title: "Full device visibility", desc: "See every device signed in to your account, and revoke any of them in one tap." },
  { icon: Fingerprint, title: "Built for passkeys & 2FA", desc: "The architecture is ready for passwordless sign-in as soon as you want to turn it on." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />

      <section className="relative px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <AuroraBackground />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-glass-border bg-glass px-4 py-1.5 text-xs font-medium text-ink-muted backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            One identity for the entire MAX AI Ecosystem
          </div>
          <h1 className="animate-fade-up font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl" style={{ animationDelay: "80ms" }}>
            Sign in once.
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-aurora-violet to-aurora-magenta bg-clip-text text-transparent">Unlock everything.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-fade-up text-base text-ink-muted sm:text-lg" style={{ animationDelay: "160ms" }}>
            Your MAX Account is the single, secure identity behind MAX AI, MAX Cloud, MAX Home, MAX Music, and every other product in the ecosystem — built from the ground up, not bolted on.
          </p>
          <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
            <Link href="/create-account" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Create your MAX Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">Sign in</Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="products" className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Every product. One account.</h2>
            <p className="mt-3 text-ink-muted">Register once with MAX Auth, and you&apos;re signed in everywhere across the ecosystem.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <Card key={p.name} hover className="p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-aurora-magenta/20 text-brand-300">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-display text-sm font-semibold text-ink">{p.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="info" className="mb-4"><ShieldCheck className="h-3.5 w-3.5" /> Security-first</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Built to protect one account that matters a lot.</h2>
            <p className="mt-3 text-ink-muted">Because your MAX Account unlocks everything, we built the identity layer to a higher standard than any single app would need on its own.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {securityFeatures.map((f) => (
              <Card key={f.title} className="flex gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="developers" className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Card className="relative overflow-hidden p-8 sm:p-12">
            <AuroraBackground variant="subtle" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge variant="neutral" className="mb-4"><Globe className="h-3.5 w-3.5" /> Coming to third-party apps</Badge>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">&ldquo;Continue with MAX AI&rdquo;</h2>
                <p className="mt-3 max-w-md text-sm text-ink-muted">We&apos;re building the same one-click identity that powers the MAX ecosystem into an OAuth layer any developer will be able to add to their own app.</p>
              </div>
              <Button variant="secondary" size="lg" disabled className="shrink-0">Developer portal — coming soon</Button>
            </div>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
