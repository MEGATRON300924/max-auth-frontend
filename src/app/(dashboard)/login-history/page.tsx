"use client";

import { CheckCircle2, XCircle, History } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { devicesApi } from "@/lib/api/devices";
import { formatDateTime } from "@/lib/utils/formatters";

export default function LoginHistoryPage() {
  const { data: history, isLoading } = useAsyncData(() =>
    devicesApi.loginHistory().then((r) => r.history)
  );

  return (
    <div>
      <PageHeader title="Login History" description="A record of every sign-in attempt on your account." />

      {isLoading ? (
        <SkeletonCard />
      ) : !history || history.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={<History className="h-5 w-5" />} title="No login history yet" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-glass-border">
              {history.map((entry) => (
                <li key={entry.id} className="flex items-center gap-4 p-4">
                  {entry.success ? (
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 shrink-0 text-danger" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      {entry.success ? "Successful sign-in" : "Failed sign-in attempt"}
                      {entry.reason && !entry.success && (
                        <span className="ml-2 text-xs font-normal text-ink-faint">
                          ({entry.reason.replace(/_/g, " ")})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {entry.ipAddress ?? "Unknown IP"} · {entry.userAgent ?? "Unknown device"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-faint">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
