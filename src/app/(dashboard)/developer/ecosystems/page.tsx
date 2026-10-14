"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Boxes, Plus, Link2, Star, Unlink, RefreshCw, ShieldCheck } from "lucide-react";
import { AuthFeatureShell, GlassCard } from "@/components/auth/AuthFeatureShell";
import { ecosystemApi, type MaxOrganisation, type MaxEcosystem, type OwnedOAuthClient } from "@/lib/api/ecosystems";
import { oauthApi } from "@/lib/api/security";
import { ApiError } from "@/lib/api/ApiError";

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block text-sm font-medium">{label}<input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>;
}

export default function EcosystemsPage() {
  const [organisations, setOrganisations] = useState<MaxOrganisation[]>([]);
  const [clients, setClients] = useState<OwnedOAuthClient[]>([]);
  const [ecosystems, setEcosystems] = useState<MaxEcosystem[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedEcosystem, setSelectedEcosystem] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [ecosystemName, setEcosystemName] = useState("");
  const [ecosystemSlug, setEcosystemSlug] = useState("");
  const [description, setDescription] = useState("");
  const [clientToLink, setClientToLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [orgResult, clientResult] = await Promise.all([
        ecosystemApi.listOrganisations(),
        oauthApi.listClients(),
      ]);
      setOrganisations(orgResult.organisations);
      setClients(clientResult.clients.filter((client: OwnedOAuthClient) => client.isActive));
      const firstOrg = orgResult.organisations.find(org => org.id === selectedOrg) ?? orgResult.organisations[0];
      setSelectedOrg(firstOrg?.id ?? "");
      if (firstOrg) {
        const result = await ecosystemApi.listEcosystems(firstOrg.id);
        setEcosystems(result.ecosystems);
        setSelectedEcosystem(current => result.ecosystems.some(item => item.id === current) ? current : result.ecosystems[0]?.id ?? "");
      } else { setEcosystems([]); setSelectedEcosystem(""); }
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, [selectedOrg]);

  useEffect(() => { void load(); }, [load]);

  const activeEcosystem = useMemo(() => ecosystems.find(item => item.id === selectedEcosystem), [ecosystems, selectedEcosystem]);
  const linkedIds = new Set((activeEcosystem?.clients ?? []).map(client => client.id));
  const availableClients = clients.filter(client => !linkedIds.has(client.id));

  async function createOrganisation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!orgName.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await ecosystemApi.createOrganisation({ name: orgName.trim(), ...(orgSlug.trim() ? { slug: orgSlug.trim() } : {}) });
      setOrgName(""); setOrgSlug(""); setSelectedOrg(result.organisation.id);
      // The selected-org change triggers load() with the new organisation; calling the old closure here would reload stale selection.
      setNotice("Organisation created.");
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }
  async function createEcosystem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedOrg || !ecosystemName.trim()) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await ecosystemApi.createEcosystem(selectedOrg, { name: ecosystemName.trim(), ...(ecosystemSlug.trim() ? { slug: ecosystemSlug.trim() } : {}), ...(description.trim() ? { description: description.trim() } : {}) });
      setEcosystemName(""); setEcosystemSlug(""); setDescription(""); setSelectedEcosystem(result.ecosystem.id);
      setNotice("Ecosystem created."); await load();
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }
  async function linkClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!activeEcosystem || !clientToLink) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await ecosystemApi.linkClient(activeEcosystem.id, clientToLink, (activeEcosystem.clients?.length ?? 0) === 0);
      setClientToLink(""); setNotice("Application linked to this ecosystem."); await load();
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }
  async function makePrimary(clientId: string) {
    if (!activeEcosystem) return;
    setSaving(true); setError(""); setNotice("");
    try { await ecosystemApi.setPrimary(activeEcosystem.id, clientId); setNotice("Primary application updated."); await load(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }
  async function unlink(clientId: string) {
    if (!activeEcosystem || !window.confirm("Unlink this application? Its existing OAuth client will not be deleted.")) return;
    setSaving(true); setError(""); setNotice("");
    try { await ecosystemApi.unlinkClient(activeEcosystem.id, clientId); setNotice("Application unlinked."); await load(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }

  return <AuthFeatureShell eyebrow="MAX for Developers" title="Organisations & ecosystems" description="Group your applications under one organisation and connect them through a shared identity ecosystem.">
    <div className="space-y-5">
      {error && <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-success/20 bg-success/5 p-3 text-sm text-success">{notice}</div>}
      <GlassCard>
        <div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><Building2 className="h-5 w-5" /></div><div><h2 className="font-display text-lg font-semibold">Your organisations</h2><p className="mt-1 text-sm text-ink-muted">Manage projects as a company or team instead of tying every application to one developer account.</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <select aria-label="Choose organisation" value={selectedOrg} onChange={event => setSelectedOrg(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#15161b] px-3 py-2.5 text-sm" disabled={!organisations.length}>
            {!organisations.length && <option value="">No organisations yet</option>}
            {organisations.map(org => <option key={org.id} value={org.id}>{org.name} · {org.role}</option>)}
          </select>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
        {organisations.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-3">{organisations.filter(org => org.id === selectedOrg).map(org => <div key={org.id} className="rounded-xl border border-white/8 p-3"><p className="text-xs text-ink-muted">Your role</p><p className="mt-1 font-semibold">{org.role}</p></div>)}{organisations.filter(org => org.id === selectedOrg).map(org => <div key={org.id + "-ecosystems"} className="rounded-xl border border-white/8 p-3"><p className="text-xs text-ink-muted">Ecosystems</p><p className="mt-1 font-semibold">{org.ecosystemCount}</p></div>)}{organisations.filter(org => org.id === selectedOrg).map(org => <div key={org.id + "-members"} className="rounded-xl border border-white/8 p-3"><p className="text-xs text-ink-muted">Members</p><p className="mt-1 font-semibold">{org.memberCount}</p></div>)}</div>}
        <form onSubmit={createOrganisation} className="mt-5 border-t border-white/10 pt-5"><h3 className="font-semibold">Create organisation</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Organisation name" value={orgName} onChange={setOrgName} placeholder="Example: Acme Hosting" /><Field label="Slug (optional)" value={orgSlug} onChange={setOrgSlug} placeholder="acme-hosting" /></div><button disabled={saving || !orgName.trim()} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" /> Create organisation</button></form>
      </GlassCard>

      <GlassCard>
        <div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300"><Boxes className="h-5 w-5" /></div><div><h2 className="font-display text-lg font-semibold">Create ecosystem</h2><p className="mt-1 text-sm text-ink-muted">An ecosystem groups multiple OAuth clients into a shared identity boundary. Apps keep their own domains, redirect URIs and permissions.</p></div></div>
        {!organisations.length ? <p className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-sm text-ink-muted">Create an organisation first to start an ecosystem.</p> : <form onSubmit={createEcosystem} className="mt-4 space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Field label="Ecosystem name" value={ecosystemName} onChange={setEcosystemName} placeholder="Hosting services" /><Field label="Slug (optional)" value={ecosystemSlug} onChange={setEcosystemSlug} placeholder="hosting-services" /></div><Field label="Description (optional)" value={description} onChange={setDescription} placeholder="Shared MAX identity for our hosting products" /><button disabled={saving || !ecosystemName.trim()} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" /> Create ecosystem</button></form>}
      </GlassCard>

      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Linked applications</h2><p className="mt-1 text-sm text-ink-muted">Link existing clients owned by you or an organisation member. Linking never deletes or recreates an OAuth client.</p></div><ShieldCheck className="h-5 w-5 text-brand-300" /></div>
        {ecosystems.length > 0 && <label className="mt-4 block text-sm font-medium">Choose ecosystem<select value={selectedEcosystem} onChange={event => setSelectedEcosystem(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#15161b] px-3 py-2.5 text-sm">{ecosystems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
        {!loading && !ecosystems.length && <p className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-sm text-ink-muted">Create your first ecosystem above. Then connect your existing applications here.</p>}
        {activeEcosystem && <div className="mt-4 space-y-3">{(activeEcosystem.clients ?? []).map(client => <div key={client.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 p-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5"><Link2 className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{client.name}</p><p className="truncate font-mono text-xs text-ink-muted">{client.clientId}</p></div>{client.isPrimary ? <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-xs text-brand-300">Primary</span> : <button type="button" disabled={saving} onClick={() => void makePrimary(client.id)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-2 text-xs"><Star className="h-3.5 w-3.5" /> Make primary</button>}<button type="button" disabled={saving} onClick={() => void unlink(client.id)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-ink-muted"><Unlink className="h-3.5 w-3.5" /> Unlink</button></div>)}
          <form onSubmit={linkClient} className="rounded-xl border border-dashed border-white/10 p-4"><h3 className="font-semibold">Link an existing OAuth client</h3>{!availableClients.length ? <p className="mt-2 text-sm text-ink-muted">No unlinked active clients available. Create an application in the Developer platform first, or check whether the client belongs to an organisation member.</p> : <><select aria-label="Application to link" value={clientToLink} onChange={event => setClientToLink(event.target.value)} className="mt-3 w-full rounded-xl border border-white/10 bg-[#15161b] px-3 py-2.5 text-sm"><option value="">Select an application</option>{availableClients.map(client => <option key={client.id} value={client.id}>{client.name} · {client.clientId}</option>)}</select><button disabled={saving || !clientToLink} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Link2 className="h-4 w-4" /> Link application</button></>}</form>
        </div>}
        {loading && <p className="mt-4 text-sm text-ink-muted">Loading organisation data…</p>}
      </GlassCard>
      <p className="px-1 text-xs leading-5 text-ink-muted">Identity sharing is scoped to clients linked to the same ecosystem. Shared cloud files, profile fields and other capabilities must still be granted separately; an ecosystem link is not blanket data access.</p>
    </div>
  </AuthFeatureShell>;
}
