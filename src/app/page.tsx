import Link from "next/link";
import { ArrowRight, Check, Fingerprint, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MaxIdentityGraphic } from "@/components/illustrations/MaxIdentityGraphic";
import { ProductMark } from "@/components/illustrations/ProductMark";

const products = [
  ["MAX AI", "Your intelligent assistant and the brain of the ecosystem."],
  ["MAX Cloud", "Files, data and sync across your devices."],
  ["MAX Home", "A single control layer for your connected home."],
  ["MAX Music", "Your music experience, connected to your account."],
  ["MAX Browser", "A private browser built around your MAX identity."],
  ["MAX Studio", "Creative tools for building and making."],
  ["MAX Security", "Account protection across the ecosystem."],
  ["MAX Pay", "A simpler way to manage ecosystem payments."],
];

const security = [
  [KeyRound, "Protected credentials", "Passwords are protected with memory-hard hashing and never exposed to applications."],
  [Smartphone, "Device control", "Review active devices and sessions and revoke access when you need to."],
  [Fingerprint, "Passkey ready", "The identity layer is designed for modern passwordless authentication."],
  [ShieldCheck, "One security boundary", "Secure the account once instead of repeating security settings in every MAX product."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-base text-ink">
      <SiteHeader />

      <main>
        <section className="relative border-b border-glass-border px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <div className="max-w-2xl">
              <Badge variant="info" className="mb-6"><ShieldCheck className="h-3.5 w-3.5" /> MAX identity platform</Badge>
              <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-6xl">
                One account for
                <span className="block text-brand-600 dark:text-brand-400">everything MAX.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-ink-muted sm:text-lg">
                MAX Auth is the secure identity behind The MAX AI Ecosystem. Sign in once, manage your security in one place, and move between MAX products without creating separate accounts.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/create-account"><Button size="lg">Create your MAX Account <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link href="/sign-in"><Button size="lg" variant="secondary">Sign in</Button></Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink-faint">
                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success" /> One account</span>
                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success" /> Secure sessions</span>
                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success" /> Developer ready</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="absolute inset-12 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-glass-border bg-base-raised p-4 shadow-[0_24px_80px_-35px_rgba(37,99,235,.35)] sm:p-7">
                <div className="flex items-center justify-between border-b border-glass-border pb-4">
                  <div><p className="text-xs font-semibold text-ink-faint">MAX AUTH</p><p className="mt-1 text-sm font-bold">Identity overview</p></div>
                  <span className="flex items-center gap-2 text-xs font-semibold text-success"><span className="h-2 w-2 rounded-full bg-success" /> Protected</span>
                </div>
                <MaxIdentityGraphic className="my-4 h-auto w-full text-ink" />
                <div className="grid grid-cols-3 gap-2 border-t border-glass-border pt-4">
                  <div><p className="text-[10px] uppercase tracking-wider text-ink-faint">Devices</p><p className="mt-1 text-lg font-bold">04</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-ink-faint">Sessions</p><p className="mt-1 text-lg font-bold">02</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-ink-faint">2FA</p><p className="mt-1 text-lg font-bold">Ready</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600 dark:text-brand-400">The ecosystem</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Your identity follows you.</h2>
              <p className="mt-3 text-sm leading-6 text-ink-muted">One MAX Account connects the products you use without turning every screen into another sign-in flow.</p>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-glass-border bg-glass-border sm:grid-cols-2 lg:grid-cols-4">
              {products.map(([name, desc]) => (
                <div key={name} className="group bg-base-raised p-6 transition-colors hover:bg-glass-hover">
                  <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-glass-border bg-base text-brand-600 dark:text-brand-400">
                    <ProductMark name={name} className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-sm font-bold">{name}</h3>
                  <p className="mt-2 text-xs leading-5 text-ink-muted">{desc}</p>
                  <div className="mt-6 h-px w-8 bg-brand-500 transition-all group-hover:w-14" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="border-y border-glass-border bg-base-raised px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600 dark:text-brand-400">Security</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">The account is the boundary.</h2>
              <p className="mt-4 text-sm leading-6 text-ink-muted">MAX Auth keeps identity, sessions and security controls together so every MAX product can focus on what it actually does.</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-glass-border bg-glass-border sm:grid-cols-2">
              {security.map(([Icon, title, desc]) => {
                const SecurityIcon = Icon as typeof ShieldCheck;
                return <div key={title as string} className="bg-base-raised p-6"><SecurityIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" /><h3 className="mt-5 text-sm font-bold">{title as string}</h3><p className="mt-2 text-xs leading-5 text-ink-muted">{desc as string}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section id="developers" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-glass-border bg-slate-950 p-8 text-white sm:p-12 dark:bg-black">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">For developers</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Continue with MAX AI.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">OAuth and PKCE make it possible for third-party applications to use the same MAX identity layer without receiving your password.</p>
              <Button variant="secondary" size="lg" disabled className="mt-7 border-white/15 bg-white/5 text-white hover:bg-white/10">Developer portal — coming soon</Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
