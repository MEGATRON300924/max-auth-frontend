"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, ImagePlus, RefreshCw, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/tokenStore";

const API_URL = (process.env.NEXT_PUBLIC_SPOTLIGHT_API_URL || "https://max-spotlight-graph-api.onrender.com/api/v1").replace(/\/$/, "");
type Profile = { publicId: string; name: string; kind: string; canonicalSlug: string; description: string | null; updatedAt: string; role: string; aliases: { id: string; value: string }[]; media: { id: string; mediaAsset: { title: string | null; sourceUrl: string | null; storageUrl: string | null; attribution: string | null } }[] };
type Contribution = { id: string; contributionType: string; status: string; createdAt: string };

async function request(path: string, init: RequestInit = {}) {
  let token = tokenStore.get() || await apiClient.silentRefresh();
  if (!token) throw new Error("Your MAX Account session could not be renewed. Sign in again.");
  const send = (value: string) => fetch(API_URL + path, { ...init, headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers || {}), Authorization: "Bearer " + value }, cache: "no-store" });
  let response = await send(token);
  if (response.status === 401) {
    token = await apiClient.silentRefresh();
    if (!token) throw new Error("Your MAX Account session has expired. Sign in again.");
    response = await send(token);
  }
  return response;
}

export default function KnowledgePanelPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Contribution[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [aliases, setAliases] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [attribution, setAttribution] = useState("");
  const [licence, setLicence] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const listResponse = await request("/me/managed-entities");
      const list = await listResponse.json().catch(() => ({}));
      if (!listResponse.ok) throw new Error(list.message || "Your managed profiles could not be loaded.");
      const first = Array.isArray(list.entities) ? list.entities[0] : null;
      if (first) {
        const detailResponse = await request("/me/managed-entities/" + encodeURIComponent(first.publicId));
        const detail = await detailResponse.json().catch(() => ({}));
        if (!detailResponse.ok) throw new Error(detail.message || "Your knowledge panel could not be loaded.");
        const value: Profile = detail.entity;
        setProfile(value); setName(value.name); setDescription(value.description || ""); setAliases(value.aliases.map(item => item.value).join(", "));
      } else setProfile(null);
      const contributionResponse = await request("/me/contributions");
      const contributionBody = await contributionResponse.json().catch(() => ({}));
      if (contributionResponse.ok) setSubmissions(Array.isArray(contributionBody.contributions) ? contributionBody.contributions : []);
    } catch (err) { setError(err instanceof Error ? err.message : "Your knowledge panel could not be loaded."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const submit = async (path: string, body: Record<string, unknown>, message: string) => {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await request(path, { method: "POST", body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Your changes could not be submitted.");
      setNotice(message); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Your changes could not be submitted."); }
    finally { setBusy(false); }
  };

  return <div>
    <PageHeader title="Knowledge Panel" description="Manage the information and images shown on your MAX Spotlight profile." action={<Button variant="secondary" onClick={() => void load()} disabled={loading || busy}><RefreshCw className="h-4 w-4"/>Refresh</Button>}/>
    {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {loading ? <Card><CardContent><p className="py-8 text-sm text-ink-muted">Loading your knowledge panel…</p></CardContent></Card> : !profile ? <Card><CardContent><div className="py-10 text-center"><h2 className="font-semibold text-ink">No managed knowledge panels</h2><p className="mt-1 text-sm text-ink-muted">An approved MAX Spotlight claim will make its panel available here.</p></div></CardContent></Card> : <div className="space-y-5">
      <Card><CardContent><div className="flex flex-wrap items-start justify-between gap-4 py-2"><div><p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Published profile</p><h2 className="mt-1 text-xl font-semibold text-ink">{profile.name}</h2><p className="mt-1 text-sm text-ink-muted">{profile.publicId} · {profile.kind.replaceAll("_"," ").toLowerCase()} · {profile.role.toLowerCase()}</p></div><a href={"https://spotlight.max-ai.name.ng/"+profile.canonicalSlug} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm font-medium text-ink hover:bg-base-raised">View public panel <ExternalLink className="h-4 w-4"/></a></div><p className="mt-3 text-xs text-ink-faint">Last published update: {new Date(profile.updatedAt).toLocaleString()}</p></CardContent></Card>
      <Card><CardHeader><div><CardTitle>Profile information</CardTitle><p className="mt-1 text-sm text-ink-muted">Changes are checked by MAX Spotlight editorial review before publication.</p></div></CardHeader><CardContent><form className="space-y-4" onSubmit={event => {event.preventDefault();void submit("/me/managed-entities/"+encodeURIComponent(profile.publicId)+"/updates",{name,description:description||null,aliases:aliases.split(",").map(v=>v.trim()).filter(Boolean)},"Your profile changes have been submitted for review.");}}>
        <label className="block text-sm font-medium text-ink">Display name<input value={name} onChange={e=>setName(e.target.value)} maxLength={180} required className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-400"/></label>
        <label className="block text-sm font-medium text-ink">Biography<textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={5000} rows={5} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-400"/></label>
        <label className="block text-sm font-medium text-ink">Also known as <span className="font-normal text-ink-muted">(comma-separated)</span><input value={aliases} onChange={e=>setAliases(e.target.value)} maxLength={3000} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-400"/></label>
        <div className="flex justify-end"><Button type="submit" disabled={busy}><Save className="h-4 w-4"/>Submit changes</Button></div>
      </form></CardContent></Card>
      <Card><CardHeader><div><CardTitle>Profile images</CardTitle><p className="mt-1 text-sm text-ink-muted">Submit a public HTTPS image address with its rights and attribution details.</p></div></CardHeader><CardContent>
        {profile.media.length>0 && <div className="mb-4 space-y-2">{profile.media.map(item=><div key={item.id} className="rounded-xl border border-glass-border p-3"><p className="text-sm font-medium text-ink">{item.mediaAsset.title||"Profile image"}</p><p className="mt-1 break-all text-xs text-ink-muted">{item.mediaAsset.sourceUrl||item.mediaAsset.storageUrl}</p>{item.mediaAsset.attribution&&<p className="mt-1 text-xs text-ink-faint">{item.mediaAsset.attribution}</p>}</div>)}</div>}
        <form className="space-y-3" onSubmit={event=>{event.preventDefault();void submit("/me/managed-entities/"+encodeURIComponent(profile.publicId)+"/media",{url:imageUrl,title:imageTitle,creator,attribution,licence},"Your image has been submitted for rights and editorial review.");}}>
          <label className="block text-sm font-medium text-ink">Image URL<input type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://…" required className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-400"/></label>
          <label className="block text-sm font-medium text-ink">Image title<input value={imageTitle} onChange={e=>setImageTitle(e.target.value)} maxLength={180} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-400"/></label>
          <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Creator / photographer<input value={creator} onChange={e=>setCreator(e.target.value)} maxLength={180} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-400"/></label><label className="block text-sm font-medium text-ink">Licence<input value={licence} onChange={e=>setLicence(e.target.value)} maxLength={180} placeholder="e.g. CC BY 4.0 or permission" className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-400"/></label></div>
          <label className="block text-sm font-medium text-ink">Attribution / rights note<textarea value={attribution} onChange={e=>setAttribution(e.target.value)} maxLength={1000} rows={2} className="mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-400"/></label>
          <div className="flex justify-end"><Button type="submit" disabled={busy||!imageUrl}><ImagePlus className="h-4 w-4"/>Submit image</Button></div>
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Recent submissions</CardTitle></CardHeader><CardContent>{submissions.length===0?<p className="text-sm text-ink-muted">No recent submissions.</p>:<div className="space-y-3">{submissions.slice(0,8).map(item=><div key={item.id} className="flex items-center justify-between gap-3 border-b border-glass-border pb-3 last:border-0"><div><p className="text-sm font-medium text-ink">{item.contributionType.replaceAll("_"," ")}</p><p className="text-xs text-ink-muted">{new Date(item.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-base-raised px-3 py-1 text-xs font-medium text-ink-muted">{item.status}</span></div>)}</div>}</CardContent></Card>
    </div>}
  </div>;
}
