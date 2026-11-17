import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn("max-logo-loader h-8 w-8", className)} aria-hidden="true">
      <span className="max-logo-loader__base" />
      <span className="max-logo-loader__shine" />
    </span>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-base px-6 text-ink" role="status" aria-live="polite">
      <Spinner className="h-[76px] w-[76px]" />
      <span className="mt-7 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-muted">MAX Auth</span>
      <span className="mt-2 text-xs text-ink-faint">Loading your workspace</span>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
