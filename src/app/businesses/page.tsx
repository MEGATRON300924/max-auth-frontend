import Link from "next/link";
import { ArrowRight, Building2, LockKeyhole, Users, Blocks, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";

const benefits = [
  { icon: Building2, title: "One business identity", description: "Give your company a stable MAX business ID that stays the same when its display name changes." },
  { icon: Users, title: "People and permissions", description: "Connect a business to personal MAX accounts and build toward clear team roles and access controls." },
  { icon: Blocks, title: "Connect MAX products", description: "Use the same business identity as the foundation for compatible MAX services, including MAX Hotels." },
  { icon: LockKeyhole, title: "A shared security foundation", description: "Keep business identity separate from personal sign-in and apply access rules at the API." },
];

export default function BusinessesPage() {
  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <main>
        <section className="aurora-canvas border-b border-glass-border/70 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                <Building2 className="h-4 w-4" /> MAX AUTH FOR BUSINESSES
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                Your business identity, <span className="text-brand-600 dark:text-brand-400">connected to MAX.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
                Create a business identity for your organization and lay the foundation for managing business access across compatible MAX products.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/businesses/register"><Button size="lg">Create a business account <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link href="/sign-in" className="inline-flex items-center justify-center rounded-xl border border-glass-border bg-base-raised px-5 py-3 text-sm font-semibold text-ink transition hover:bg-glass-hover">Sign in with MAX</Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-ink-faint">A business account is linked to a person’s MAX account. It does not replace personal sign-in or automatically activate every MAX product.</p>
            </div>
          </div>
        </section>
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600 dark:text-brand-400">One foundation</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Built for the way organizations work.</h2>
              <p className="mt-4 text-sm leading-6 text-ink-muted">Business identity is the starting point. You can invite team members and manage their roles; business verification and product-specific access are separate steps.</p>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-2xl border border-glass-border bg-base-raised p-6 shadow-sm">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-glass-border bg-base text-brand-600 dark:text-brand-400"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-display text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-glass-border bg-base-raised p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                <div><h3 className="font-semibold">Start with your business profile</h3><p className="mt-1 text-sm text-ink-muted">The first release creates a persistent identity and records the creator as its owner.</p></div>
              </div>
              <Link href="/businesses/register" className="shrink-0"><Button>Create business <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
