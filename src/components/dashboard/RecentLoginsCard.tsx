import Link from "next/link";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { LoginHistoryEntry } from "@/types/api";

export function RecentLoginsCard({ history }: { history: LoginHistoryEntry[] }) {
  const recent = history.slice(0, 4);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent logins</CardTitle>
        <Link href="/login-history" className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300">
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <EmptyState title="No login activity yet" />
        ) : (
          <ul className="space-y-3">
            {recent.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3">
                {entry.success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <XCircle className="h-4 w-4 shrink-0 text-danger" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{entry.success ? "Successful sign-in" : "Failed sign-in attempt"}</p>
                  <p className="text-xs text-ink-faint">{entry.ipAddress ?? "Unknown IP"} · {formatRelativeTime(entry.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
