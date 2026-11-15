import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("max-sketch-spinner h-8 w-8 text-ink", className)} fill="none" aria-hidden="true">
      <path className="max-sketch-orbit" d="M24 3.5C35.2 3.5 44.5 12.6 44.5 23.8S35.4 44.5 24.1 44.5 3.5 35.3 3.5 24.1 12.7 3.5 24 3.5Z" />
      <path className="max-sketch-orbit max-sketch-orbit-secondary" d="M23.5 5.5C34.7 4.9 42.8 13.3 43 24.2S34.4 42.3 23.7 42.8 5.6 34.3 5.2 23.8 12.6 6.1 23.5 5.5Z" />
      <path className="max-sketch-mark" d="M11 30V17l7.2 9.1 7.1-9.1v13M27.8 30l5.6-13 5.7 13m-9.1-5.8h6.8" />
    </svg>
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
