"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Home, Users, Radio, CreditCard, RefreshCw, Wifi, WifiOff, Smartphone, Monitor, Tv, Speaker, House, DoorOpen } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/useAuth";
import { maxHomeApi, type MaxHome, type MaxHomeDevice, type MaxHomeMember, type MaxHomeRoom } from "@/lib/api/maxHome";

const HOME_APP_URL = "https://home.max-ai.name.ng";

type HomeOverview = {
  home: MaxHome;
  members: MaxHomeMember[];
  rooms: MaxHomeRoom[];
  devices: MaxHomeDevice[];
};

function roleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function deviceIcon(type: string) {
  const value = type.toLowerCase();
  if (value.includes("tv")) return Tv;
  if (value.includes("speaker") || value.includes("voice")) return Speaker;
  if (value.includes("phone") || value.includes("mobile")) return Smartphone;
  if (value.includes("computer") || value.includes("display")) return Monitor;
  return Radio;
}

function deviceStatus(device: MaxHomeDevice) {
  const status = (device.connection_state || device.status || "unknown").toLowerCase();
  if (status === "online" || status === "connected") return { label: "Online", online: true };
  if (status === "offline" || status === "disconnected") return { label: "Offline", online: false };
  if (status === "pending") return { label: "Pending", online: false };
  return { label: "Status unknown", online: false };
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [overview, setOverview] = useState<HomeOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { homes } = await maxHomeApi.getHomes();
      const details = await Promise.all(homes.map(async (home) => {
        const [memberResult, roomResult, deviceResult] = await Promise.all([
          maxHomeApi.getMembers(home.id),
          maxHomeApi.getRooms(home.id),
          maxHomeApi.getDevices(home.id),
        ]);
        return { home, members: memberResult.members, rooms: roomResult.rooms, devices: deviceResult.devices };
      }));
      setOverview(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : "MAX Home data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) void loadHomeData();
    if (!authLoading && !user) setLoading(false);
  }, [authLoading, user, loadHomeData]);

  const totalMembers = overview.reduce((sum, item) => sum + item.members.length, 0);
  const totalDevices = overview.reduce((sum, item) => sum + item.devices.length, 0);
  const totalRooms = overview.reduce((sum, item) => sum + item.rooms.length, 0);

  return (
    <div>
      <PageHeader title="MAX Home" description="Your homes, family members and connected devices—all linked to your MAX Account." />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent><div className="flex items-center gap-3"><span className="rounded-xl bg-brand-500/10 p-2.5 text-brand-300"><House className="h-5 w-5" /></span><div><p className="text-xs text-ink-faint">Homes</p><p className="mt-1 text-xl font-semibold text-ink">{loading ? "—" : overview.length}</p></div></div></CardContent></Card>
        <Card><CardContent><div className="flex items-center gap-3"><span className="rounded-xl bg-brand-500/10 p-2.5 text-brand-300"><Users className="h-5 w-5" /></span><div><p className="text-xs text-ink-faint">Family members</p><p className="mt-1 text-xl font-semibold text-ink">{loading ? "—" : totalMembers}</p></div></div></CardContent></Card>
        <Card><CardContent><div className="flex items-center gap-3"><span className="rounded-xl bg-brand-500/10 p-2.5 text-brand-300"><DoorOpen className="h-5 w-5" /></span><div><p className="text-xs text-ink-faint">Rooms</p><p className="mt-1 text-xl font-semibold text-ink">{loading ? "—" : totalRooms}</p></div></div></CardContent></Card>
        <Card><CardContent><div className="flex items-center gap-3"><span className="rounded-xl bg-brand-500/10 p-2.5 text-brand-300"><Radio className="h-5 w-5" /></span><div><p className="text-xs text-ink-faint">Connected devices</p><p className="mt-1 text-xl font-semibold text-ink">{loading ? "—" : totalDevices}</p></div></div></CardContent></Card>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-base font-semibold text-ink">Your homes</h2><p className="mt-1 text-xs text-ink-faint">Live information from MAX Home.</p></div>
        <button type="button" onClick={() => void loadHomeData()} disabled={loading || authLoading} className="inline-flex items-center gap-2 rounded-xl border border-glass-border px-3 py-2 text-xs font-medium text-ink-muted transition hover:bg-white/5 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>

      {error && <Card className="mb-4 border-red-500/30"><CardContent><p className="text-sm font-medium text-ink">Could not connect to MAX Home</p><p className="mt-1 text-xs leading-5 text-ink-faint">{error}</p><button type="button" onClick={() => void loadHomeData()} className="mt-3 text-xs font-semibold text-brand-300 hover:underline">Try again</button></CardContent></Card>}

      {loading ? (
        <Card className="mb-5"><CardContent><p className="text-sm text-ink-muted">Loading your MAX Home information…</p></CardContent></Card>
      ) : !error && overview.length === 0 ? (
        <Card className="mb-5"><CardContent><div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="rounded-xl bg-brand-500/10 p-3 text-brand-300"><Home className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold text-ink">No home connected yet</h3><p className="mt-1 max-w-xl text-xs leading-5 text-ink-faint">Create or join a home in MAX Home. Once you do, its name, family members and registered devices will appear here automatically.</p></div></div><a href={HOME_APP_URL} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-400">Open MAX Home <ArrowUpRight className="h-3.5 w-3.5" /></a></div></CardContent></Card>
      ) : (
        <div className="mb-5 space-y-4">
          {overview.map(({ home, members, rooms, devices }) => (
            <Card key={home.id}>
              <CardContent>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-glass-border pb-4">
                  <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300"><Home className="h-5 w-5" /></span><div><h3 className="text-base font-semibold text-ink">{home.name}</h3><p className="mt-1 text-xs text-ink-faint">{[home.address_line1, home.address_line2, home.city, home.state_region, home.country].filter(Boolean).join(", ") || home.timezone || "MAX Home"}</p></div></div>
                  <Badge variant="neutral">{roleLabel(home.role)} · {members.length} {members.length === 1 ? "member" : "members"}</Badge>
                </div>

                <div className="grid gap-5 pt-4 md:grid-cols-2">
                  <section>
                    <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><Users className="h-4 w-4 text-ink-faint" /> Family members</h4><span className="text-xs text-ink-faint">{members.length}</span></div>
                    {members.length ? <div className="space-y-2">{members.map((member) => { const isCurrentUser = member.user_id === user?.id; const memberName = member.profile?.displayName || (isCurrentUser ? (user?.displayName || user?.username || "You") : "MAX Home member"); const memberHandle = member.profile?.username ? `@${member.profile.username}` : (isCurrentUser ? user?.email : ""); return <div key={member.user_id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5"><div className="flex min-w-0 items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500/10 text-[10px] font-semibold text-brand-300" style={member.profile?.avatarUrl ? { backgroundImage: `url("${member.profile.avatarUrl}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{member.profile?.avatarUrl ? null : memberName.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-medium text-ink">{memberName}{isCurrentUser ? " (you)" : ""}</p><p className="mt-0.5 truncate text-[11px] text-ink-faint">{memberHandle}</p></div></div><Badge variant="neutral">{roleLabel(member.role)}</Badge></div>; })}</div> : <p className="text-xs text-ink-faint">No family members have been returned for this home.</p>}
                  </section>
                  <section>
                    <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><Radio className="h-4 w-4 text-ink-faint" /> Connected devices</h4><span className="text-xs text-ink-faint">{devices.length}</span></div>
                    {devices.length ? <div className="space-y-2">{devices.map((device) => { const Icon = deviceIcon(device.device_type || "device"); const status = deviceStatus(device); return <div key={device.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5"><div className="flex min-w-0 items-center gap-2.5"><Icon className="h-4 w-4 shrink-0 text-ink-faint" /><div className="min-w-0"><p className="truncate text-xs font-medium text-ink">{device.name}</p><p className="mt-0.5 truncate text-[11px] text-ink-faint">{[device.manufacturer, device.model, device.device_type].filter(Boolean).join(" · ")}</p></div></div><span className="flex shrink-0 items-center gap-1.5 text-[11px] text-ink-faint">{status.online ? <Wifi className="h-3.5 w-3.5 text-emerald-400" /> : <WifiOff className="h-3.5 w-3.5" />}{status.label}</span></div>; })}</div> : <p className="text-xs text-ink-faint">No devices have been registered to this home yet.</p>}
                  </section>
                </div>
                <section className="mt-5 border-t border-glass-border pt-4">
                  <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-semibold text-ink"><DoorOpen className="h-4 w-4 text-ink-faint" /> Rooms</h4><span className="text-xs text-ink-faint">{rooms.length}</span></div>
                  {rooms.length ? <div className="flex flex-wrap gap-2">{rooms.map((room) => { const roomDevices = devices.filter((device) => device.room_id === room.id).length; return <div key={room.id} className="rounded-xl bg-white/[0.03] px-3 py-2"><p className="text-xs font-medium text-ink">{room.name}</p><p className="mt-0.5 text-[11px] text-ink-faint">{[room.room_type, `${roomDevices} ${roomDevices === 1 ? "device" : "devices"}`].filter(Boolean).join(" · ")}</p></div>; })}</div> : <p className="text-xs text-ink-faint">No rooms have been added to this home yet.</p>}
                </section>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent>
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-brand-500/10 p-2.5 text-brand-300"><CreditCard className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold text-ink">Subscription sharing</h2><Badge variant="neutral">Not available yet</Badge></div>
              <p className="mt-1 text-xs leading-5 text-ink-faint">Your MAX Account plan is <span className="font-semibold text-ink">{user?.subscriptionTier || "—"}</span>. Family membership in MAX Home does not currently share or change subscription benefits. Subscription-sharing controls will appear here when the MAX subscription service supports family sharing.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
