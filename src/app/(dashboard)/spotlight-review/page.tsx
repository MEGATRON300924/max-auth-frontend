"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, RefreshCw, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/tokenStore";

type Contribution = {
  id: string;
  entityId: string | null;
  contributorId: string;
  contributionType: string;
  payload: Record<string, unknown>;
  status: string;
  createdAt: string;
};
const API_URL = (process.env.NEXT_PUBLIC_SPOTLIGHT_API_URL || "https://max-spotlight-graph-api.onrender.com/api/v1").replace(/\\/$/, "");

function display(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(String).join(", ");
  return "";
}

export default function SpotlightReviewPage() {
  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const permission = await apiClient.get<{ permissions?: { spotlightEntities?: { canReview?: boolean } } }>("/profile/permissions");
      if (permission.permissions?.spotlightEntities?.canReview !== true) {
        setError("Your MAX Account does not have Spotlight review access.");
        setItems([]);
        return;
      }
      const token = tokenStore.get();
      if (!token) throw new Error("Your MAX Account session is not ready. Refresh the page and try again.");
      const response = await fetch(API_URL + "/admin/contributions?status=PENDING", {
        headers: { Authorization: "Bearer " + token, Accept: "application/json" },
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "The review queue could not be loaded.");
      setItems(Array.isArray(body.contributions) ? body.contributions : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The review queue could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const review = async (item: Contribution, decision: "APPROVE" | "REJECT") => {
    const token = tokenStore.get();
    if (!token) { setError("Your MAX Account session has expired. Sign in again."); return; }
    setBusyId(item.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(API_URL + "/admin/contributions/" + encodeURIComponent(item.id) + "/review", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ decision, reason: reasonById[item.id] || "" }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "This submission could not be reviewed.");
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setNotice(decision === "APPROVE" ? "Submission approved and published." : "Submission rejected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review action failed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <PageHeader
        title="Spotlight review"
        description="Review suggested profiles before they appear in MAX Spotlight Graph."
        action={<Button variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw className="h-4 w-4" />Refresh queue</Button>}
      />

      {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-5 flex items-center gap-2 text-sm text-ink-muted">
        <Clock3 className="h-4 w-4" />
        {loading ? "Loading submissions…" : items.length + " pending " + (items.length === 1 ? "submission" : "submissions")}
      </div>

      {loading ? (
        <Card><CardContent><p className="py-5 text-sm text-ink-muted">Loading the editorial queue…</p></CardContent></Card>
      ) : items.length === 0 ? (
        <Card><CardContent><div className="py-10 text-center"><Check className="mx-auto h-7 w-7 text-ink-faint" /><h2 className="mt-3 text-base font-semibold text-ink">You’re all caught up</h2><p className="mt-1 text-sm text-ink-muted">New profile suggestions will appear here when submitted.</p></div></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const payload = item.payload || {};
            const title = display(payload.name) || display(payload.title) || "Untitled suggestion";
            const kind = display(payload.kind) || item.contributionType.replaceAll("_", " ").toLowerCase();
            const description = display(payload.description);
            const aliases = display(payload.aliases);
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="min-w-0">
                    <CardTitle>{title}</CardTitle>
                    <p className="mt-1 text-xs text-ink-muted">{kind} · Submitted {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Pending</span>
                </CardHeader>
                <CardContent>
                  {description && <p className="text-sm leading-6 text-ink-muted">{description}</p>}
                  {aliases && <p className="mt-3 text-xs text-ink-muted"><strong className="text-ink">Also known as:</strong> {aliases}</p>}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-semibold text-ink-muted">Submission details</summary>
                    <pre className="mt-2 max-h-52 overflow-auto rounded-xl bg-base-raised p-3 text-xs text-ink-muted">{JSON.stringify(payload, null, 2)}</pre>
                  </details>
                  <label className="mt-4 block text-xs font-medium text-ink-muted">
                    Review note (optional)
                    <textarea
                      value={reasonById[item.id] || ""}
                      onChange={(event) => setReasonById((current) => ({ ...current, [item.id]: event.target.value }))}
                      maxLength={1200}
                      rows={2}
                      placeholder="Add a reason or editorial note"
                      className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400"
                    />
                  </label>
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-glass-border pt-4">
                    <Button variant="danger" size="sm" disabled={Boolean(busyId)} onClick={() => void review(item, "REJECT")}><X className="h-4 w-4" />Reject</Button>
                    <Button size="sm" disabled={Boolean(busyId)} onClick={() => void review(item, "APPROVE")}><Check className="h-4 w-4" />Approve & publish</Button>
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
