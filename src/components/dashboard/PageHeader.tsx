import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-glass-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
