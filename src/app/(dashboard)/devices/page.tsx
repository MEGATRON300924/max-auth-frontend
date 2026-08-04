"use client";

import { Laptop, Smartphone, Tablet, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { devicesApi } from "@/lib/api/devices";
import { ApiError } from "@/lib/api/ApiError";
import { formatRelativeTime } from "@/lib/utils/formatters";

const typeIcons: Record<string, typeof Laptop> = { mobile: Smartphone, tablet: Tablet, desktop: Laptop };

export default function DevicesPage() {
  const { data: devices, isLoading, refetch } = useAsyncData(() =>
    devicesApi.list().then((r) => r.devices)
  );
  const { showToast } = useToast();

  const handleTrust = async (id: string) => {
    try {
      await devicesApi.trust(id);
      showToast({ title: "Device trusted", variant: "success" });
      refetch();
    } catch (err) {
      showToast({
        title: "Couldn't trust device",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await devicesApi.revoke(id);
      showToast({ title: "Device removed", variant: "success" });
      refetch();
    } catch (err) {
      showToast({
        title: "Couldn't remove device",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  };

  return (
    <div>
      <PageHeader title="Devices" description="Every device that has signed in to your MAX Account." />

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !devices || devices.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={<Laptop className="h-5 w-5" />} title="No devices found" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {devices.map((d) => {
            const Icon = typeIcons[d.deviceType ?? ""] ?? Laptop;
            return (
              <Card key={d.id}>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-ink-muted">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink">
                          {d.deviceName || "Unknown device"}
                        </p>
                        {d.isTrusted && <Badge variant="success">Trusted</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {d.lastIp ?? "Unknown IP"} · Last seen {formatRelativeTime(d.lastSeenAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!d.isTrusted && (
                      <Button variant="secondary" size="sm" onClick={() => handleTrust(d.id)}>
                        <ShieldCheck className="h-3.5 w-3.5" /> Trust
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleRevoke(d.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
