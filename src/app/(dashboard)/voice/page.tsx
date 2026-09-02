"use client";

import { Bluetooth, Cpu, House, Mic2, Radio, Wifi } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const integrations = [
  { icon: Bluetooth, title: "Bluetooth / BLE", description: "Used for nearby discovery, secure setup, and provisioning.", status: "Not yet configured" },
  { icon: Wifi, title: "Wi-Fi", description: "Primary connection for MAX Voice cloud and ecosystem services.", status: "Not yet configured" },
  { icon: Cpu, title: "MAX Device Backend", description: "Registers speakers, authenticates devices, and manages ownership.", status: "Not yet configured" },
  { icon: House, title: "MAX Home", description: "Links speakers to a home and assigns rooms and permissions.", status: "Not yet configured" },
  { icon: Radio, title: "Google Account", description: "Google authentication and account integration for supported MAX Voice/Home experiences.", status: "Not yet configured" },
];

export default function VoicePage() {
  return (
    <div>
      <PageHeader
        title="MAX Voice"
        description="Manage MAX Voice speakers connected to your MAX ecosystem."
      />

      <Card className="mb-5 overflow-hidden">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
            <Mic2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">MAX Voice device management</h2>
              <Badge variant="default">Not yet configured</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              No speaker data is displayed until the MAX device backend is connected. The MAX AI app will handle discovery and setup through BLE, then the backend will associate the physical speaker with your MAX Account and MAX Home.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {integrations.map(({ icon: Icon, title, description, status }) => (
          <Card key={title}>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-ink-muted">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-ink">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-ink-faint">{description}</p>
                  </div>
                </div>
                <Badge variant="default">{status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-5 text-xs text-ink-faint">
        Supported hardware uses one shared onboarding architecture: MAX Voice Mini, Pro, Ultra, and Ultimate. Device capabilities will be supplied by the real backend based on the registered hardware model.
      </p>
    </div>
  );
}
