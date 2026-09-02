"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AuthFeatureShell({ title, description, eyebrow = "MAX Account", children }: { title: string; description: string; eyebrow?: string; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-glass backdrop-blur-2xl sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300"><Sparkles className="h-3.5 w-3.5" /> {eyebrow}</div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 sm:block"><ShieldCheck className="h-5 w-5 text-brand-300" /></div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl ${className}`}>{children}</div>;
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "warning" | "neutral" }) {
  const classes = tone === "success" ? "border-success/20 bg-success/10 text-success" : tone === "warning" ? "border-warning/20 bg-warning/10 text-warning" : "border-white/10 bg-white/5 text-ink-muted";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}>{children}</span>;
}

export function FeatureRow({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 border-b border-white/5 py-4 last:border-0">
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-brand-300">{icon}</div>
    <div className="min-w-0 flex-1"><p className="font-medium text-ink">{title}</p><p className="mt-0.5 text-sm text-ink-muted">{description}</p></div>
    {action}
  </motion.div>;
}
