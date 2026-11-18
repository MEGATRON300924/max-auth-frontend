"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Socials", href: "https://api.max-ai.name.ng/connected-apps", path: "/connected-apps", icon: "socials" },
  { label: "Chat MAX", href: "https://www.max-ai.name.ng/max", path: "/max", icon: "chat" },
  { label: "Status", href: "https://www.max-ai.name.ng/status", path: "/status", icon: "status" },
  { label: "News", href: "https://www.max-ai.name.ng/news", path: "/news", icon: "news" },
  { label: "Beta", href: "https://api.max-ai.name.ng/beta", path: "/beta", icon: "beta" },
  { label: "Contact", href: "https://www.max-ai.name.ng/contact", path: "/contact", icon: "contact" },
] as const;

function NavIcon({ name }: { name: typeof links[number]["icon"] }) {
  const paths = {
    socials: <><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 12 21.07l1.71-1.71" /></>,
    chat: <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />,
    status: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    news: <><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    beta: <><path d="M9 3h6M10 3v6l-5.5 9.2A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.8L14 9V3" /><path d="M8 15h8" /></>,
    contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  };
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function GlobalSiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-[#282d34] bg-[#0b0d10] text-[#f4f5f6]">
      <div className="mx-auto flex min-h-[66px] max-w-[1480px] items-center justify-center px-4 sm:px-7">
        <nav aria-label="Main navigation" className="hidden min-w-0 items-center justify-center gap-5 xl:flex">
          {links.map((link) => {
            const active = pathname === link.path;
            return <a key={link.label} href={link.href} aria-current={active ? "page" : undefined} className={active ? "inline-flex items-center gap-[7px] whitespace-nowrap border-b-2 border-[#e8ebef] px-0 py-5 text-[11px] font-semibold text-white no-underline" : "inline-flex items-center gap-[7px] whitespace-nowrap border-b-2 border-transparent px-0 py-5 text-[11px] font-semibold text-[#a3a9b2] no-underline hover:text-white"}>
              <NavIcon name={link.icon} /><span>{link.label}</span>
            </a>;
          })}
        </nav>
        <button type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="mx-auto grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#343a42] bg-transparent text-[#c8cdd4] hover:bg-[#191d22] hover:text-white xl:hidden">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">{open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
        </button>
      </div>
      {open && <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2 border-t border-[#282d34] px-4 py-3 xl:hidden">
        {links.map((link) => {
          const active = pathname === link.path;
          return <a key={link.label} href={link.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={active ? "inline-flex items-center gap-2 rounded-lg border border-[#737b86] bg-[#191d22] px-3 py-3 text-xs font-semibold text-white no-underline" : "inline-flex items-center gap-2 rounded-lg border border-[#292e35] bg-[#111419] px-3 py-3 text-xs font-semibold text-[#c4c9d0] no-underline"}>
            <NavIcon name={link.icon} /><span>{link.label}</span>
          </a>;
        })}
      </nav>}
    </header>
  );
}
