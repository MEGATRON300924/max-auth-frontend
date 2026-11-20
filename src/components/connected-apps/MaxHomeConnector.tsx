"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, ChevronUp, Home, Link2, LoaderCircle, RefreshCw, Unlink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { maxHomeApi, type MaxHomeLink } from "@/lib/api/maxHome";
import { useToast } from "@/lib/hooks/useToast";

export function MaxHomeConnector() {
  const { showToast } = useToast();
  const [homes, setHomes] = useState<MaxHomeLink[]>([]);
  const [linkAll, setLinkAll] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maxHomeApi.getAccountLinks();
      setHomes(data.homes);
      setLinkAll(data.linkAll);
      setSelected(data.homes.filter((home) => home.linked).map((home) => home.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "MAX Home could not be reached.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const linkedCount = useMemo(() => linkAll ? homes.length : selected.length, [homes.length, linkAll, selected.length]);

  function toggleHome(homeId: string) {
    setLinkAll(false);
    setSelected((current) => current.includes(homeId) ? current.filter((id) => id !== homeId) : [...current, homeId]);
  }

  async function saveSelection(mode: "all" | "selected") {
    setSaving(true);
    try {
      await maxHomeApi.updateAccountLinks(mode === "all" ? { mode: "all" } : { mode: "selected", homeIds: selected });
      await load();
      showToast({ title: mode === "all" ? "All MAX Homes linked" : "Selected MAX Homes linked", description: "Your home selection is now saved to your MAX Account.", variant: "success" });
    } catch (err) {
      showToast({ title: "Couldn't update MAX Home links", description: err instanceof Error ? err.message : "Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function unlinkAll() {
    setSaving(true);
    try {
      await maxHomeApi.unlinkAccountHomes();
      await load();
      showToast({ title: "MAX Home unlinked", description: "Your MAX Account is no longer linked to any MAX Home.", variant: "success" });
    } catch (err) {
      showToast({ title: "Couldn't unlink MAX Home", description: err instanceof Error ? err.message : "Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-glass-border bg-base p-2">
            <Image src="/max_home.png" alt="MAX Home" width={48} height={48} className="h-10 w-10 object-contain" priority />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-ink">MAX Home</p>
              {loading ? <Badge variant="neutral">Checking</Badge> : linkedCount > 0 ? <Badge variant="success">{linkedCount} {linkedCount === 1 ? "home linked" : "homes linked"}</Badge> : <Badge variant="neutral">Not linked</Badge>}
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-faint">Choose which of your MAX Homes are connected to this MAX Account. You can link individual homes or all homes you can access.</p>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setExpanded((value) => !value)} disabled={loading || saving}>
              {expanded ? "Close" : "Manage homes"} {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void load()} disabled={loading || saving} aria-label="Refresh MAX Home list"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /></Button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-glass-border p-5">
            {loading ? (
              <div className="flex items-center gap-2 py-5 text-xs text-ink-muted"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading homes from MAX Home…</div>
            ) : error ? (
              <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-ink-muted">The home list could not be loaded.</p><Button size="sm" variant="secondary" onClick={() => void load()}>Try again</Button></div>
            ) : homes.length === 0 ? (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium text-ink">No homes available</p><p className="mt-1 text-xs text-ink-faint">Create a home or accept an invitation in MAX Home first. It will appear here automatically.</p></div>
                <a href="https://home.max-ai.name.ng" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-glass-border px-3 py-2 text-xs font-semibold text-ink hover:bg-glass-hover">Open MAX Home <Link2 className="h-3.5 w-3.5" /></a>
              </div>
            ) : (
              <>
                <div className="mb-4 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => setLinkAll(true)} className={`flex items-start gap-3 rounded-md border p-3 text-left transition ${linkAll ? "border-ink bg-glass-hover" : "border-glass-border hover:bg-glass-hover"}`}>
                    <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${linkAll ? "border-ink bg-ink text-base" : "border-ink-faint"}`}>{linkAll && <Check className="h-3 w-3" />}</span>
                    <span><span className="block text-xs font-semibold text-ink">Link all homes</span><span className="mt-1 block text-[11px] leading-4 text-ink-faint">Link every home this MAX Account can access, including homes you join later.</span></span>
                  </button>
                  <button type="button" onClick={() => setLinkAll(false)} className={`flex items-start gap-3 rounded-md border p-3 text-left transition ${!linkAll ? "border-ink bg-glass-hover" : "border-glass-border hover:bg-glass-hover"}`}>
                    <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${!linkAll ? "border-ink bg-ink text-base" : "border-ink-faint"}`}>{!linkAll && <Check className="h-3 w-3" />}</span>
                    <span><span className="block text-xs font-semibold text-ink">Choose specific homes</span><span className="mt-1 block text-[11px] leading-4 text-ink-faint">Select only the homes you want connected to this MAX Account.</span></span>
                  </button>
                </div>
                <div className="space-y-2">
                  {homes.map((home) => {
                    const checked = linkAll || selected.includes(home.id);
                    return <label key={home.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-glass-border px-3 py-3 hover:bg-glass-hover">
                      <input type="checkbox" checked={checked} disabled={linkAll || saving} onChange={() => toggleHome(home.id)} className="h-4 w-4 accent-current" />
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-base text-ink-muted"><Home className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-ink">{home.name}</span><span className="mt-0.5 block truncate text-[11px] text-ink-faint">{[home.city, home.country].filter(Boolean).join(", ") || home.role}</span></span>
                      {home.linked && <Badge variant="success">Linked</Badge>}
                    </label>;
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-ink-faint">{linkAll ? "All current and future accessible homes will be linked." : `${selected.length} of ${homes.length} homes selected`}</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedCount > 0 && <Button size="sm" variant="ghost" onClick={() => void unlinkAll()} disabled={saving}><Unlink className="h-3.5 w-3.5" /> Unlink all</Button>}
                    <Button size="sm" onClick={() => void saveSelection(linkAll ? "all" : "selected")} disabled={saving || (!linkAll && selected.length === 0)} isLoading={saving}><Link2 className="h-3.5 w-3.5" /> Save home links</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
