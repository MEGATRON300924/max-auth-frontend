import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
interface CardProps extends HTMLAttributes<HTMLDivElement> { hover?: boolean; }
export function Card({ className, hover, children, ...props }: CardProps) {
  return <div className={cn("border border-glass-border bg-base-raised", hover && "transition-colors duration-150 hover:border-ink-faint", className)} {...props}>{children}</div>;
}
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between gap-4 border-b border-glass-border px-5 py-4", className)} {...props}>{children}</div>;
}
export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-sm font-semibold tracking-tight text-ink", className)} {...props}>{children}</h3>;
}
export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5", className)} {...props}>{children}</div>;
}