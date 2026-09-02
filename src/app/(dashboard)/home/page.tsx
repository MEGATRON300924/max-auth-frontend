"use client";

import { Home, LockKeyhole, Radio, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const areas = [
  { icon: Home, title: "MAX Home", description: "Your home, rooms, members, and smart-home relationships will appear here.", status: "Not yet configured" },
  { icon: Radio, title: "MAX Voice", description: "Speakers will be assigned to rooms after they are paired through the MAX AI app.", status: "Not yet configured" },
  { icon: ShieldCheck, title: "Device permissions", description: "Home and device permissions will be enforced by the MAX backend.", status: "Not yet configured" },
  { icon: LockKeyhole, title: "Google authentication", description: "Google account authentication for supported Home and Voice experiences will be available when configured by the backend.", status: "Not yet configured" },
];

export default function HomePage() {
  return (
    <div>
      <PageHeader title="MAX Home" description="Manage the homes and devices that belong to your MAX Account." />

      <Card className="mb-5">
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
              <Home className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink">Home services</h2>
                <Badge variant="default">Not yet configured</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-faint">
                Home data is intentionally empty until the MAX backend is connected. No homes, rooms, speakers, or members are being fabricated in the frontend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {areas.map(({ icon: Icon, title, description, status }) => (
          <Card key={title}>
            <CardContent>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-ink-muted">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-ink">{title}</h3>
                    <Badge variant="default">{status}</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-ink-faint">{description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
