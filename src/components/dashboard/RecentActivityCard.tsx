import Link from "next/link";
import { Activity, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { AuditLogEntry } from "@/types/api";

function humanizeAction(action: string): string {
  return action.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export function RecentActivityCard({ logs }: { logs: AuditLogEntry[] }) {
  const recent = logs.slice(0, 6);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <Link href="/security" className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300">
          Full audit log <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <EmptyState icon={<Activity className="h-5 w-5" />} title="No activity recorded yet" />
        ) : (
          <ul className="space-y-3">
            {recent.map((log) => (
              <li key={log.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{humanizeAction(log.action)}</p>
                  <p className="text-xs text-ink-faint">{formatRelativeTime(log.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
