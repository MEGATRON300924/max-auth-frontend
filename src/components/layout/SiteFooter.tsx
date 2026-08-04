import Link from "next/link";
import { MaxLogo } from "./MaxLogo";

const productLinks = ["MAX AI", "MAX Cloud", "MAX Home", "MAX Music", "MAX Browser", "MAX Studio", "MAX Security", "MAX Pay"];

export function SiteFooter() {
  return (
    <footer className="border-t border-glass-border">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <MaxLogo size={28} />
            <p className="mt-3 max-w-xs text-sm text-ink-muted">One account for every product in The MAX AI Ecosystem.</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Ecosystem</h3>
            <ul className="mt-3 space-y-2.5">
              {productLinks.slice(0, 4).map((p) => (
                <li key={p} className="text-sm text-ink-muted">{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">More products</h3>
            <ul className="mt-3 space-y-2.5">
              {productLinks.slice(4).map((p) => (
                <li key={p} className="text-sm text-ink-muted">{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Legal</h3>
            <ul className="mt-3 space-y-2.5">
              <li><Link href="/privacy-policy" className="text-sm text-ink-muted hover:text-ink">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-sm text-ink-muted hover:text-ink">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-glass-border pt-6 sm:flex-row">
          <p className="text-xs text-ink-faint">© {new Date().getFullYear()} The Tron Forge Limited. All rights reserved.</p>
          <p className="text-xs text-ink-faint">Built for The MAX AI Ecosystem.</p>
        </div>
      </div>
    </footer>
  );
}
