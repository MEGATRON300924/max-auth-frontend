import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AlertProps {
  variant?: "success" | "warning" | "danger" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const config = {
  success: { icon: CheckCircle2, classes: "bg-success-subtle border-success/20 text-success" },
  warning: { icon: AlertTriangle, classes: "bg-warning-subtle border-warning/20 text-warning" },
  danger: { icon: XCircle, classes: "bg-danger-subtle border-danger/20 text-danger" },
  info: { icon: Info, classes: "bg-info-subtle border-info/20 text-info" },
};

export function Alert({ variant = "info", title, children, className }: AlertProps) {
  const { icon: Icon, classes } = config[variant];
  return (
    <div role="alert" className={cn("flex gap-3 rounded-xl border p-4 text-sm", classes, className)}>
      <Icon className="h-4.5 w-4.5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-ink">
        {title && <p className="font-medium">{title}</p>}
        <div className={cn("text-ink-muted", title && "mt-0.5")}>{children}</div>
      </div>
    </div>
  );
}
