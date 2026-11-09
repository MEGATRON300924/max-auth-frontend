"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, ImagePlus, RefreshCw, Save, Trash2, UploadCloud, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/tokenStore";

const API_URL = (process.env.NEXT_PUBLIC_SPOTLIGHT_API_URL || "https://max-spotlight-graph-api.onrender.com/api/v1").replace(/\/$/, "");
const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
const PLATFORMS = ["INSTAGRAM","FACEBOOK","X","TIKTOK","YOUTUBE","LINKEDIN","THREADS","OTHER"] as const;
type Platform = typeof PLATFORMS[number];
type SocialProfile = { platform: Platform; handle: string; url: string };
type Profile = { publicId: string; name: string; kind: string; canonicalSlug: string; description: string | null; updatedAt: string; role: string; aliases: { id: string; value: string }[]; media: { id: string; role: string; mediaAsset: { title: string | null; sourceUrl: string | null; storageUrl: string | null; attribution: string | null } }[]; socialAccounts?: { platform: Platform; handle: string | null; profileUrl: string; status?: string }[] };
type Contribution = { id: string; contributionType: string; status: string; createdAt: string };

const inputClass = "mt-2 w-full rounded-xl border border-glass-border bg-base px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-400";
const labelClass = "block text-sm font-medium text-ink";

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
  const [profile,setProfile] = useState<Profile|null>(null);
  const [submissions,setSubmissions] = useState<Contribution[]>([]);
  const [name,setName] = useState(""); const [description,setDescription] = useState(""); const [aliases,setAliases] = useState("");
  const [socials,setSocials] = useState<SocialProfile[]>([]);
  const [imageFile,setImageFile] = useState<File|null>(null); const [imagePreview,setImagePreview] = useState("");
  const [imageTitle,setImageTitle] = useState(""); const [altText,setAltText] = useState(""); const [creator,setCreator] = useState(""); const [attribution,setAttribution] = useState(""); const [licence,setLicence] = useState("");
  const [loading,setLoading] = useState(true); const [busy,setBusy] = useState(false); const [uploading,setUploading] = useState(false);
  const [error,setError] = useState(""); const [notice,setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const listResponse=await request("/me/managed-entities"); const list=await listResponse.json().catch(()=>({}));
      if(!listResponse.ok) throw new Error(list.message||"Your managed profiles could not be loaded.");
      const first=Array.isArray(list.entities)?list.entities[0]:null;
      if(first){
        const detailResponse=await request("/me/managed-entities/"+encodeURIComponent(first.publicId)); const detail=await detailResponse.json().catch(()=>({}));
        if(!detailResponse.ok) throw new Error(detail.message||"Your knowledge panel could not be loaded.");
        const value:Profile=detail.entity; setProfile(value); setName(value.name); setDescription(value.description||""); setAliases(value.aliases.map(item=>item.value).join(", "));
        setSocials(Array.isArray(value.socialAccounts)?value.socialAccounts.map(s=>({platform:s.platform,handle:s.handle||"",url:s.profileUrl||""})):[]);
      } else {setProfile(null);setSocials([]);}
      const cr=await request("/me/contributions"); const cb=await cr.json().catch(()=>({}));
      if(cr.ok) setSubmissions(Array.isArray(cb.contributions)?cb.contributions:[]);
    } catch(err){setError(err instanceof Error?err.message:"Your knowledge panel could not be loaded.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);

  const submit = async(path:string,body:Record<string,unknown>,success:string)=>{
    setBusy(true);setError("");setNotice("");
    try{const response=await request(path,{method:"POST",body:JSON.stringify(body)});const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.message||"Your changes could not be submitted.");setNotice(success);await load();}
    catch(err){setError(err instanceof Error?err.message:"Your changes could not be submitted.");}
    finally{setBusy(false);}
  };

  const uploadImage = async () => {
    if(!imageFile||!profile)return;
    setUploading(true);setError("");setNotice("");
    try{
      if(!["image/jpeg","image/png","image/webp","image/avif"].includes(imageFile.type)||imageFile.size>10*1024*1024) throw new Error("Choose a JPG, PNG, WebP or AVIF image up to 10 MB.");
      const signed=await apiClient.post<{cloudName:string;apiKey:string;uploadUrl:string;signature:string;timestamp:number;uploadParams:Record<string,string>;maxBytes:number;allowedFormats:string[]}>("/profile/avatar/sign-spotlight",{entityPublicId:profile.publicId});
      const data=new FormData();Object.entries(signed.uploadParams).forEach(([key,value])=>data.append(key,value));
      data.append("api_key",signed.apiKey);data.append("signature",signed.signature);data.append("file",imageFile);
      const response=await fetch(signed.uploadUrl,{method:"POST",body:data});const uploaded=await response.json();
      if(!response.ok||!uploaded?.secure_url)throw new Error(uploaded?.error?.message||"Cloudinary upload failed.");
      await submit("/me/managed-entities/"+encodeURIComponent(profile.publicId)+"/media",{url:uploaded.secure_url,title:imageTitle||imageFile.name,altText,creator,attribution,licence},"Your image was uploaded to Cloudinary and submitted for editorial review.");
      setImageFile(null);setImagePreview("");setImageTitle("");setAltText("");setCreator("");setAttribution("");setLicence("");
    }catch(err){setError(err instanceof Error?err.message:"Image upload failed.");}
    finally{setUploading(false);}
  };

    const updateSocial=(index:number,key:keyof SocialProfile,value:string)=>setSocials(current=>current.map((item,i)=>i===index?{...item,[key]:value}:item));
  const addSocial=()=>setSocials(current=>[...current,{platform:"INSTAGRAM",handle:"",url:""}]);
  const removeSocial=(index:number)=>setSocials(current=>current.filter((_,i)=>i!==index));

  return <div className="space-y-5">
    <PageHeader title="Knowledge Panel" description="Manage your public identity, social presence and media on MAX Spotlight." action={<Button variant="secondary" onClick={()=>void load()} disabled={loading||busy||uploading}><RefreshCw className="h-4 w-4"/>Refresh</Button>}/>
    {notice&&<div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {loading?<Card><CardContent><p className="py-8 text-sm text-ink-muted">Loading your knowledge panel…</p></CardContent></Card>:!profile?<Card><CardContent><div className="py-10 text-center"><h2 className="font-semibold text-ink">No managed knowledge panels</h2><p className="mt-1 text-sm text-ink-muted">An approved MAX Spotlight claim will make its panel available here.</p></div></CardContent></Card>:<>
      <Card><CardContent><div className="flex flex-wrap items-start justify-between gap-4 py-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Your published panel</p><h2 className="mt-1 text-xl font-semibold text-ink">{profile.name}</h2><p className="mt-1 text-sm text-ink-muted">{profile.publicId} · {profile.kind.replaceAll("_"," ").toLowerCase()} · {profile.role.toLowerCase()}</p><p className="mt-3 text-xs text-ink-faint">Last updated {new Date(profile.updatedAt).toLocaleString()}</p></div><a href={"https://spotlight.max-ai.name.ng/knowledge/"+profile.canonicalSlug} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm font-medium text-ink hover:bg-base-raised">View public panel <ExternalLink className="h-4 w-4"/></a></div></CardContent></Card>
      <Card><CardHeader><div><CardTitle>Identity and biography</CardTitle><p className="mt-1 text-sm text-ink-muted">Keep the main details accurate. All edits go through editorial review.</p></div></CardHeader><CardContent><form className="space-y-4" onSubmit={e=>{e.preventDefault();void submit("/me/managed-entities/"+encodeURIComponent(profile.publicId)+"/updates",{name,description:description||null,aliases:aliases.split(",").map(v=>v.trim()).filter(Boolean),socialProfiles:socials.filter(s=>s.url.trim()).map(s=>({...s,url:s.url.trim(),handle:s.handle.trim()}))},"Your profile and social details have been submitted for review.");}}>
        <div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Display name<input value={name} onChange={e=>setName(e.target.value)} maxLength={180} required className={inputClass}/></label><label className={labelClass}>Also known as<input value={aliases} onChange={e=>setAliases(e.target.value)} maxLength={3000} placeholder="Other names, stage names, aliases" className={inputClass}/></label></div>
        <label className={labelClass}>Biography<textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={5000} rows={5} placeholder="A clear, factual overview…" className={inputClass}/></label>
        <div className="flex justify-end"><Button type="submit" disabled={busy}><Save className="h-4 w-4"/>Submit profile changes</Button></div>
      </form></CardContent></Card>
      <Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Social media and official links</CardTitle><p className="mt-1 text-sm text-ink-muted">Add the platforms where people can find the official profile.</p></div><Button type="button" variant="secondary" onClick={addSocial}><Plus className="h-4 w-4"/>Add platform</Button></div></CardHeader><CardContent><div className="space-y-3">
        {socials.length===0&&<p className="rounded-xl bg-base-raised p-4 text-sm text-ink-muted">No social profiles added yet.</p>}
        {socials.map((item,index)=><div key={index} className="grid gap-3 rounded-xl border border-glass-border p-3 sm:grid-cols-[150px_1fr_1fr_auto] sm:items-end">
          <label className={labelClass}>Platform<select value={item.platform} onChange={e=>updateSocial(index,"platform",e.target.value)} className={inputClass}>{PLATFORMS.map(platform=><option key={platform} value={platform}>{platform==="X"?"X":platform.charAt(0)+platform.slice(1).toLowerCase()}</option>)}</select></label>
          <label className={labelClass}>Handle<input value={item.handle} onChange={e=>updateSocial(index,"handle",e.target.value)} placeholder="@username" className={inputClass}/></label>
          <label className={labelClass}>Profile link<input type="url" value={item.url} onChange={e=>updateSocial(index,"url",e.target.value)} placeholder="https://…" className={inputClass}/></label>
          <button type="button" onClick={()=>removeSocial(index)} aria-label="Remove social profile" className="mb-1 rounded-lg p-2 text-ink-muted hover:bg-base-raised hover:text-red-600"><Trash2 className="h-4 w-4"/></button>
        </div>)}
        <p className="text-xs text-ink-faint">Only add accounts you own or are authorised to represent. Social links are reviewed before appearing publicly.</p>
      </div></CardContent></Card>
      <Card><CardHeader><div><CardTitle>Images and gallery</CardTitle><p className="mt-1 text-sm text-ink-muted">Choose an image from your device. MAX uploads it to Cloudinary; no image URL is required.</p></div></CardHeader><CardContent>
        {profile.media.length>0&&<div className="mb-5 grid gap-3 sm:grid-cols-2">{profile.media.map(item=>{const src=item.mediaAsset.storageUrl||item.mediaAsset.sourceUrl;return <div key={item.id} className="overflow-hidden rounded-xl border border-glass-border">{src&&<img src={src} alt={item.mediaAsset.title||"Profile media"} className="h-36 w-full object-cover"/>}<div className="p-3"><p className="text-sm font-medium text-ink">{item.mediaAsset.title||"Profile image"}</p>{item.mediaAsset.attribution&&<p className="mt-1 text-xs text-ink-muted">{item.mediaAsset.attribution}</p>}</div></div>})}</div>}
        <div className="space-y-3"><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-glass-border bg-base-raised px-5 py-6 text-center hover:border-brand-400"><UploadCloud className="h-7 w-7 text-ink-muted"/><span className="mt-2 text-sm font-semibold text-ink">{imageFile?imageFile.name:"Choose an image to upload"}</span><span className="mt-1 text-xs text-ink-muted">JPG, PNG, WEBP · up to 10 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e=>{const file=e.target.files?.[0]||null;if(file&&file.size>10*1024*1024){setError("Choose an image smaller than 10 MB.");return;}setImageFile(file);setImagePreview(file?URL.createObjectURL(file):"");}}/></label>
          {imagePreview&&<img src={imagePreview} alt="Selected image preview" className="max-h-56 w-full rounded-xl object-contain bg-base-raised"/>}
          <div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Image title<input value={imageTitle} onChange={e=>setImageTitle(e.target.value)} maxLength={180} className={inputClass}/></label><label className={labelClass}>Alt text<input value={altText} onChange={e=>setAltText(e.target.value)} maxLength={500} placeholder="Describe the image" className={inputClass}/></label><label className={labelClass}>Creator / photographer<input value={creator} onChange={e=>setCreator(e.target.value)} maxLength={180} className={inputClass}/></label><label className={labelClass}>Licence<input value={licence} onChange={e=>setLicence(e.target.value)} maxLength={180} placeholder="Permission, CC BY 4.0…" className={inputClass}/></label></div>
          <label className={labelClass}>Attribution / rights note<textarea value={attribution} onChange={e=>setAttribution(e.target.value)} maxLength={1000} rows={2} className={inputClass}/></label>
          <div className="flex justify-end"><Button type="button" disabled={!imageFile||busy||uploading} onClick={()=>void uploadImage()}><ImagePlus className="h-4 w-4"/>{uploading?"Uploading…":"Upload and submit image"}</Button></div>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Submission history</CardTitle></CardHeader><CardContent>{submissions.length===0?<p className="text-sm text-ink-muted">No recent submissions.</p>:<div className="space-y-3">{submissions.slice(0,12).map(item=><div key={item.id} className="flex items-center justify-between gap-3 border-b border-glass-border pb-3 last:border-0"><div><p className="text-sm font-medium text-ink">{item.contributionType.replaceAll("_"," ")}</p><p className="text-xs text-ink-muted">{new Date(item.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-base-raised px-3 py-1 text-xs font-medium text-ink-muted">{item.status}</span></div>)}</div>}</CardContent></Card>
    </>}
  </div>;
}
