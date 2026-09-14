"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-xs font-semibold text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "h-10 w-full rounded-lg border bg-base-raised px-3.5 text-sm text-ink placeholder:text-ink-faint",
              "transition-colors duration-150",
              "border-glass-border hover:border-slate-300 dark:hover:border-slate-600",
              "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              isPassword && "pr-10",
              error && "border-danger focus:border-danger focus:ring-danger/15",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-ink-muted"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger">{error}</p>}
        {!error && hint && <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
