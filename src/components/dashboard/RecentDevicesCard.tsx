import Link from "next/link";
import { Laptop, Smartphone, Tablet, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { Device } from "@/types/api";

const typeIcons: Record<string, typeof Laptop> = { mobile: Smartphone, tablet: Tablet, desktop: Laptop };

export function RecentDevicesCard({ devices }: { devices: Device[] }) {
  const recent = devices.slice(0, 4);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent devices</CardTitle>
        <Link href="/devices" className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300">
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <EmptyState title="No devices yet" description="Devices you sign in from will show up here." />
        ) : (
          <ul className="space-y-3">
            {recent.map((d) => {
              const Icon = typeIcons[d.deviceType ?? ""] ?? Laptop;
              return (
                <li key={d.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-ink-muted">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{d.deviceName || "Unknown device"}</p>
                    <p className="text-xs text-ink-faint">{formatRelativeTime(d.lastSeenAt)}</p>
                  </div>
                  {d.isTrusted && <span className="text-xs font-medium text-success">Trusted</span>}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
