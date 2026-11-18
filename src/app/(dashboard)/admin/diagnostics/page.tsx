"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, ArrowUpRight, Clock3,
  LoaderCircle, RefreshCw, Server, XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type WindowKey = "1h" | "24h" | "7d";
type ServiceMetrics = {
  service: string;
  totalRequests: number;
  errorRequests: number;
  errorRate: number;
  averageLatencyMs: number;
  topEndpoints: { path: string; requests: number }[];
};
type DiagnosticEvent = {
  id: string;
  service: "MAX_AUTH" | "MAX_BACKEND";
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  createdAt: string;
};
type Summary = {
  window: WindowKey;
  since: string;
  overall: Omit<ServiceMetrics, "service">;
  services: ServiceMetrics[];
  recent: DiagnosticEvent[];
};
type Health = {
  status: "healthy" | "degraded" | "down" | "unknown";
  checkedAt: string;
  services: { service: string; status: "healthy" | "down" | "unknown"; latencyMs: number }[];
};

function healthVariant(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "healthy") return "success";
  if (status === "degraded") return "warning";
  if (status === "down") return "danger";
  return "neutral";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function eventVariant(status: number): "success" | "warning" | "danger" {
  if (status >= 500) return "danger";
  if (status >= 400) return "warning";
  return "success";
}

export default function DiagnosticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [windowKey, setWindowKey] = useState<WindowKey>("24h");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) router.replace("/dashboard");
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    if (!user?.isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [summaryResult, healthResult] = await Promise.all([
        apiClient.get<Summary>(`/admin/diagnostics/summary?window=${windowKey}`),
        apiClient.get<Health>("/admin/diagnostics/health"),
      ]);
      setSummary(summaryResult);
      setHealth(healthResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load diagnostics.");
    } finally {
      setLoading(false);
    }
  }, [user?.isAdmin, windowKey]);

  useEffect(() => { void loadData(); }, [loadData]);

  if (authLoading || !user?.isAdmin) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Checking administrator access…</div>;
  }

  const overall = summary?.overall;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <button onClick={() => router.push("/admin")} className="mb-4 inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-ink">
            <ArrowUpRight className="h-4 w-4 rotate-[225deg]" /> Admin console
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300"><Activity className="h-6 w-6" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">Operations</p>
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">MAX Diagnostics</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">Live service probes and request telemetry for the MAX platform. Health checks are separate from manually published service status.</p>
        </div>
        <div className="flex items-center gap-2">
          <select aria-label="Telemetry time window" value={windowKey} onChange={(event) => setWindowKey(event.target.value as WindowKey)} className="h-10 rounded-md border border-glass-border bg-base-raised px-3 text-sm text-ink outline-none focus:border-brand-500">
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
          <Button variant="secondary" onClick={() => void loadData()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </div>
      </div>

      {error && <div role="alert" className="flex items-start gap-3 border border-danger/20 bg-danger-subtle p-4 text-sm text-danger"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Diagnostics unavailable</p><p className="mt-1">{error}</p></div></div>}

      <Card>
        <CardHeader>
          <div><CardTitle>Live service health</CardTitle><p className="mt-1 text-xs text-ink-muted">Readiness probes checked directly from MAX Auth.</p></div>
          {health && <Badge variant={healthVariant(health.status)}>{health.status.toUpperCase()}</Badge>}
        </CardHeader>
        <CardContent>
          {health ? <div className="grid gap-3 sm:grid-cols-2">
            {health.services.map((service) => <div key={service.service} className="flex items-center justify-between gap-4 border border-glass-border bg-base px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-glass text-ink-muted"><Server className="h-4 w-4" /></span>
                <div className="min-w-0"><p className="text-sm font-semibold text-ink">{service.service}</p><p className="mt-0.5 text-xs text-ink-muted">{service.latencyMs} ms probe time</p></div>
              </div>
              <Badge variant={healthVariant(service.status)}>{service.status}</Badge>
            </div>)}
          </div> : <p className="text-sm text-ink-muted">{loading ? "Checking service health…" : "No health data available."}</p>}
          {health && <p className="mt-3 text-[11px] text-ink-faint">Last checked {formatTime(health.checkedAt)}</p>}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Requests", value: overall?.totalRequests, icon: Activity },
          { label: "Failed requests", value: overall?.errorRequests, icon: AlertTriangle },
          { label: "Error rate", value: overall ? `${overall.errorRate}%` : undefined, icon: XCircle },
          { label: "Average latency", value: overall ? `${overall.averageLatencyMs} ms` : undefined, icon: Clock3 },
        ].map((item) => <Card key={item.label}><CardContent className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-glass text-ink-muted"><item.icon className="h-5 w-5" /></span>
          <div><p className="text-xs text-ink-muted">{item.label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{item.value ?? (loading ? "…" : "—")}</p></div>
        </CardContent></Card>)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {summary?.services.map((service) => <Card key={service.service}>
          <CardHeader><div><CardTitle>{service.service}</CardTitle><p className="mt-1 text-xs text-ink-muted">Request performance · {windowKey}</p></div><Badge variant={service.errorRate > 5 ? "danger" : service.errorRate > 0 ? "warning" : "success"}>{service.errorRate}% errors</Badge></CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <div><p className="text-xs text-ink-muted">Requests</p><p className="mt-1 text-xl font-semibold tabular-nums text-ink">{service.totalRequests}</p></div>
            <div><p className="text-xs text-ink-muted">Failures</p><p className="mt-1 text-xl font-semibold tabular-nums text-ink">{service.errorRequests}</p></div>
            <div><p className="text-xs text-ink-muted">Avg. latency</p><p className="mt-1 text-xl font-semibold tabular-nums text-ink">{service.averageLatencyMs} ms</p></div>
          </CardContent>
        </Card>)}
      </div>

      <Card>
        <CardHeader><div><CardTitle>Recent request activity</CardTitle><p className="mt-1 text-xs text-ink-muted">Sanitised request metadata only. No user content, tokens or raw exception messages.</p></div><Badge variant="neutral">{summary?.recent.length ?? 0} events</Badge></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-base/70 text-[11px] uppercase tracking-wide text-ink-muted"><tr>
              <th className="px-5 py-3 font-medium">Service</th><th className="px-5 py-3 font-medium">Request</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Duration</th><th className="px-5 py-3 font-medium">Time</th>
            </tr></thead>
            <tbody className="divide-y divide-glass-border">
              {summary?.recent.map((event) => <tr key={event.id}>
                <td className="px-5 py-3 text-xs font-semibold text-ink">{event.service === "MAX_BACKEND" ? "MAX Backend" : "MAX Auth"}</td>
                <td className="px-5 py-3"><p className="font-mono text-xs text-ink">{event.method} <span className="text-ink-muted">{event.path}</span></p></td>
                <td className="px-5 py-3"><Badge variant={eventVariant(event.statusCode)}>{event.statusCode}</Badge></td>
                <td className="px-5 py-3 tabular-nums text-ink-muted">{event.durationMs} ms</td>
                <td className="px-5 py-3 whitespace-nowrap text-xs text-ink-muted">{formatTime(event.createdAt)}</td>
              </tr>)}
            </tbody>
          </table>
          {(!summary || summary.recent.length === 0) && <div className="px-5 py-12 text-center text-sm text-ink-muted">{loading ? "Loading request activity…" : "No request events in this time window."}</div>}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-glass-border bg-base-raised px-5 py-4">
        <div><p className="text-sm font-semibold text-ink">Beta tester issue reports</p><p className="mt-1 text-xs text-ink-muted">Review user-submitted reports in the existing admin queue.</p></div>
        <Button variant="secondary" onClick={() => router.push("/admin/beta")}>Open issue reports <ArrowUpRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
