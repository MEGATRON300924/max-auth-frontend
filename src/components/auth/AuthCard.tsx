import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Card className="animate-fade-up shadow-glass">
      <CardContent className="p-7 sm:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </CardContent>
      {footer && (
        <div className="border-t border-glass-border px-7 py-5 text-center text-sm text-ink-muted sm:px-8">
          {footer}
        </div>
      )}
    </Card>
  );
}
