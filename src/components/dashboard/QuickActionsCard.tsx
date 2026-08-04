import Link from "next/link";
import { User, Sparkles, ShieldCheck, Laptop } from "lucide-react";
import { Card } from "@/components/ui/Card";

const actions = [
  { href: "/profile", label: "Edit profile", icon: User },
  { href: "/ai-personalization", label: "Tune AI personalization", icon: Sparkles },
  { href: "/security", label: "Review security", icon: ShieldCheck },
  { href: "/devices", label: "Manage devices", icon: Laptop },
];

export function QuickActionsCard() {
  return (
    <Card>
      <div className="p-5 pb-2">
        <h3 className="font-display text-sm font-semibold text-ink">Quick actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 p-5 pt-3">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-start gap-2.5 rounded-xl border border-glass-border bg-white/[0.02] p-3.5 transition-all hover:border-white/20 hover:bg-white/5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-medium text-ink-muted">{label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
