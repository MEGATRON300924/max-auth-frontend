"use client";
import { useCallback,useEffect,useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiClient } from "@/lib/api/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bell,Check,LoaderCircle,RefreshCw } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
type Notice={id:string;title:string;body:string;author:string;createdAt:string;readAt:string|null};
export default function NotificationsPage(){
 const {user,isLoading}=useAuth();const {showToast}=useToast();const [items,setItems]=useState<Notice[]>([]);const [unread,setUnread]=useState(0);const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);try{const r=await apiClient.get<{notifications:Notice[];unread:number}>("/notifications");setItems(r.notifications);setUnread(r.unread);}catch(e){showToast({title:"Unable to load notifications",description:e instanceof Error?e.message:"Try again.",variant:"error"});}finally{setLoading(false);}},[showToast]);
 useEffect(()=>{if(user)void load();},[user,load]);
 const markRead=async(id:string)=>{try{await apiClient.patch(`/notifications/${id}/read`);setItems(old=>old.map(x=>x.id===id?{...x,readAt:new Date().toISOString()}:x));setUnread(n=>Math.max(0,n-1));}catch(e){showToast({title:"Unable to update notification",description:e instanceof Error?e.message:"Try again.",variant:"error"});}};
 if(isLoading)return <div className="p-12 text-center text-sm text-ink-muted"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin"/>Loading…</div>;
 return <div className="mx-auto max-w-3xl space-y-6 pb-12"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand-600">MAX Account</p><h1 className="mt-1 text-2xl font-semibold text-ink">Notifications</h1><p className="mt-1 text-sm text-ink-muted">{unread} unread notification{unread===1?"":"s"}</p></div><Button variant="secondary" onClick={()=>void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/>Refresh</Button></div>
 <Card>{loading?<div className="p-12 text-center text-sm text-ink-muted"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin"/>Loading notifications…</div>:items.length===0?<div className="p-12 text-center"><Bell className="mx-auto h-8 w-8 text-ink-faint"/><p className="mt-3 font-medium text-ink">You’re all caught up</p><p className="mt-1 text-sm text-ink-muted">Official MAX announcements will appear here.</p></div>:<div className="divide-y divide-glass-border">{items.map(item=><article key={item.id} className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-ink">{item.title}</h2>{!item.readAt&&<Badge variant="info">New</Badge>}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{item.body}</p><p className="mt-3 text-xs text-ink-faint">MAX Admin · {new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.createdAt))}</p></div>{!item.readAt&&<Button size="sm" variant="secondary" onClick={()=>void markRead(item.id)}><Check className="h-4 w-4"/>Mark read</Button>}</div></article>)}</div>}</Card></div>;
}
