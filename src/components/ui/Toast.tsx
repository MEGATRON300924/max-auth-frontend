"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import type { ToastVariant } from "@/lib/hooks/ToastContext";
import { cn } from "@/lib/utils/cn";

const icons: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const colors: Record<ToastVariant, string> = {
  success: "text-success",
  warning: "text-warning",
  error: "text-danger",
  info: "text-info",
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="assertive"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-glass-border bg-base-overlay/95 p-4 shadow-glass backdrop-blur-xl"
              role="status"
            >
              <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", colors[toast.variant])} aria-hidden="true" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-ink">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-ink-muted">{toast.description}</p>}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-ink-faint hover:text-ink transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
