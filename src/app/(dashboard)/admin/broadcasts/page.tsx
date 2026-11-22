"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BellRing, LoaderCircle, RefreshCw, Send } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/lib/hooks/useToast";

type Broadcast = { id: string; title: string; body: string; audience: string; author: string; recipientCount: number; createdAt: string };
export default function BroadcastCentrePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [title,setTitle] = useState("");
  const [body,setBody] = useState("");
  const [audience,setAudience] = useState<"ALL"|"SELECTED">("ALL");
  const [usernames,setUsernames] = useState("");
  const [history,setHistory] = useState<Broadcast[]>([]);
  const [loading,setLoading] = useState(true);
  const [sending,setSending] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const result = await apiClient.get<{broadcasts:Broadcast[]}>("/admin/broadcasts"); setHistory(result.broadcasts); } catch(e) { showToast({title:"Unable to load broadcast history",description:e instanceof Error?e.message:"Try again.",variant:"error"}); } finally { setLoading(false); } },[showToast]);
  useEffect(() => { if(!isLoading && !user?.isAdmin) router.replace("/dashboard"); },[isLoading,user,router]);
  useEffect(() => { if(user?.isAdmin) void load(); },[user?.isAdmin,load]);
  const send = async (event:React.FormEvent) => {
    event.preventDefault();
    const recipients = usernames.split(/[\n,;]+/).map(x=>x.trim().replace(/^@/,"")).filter(Boolean);
    if(audience==="SELECTED" && (!recipients.length || recipients.length>500)) { showToast({title:"Check recipient usernames",description:"Enter between 1 and 500 usernames.",variant:"error"}); return; }
    const summary = audience==="ALL" ? "all active MAX users" : `${recipients.length} selected user(s)`;
    if(!window.confirm(`Send this announcement to ${summary}? This will create in-app notifications and attempt email delivery.`)) return;
    setSending(true);
    try {
      const result = await apiClient.post<{broadcast:{recipientCount:number;emailSent:number;emailFailed:number}}>("/admin/broadcasts",{title,body,audience,usernames:audience==="SELECTED"?recipients:undefined});
      showToast({title:"Broadcast sent",description:`In-app notifications created for ${result.broadcast.recipientCount} users. Email sent: ${result.broadcast.emailSent}; failed: ${result.broadcast.emailFailed}.`,variant:"success"});
      setTitle("");setBody("");setUsernames("");await load();
    } catch(e) { showToast({title:"Broadcast was not sent",description:e instanceof Error?e.message:"Check recipients and try again.",variant:"error"}); }
    finally { setSending(false); }
  };
  if(isLoading || !user?.isAdmin) return <div className="flex min-h-[45vh] items-center justify-center text-sm text-ink-muted"><LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>Checking administrator access…</div>;
  return <div className="space-y-7 pb-12">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><button onClick={()=>router.push("/admin")} className="mb-3 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><ArrowLeft className="h-4 w-4"/>Admin console</button><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600"><BellRing className="h-6 w-6"/></span><div><p className="text-xs font-semibold uppercase tracking-widest text-brand-600">User communications</p><h1 className="text-2xl font-semibold text-ink">Broadcast centre</h1></div></div><p className="mt-3 max-w-2xl text-sm text-ink-muted">Send official MAX announcements to all active users or a targeted list of usernames.</p></div><Button variant="secondary" onClick={()=>void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/>Refresh</Button></div>
    <Card><CardContent className="space-y-5"><div><h2 className="font-semibold text-ink">Compose announcement</h2><p className="mt-1 text-sm text-ink-muted">Every recipient gets an in-app notification. MAX Auth will also attempt email delivery.</p></div>
      <form onSubmit={send} className="space-y-4">
        <label className="block text-sm font-medium text-ink">Announcement title<input required minLength={3} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Scheduled MAX Auth maintenance" className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-base px-3 text-sm outline-none focus:border-brand-500"/></label>
        <label className="block text-sm font-medium text-ink">Message<textarea required maxLength={12000} rows={6} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write the announcement for MAX users…" className="mt-2 w-full rounded-xl border border-glass-border bg-base p-3 text-sm outline-none focus:border-brand-500"/></label>
        <div><p className="mb-2 text-sm font-medium text-ink">Audience</p><div className="grid gap-3 sm:grid-cols-2"><label className={`cursor-pointer rounded-xl border p-4 ${audience==="ALL"?"border-brand-500 bg-brand-500/5":"border-glass-border"}`}><span className="flex items-center gap-2 text-sm font-semibold text-ink"><input type="radio" checked={audience==="ALL"} onChange={()=>setAudience("ALL")}/>All active users</span><span className="mt-1 block pl-6 text-xs text-ink-muted">Send to every active MAX account.</span></label><label className={`cursor-pointer rounded-xl border p-4 ${audience==="SELECTED"?"border-brand-500 bg-brand-500/5":"border-glass-border"}`}><span className="flex items-center gap-2 text-sm font-semibold text-ink"><input type="radio" checked={audience==="SELECTED"} onChange={()=>setAudience("SELECTED")}/>Specific users</span><span className="mt-1 block pl-6 text-xs text-ink-muted">Target accounts by username.</span></label></div></div>
        {audience==="SELECTED" && <label className="block text-sm font-medium text-ink">Usernames<textarea rows={3} value={usernames} onChange={e=>setUsernames(e.target.value)} placeholder="@username1, username2&#10;username3" className="mt-2 w-full rounded-xl border border-glass-border bg-base p-3 text-sm outline-none focus:border-brand-500"/><span className="mt-1 block text-xs text-ink-muted">Separate usernames with commas, semicolons or new lines. Maximum 500. Every username must match an active account.</span></label>}
        <div className="flex flex-col gap-3 border-t border-glass-border pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-ink-faint">Sending creates a permanent broadcast record and delivery report.</p><Button type="submit" disabled={sending||title.trim().length<3||!body.trim()||(audience==="SELECTED"&&!usernames.trim())}>{sending?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}Send broadcast</Button></div>
      </form>
    </CardContent></Card>
    <Card><div className="border-b border-glass-border px-5 py-4"><h2 className="font-semibold text-ink">Broadcast history</h2><p className="mt-1 text-sm text-ink-muted">The latest 50 broadcasts and their recipient totals.</p></div>{loading?<div className="p-10 text-center text-sm text-ink-muted"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin"/>Loading history…</div>:history.length===0?<p className="p-10 text-center text-sm text-ink-muted">No broadcasts have been sent yet.</p>:<div className="divide-y divide-glass-border">{history.map(item=><div key={item.id} className="px-5 py-4"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink">{item.title}</p><Badge variant={item.audience==="ALL"?"info":"neutral"}>{item.audience==="ALL"?"All users":"Selected users"}</Badge></div><p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.body}</p><p className="mt-2 text-xs text-ink-faint">{item.recipientCount} recipients · by @{item.author} · {new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.createdAt))}</p></div>)}</div>}</Card>
  </div>;
}
