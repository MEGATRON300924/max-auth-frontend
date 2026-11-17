import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Fingerprint, KeyRound, ShieldCheck, Smartphone, WandSparkles, WalletCards, type LucideIcon } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { DeveloperIntegration } from "@/components/landing/DeveloperIntegration";

type Product = {
  name: string;
  description: string;
  logo?: string;
  Icon?: LucideIcon;
};

const products: Product[] = [
  { name: "MAX AI", description: "Your intelligent assistant and the brain of the ecosystem.", logo: "/ecosystem/max-ai.png" },
  { name: "MAX Cloud", description: "Files, data and sync across your devices.", logo: "/ecosystem/max-cloud.png" },
  { name: "MAX Home", description: "A single control layer for your connected home.", logo: "/ecosystem/max-home.png" },
  { name: "MAX Music", description: "Your music experience, connected to your account.", logo: "/ecosystem/max-music.png" },
  { name: "MAX Browser", description: "A private browser built around your MAX identity.", logo: "/ecosystem/max-browser.png" },
  { name: "MAX Studio", description: "Creative tools for building and making.", Icon: WandSparkles },
  { name: "MAX Security", description: "Account protection across the ecosystem.", Icon: ShieldCheck },
  { name: "MAX Pay", description: "A simpler way to manage ecosystem payments.", Icon: WalletCards },
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
        <section className="relative border-b border-glass-border/70 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-6xl">
  One account for
  <span className="block text-ink">
    Max AI
    <video
      src="/max-orb.webm"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      className="ml-2 inline-block h-8 w-8 align-middle sm:ml-3 sm:h-12 sm:w-12"
    />
    .
  </span>
</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-ink-muted sm:text-lg">
                MAX Auth is the secure identity behind The MAX AI Ecosystem. Sign in once, manage your security in one place, and move between MAX products without creating separate accounts, personalise Max AI With your Social Media Platforms And Do Many More.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/create-account"><Button size="lg">Create your MAX Account <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link href="/sign-in"><Button size="lg" variant="secondary">Sign in</Button></Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="relative border border-glass-border bg-base-raised p-5 sm:p-7">
                <div className="border-b border-glass-border pb-4">
                  <div><p className="text-xs font-semibold text-ink-faint">MAX Auth</p><p className="mt-1 text-sm font-bold">OAuth configuration</p></div>
                </div>
                <div className="my-5 border border-glass-border bg-base p-4 font-mono text-xs leading-7 text-ink-muted"><p><span className="text-ink-faint">01</span> <span className="text-ink">const</span> maxAuth = &#123;</p><p><span className="text-ink-faint">02</span> &nbsp;authorize: <span className="text-ink">&quot;auth.max-ai.name.ng/api/v1/oauth/authorize&quot;</span>,</p><p><span className="text-ink-faint">03</span> &nbsp;token: <span className="text-ink">&quot;auth.max-ai.name.ng/api/v1/oauth/token&quot;</span>,</p><p><span className="text-ink-faint">04</span> &nbsp;userInfo: <span className="text-ink">&quot;auth.max-ai.name.ng/api/v1/oauth/userinfo&quot;</span>,</p><p><span className="text-ink-faint">05</span> &nbsp;flow: <span className="text-ink">&quot;Authorization Code + PKCE&quot;</span>,</p><p><span className="text-ink-faint">06</span> &#125;;</p><p className="mt-3 border-t border-glass-border pt-3 text-ink">OAuth 2.0 · OpenID Connect · PKCE</p></div>
                <div className="flex items-center justify-between gap-4 border-t border-glass-border pt-5">
                  <p className="max-w-[15rem] text-xs leading-5 text-ink-muted">One identity for your MAX products and developer applications.</p>
                  <Link href="/create-account" className="shrink-0">
                    <Button size="sm">Get Started <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-ink-muted">The ecosystem</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Your identity follows you.</h2>
              <p className="mt-3 text-sm leading-6 text-ink-muted">One MAX Account connects the products you use without turning every screen into another sign-in flow.</p>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden border border-glass-border bg-base sm:grid-cols-2 lg:grid-cols-4">
              {products.map(({ name, description, logo, Icon }) => (
                <div key={name} className="group bg-base-raised p-6 transition-colors duration-150 hover:bg-glass-hover">
                  <div className="mb-8 flex h-12 w-12 items-center justify-center border border-glass-border bg-base p-1.5">
                    {logo ? (
                      <Image src={logo} alt={name + " logo"} width={40} height={40} className="h-full w-full object-contain" />
                    ) : Icon ? (
                      <Icon className="h-6 w-6 text-ink-muted" strokeWidth={1.65} aria-hidden="true" />
                    ) : null}
                  </div>
                  <h3 className="font-display text-sm font-bold">{name}</h3>
                  <p className="mt-2 text-xs leading-5 text-ink-muted">{description}</p>
                  <div className="mt-6 h-px w-8 bg-ink-faint transition-all group-hover:w-14" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="border-y border-glass-border bg-base-raised px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-ink-muted">Security</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">The account is the boundary.</h2>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-ink-muted text-ink-muted">Security</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Secured By The Tron Forge Limited.</h2>
              <p className="mt-4 text-sm leading-6 text-ink-muted">MAX Auth keeps identity, sessions and security controls together so every MAX product can focus on what it actually does.</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-md border border-glass-border bg-glass-border sm:grid-cols-2">
              {security.map(([Icon, title, desc]) => {
                const SecurityIcon = Icon as typeof ShieldCheck;
                return <div key={title as string} className="bg-base-raised p-6"><SecurityIcon className="h-5 w-5 text-ink-muted" /><h3 className="mt-5 text-sm font-bold">{title as string}</h3><p className="mt-2 text-xs leading-5 text-ink-muted">{desc as string}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section id="developers" className="border-t border-glass-border px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-ink-faint">For developers</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Add MAX Auth SDK to your website</h2>
              <p className="mt-4 text-sm leading-6 text-ink-muted">Choose your platform to get the right MAX Auth integration starter. Connect your application with the same identity layer used across The MAX AI Ecosystem.</p>
            </div>
            <DeveloperIntegration />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
