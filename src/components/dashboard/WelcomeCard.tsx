import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MaxLogo } from "@/components/layout/MaxLogo";
import type { MaxUser } from "@/types/api";

const tierLabels: Record<MaxUser["subscriptionTier"], string> = {
  FREE: "Free",
  PLUS: "Plus",
  PRO: "Pro",
  BUSINESS: "Business",
  ENTERPRISE: "Enterprise",
};

export function WelcomeCard({ user }: { user: MaxUser }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = user.displayName || user.username;

  return (
    <Card className="overflow-hidden border-glass-border bg-base-raised p-0 shadow-none">
      <div className="border-b border-glass-border px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <MaxLogo size={48} showWordmark={false} href="" className="shrink-0" />
            <div>
              <p className="text-sm text-ink-muted">{greeting}, {displayName}</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">Your MAX Account</h1>
              <p className="mt-1 text-sm text-ink-muted">Manage your account, security and MAX services.</p>
            </div>
          </div>
          <Badge variant="info" className="w-fit shrink-0">{tierLabels[user.subscriptionTier]} plan</Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-glass-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-6 py-5 sm:px-8">
          <p className="text-xs font-medium text-ink-faint">Account</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">{user.email}</p>
        </div>
        <div className="px-6 py-5 sm:px-8">
          <p className="text-xs font-medium text-ink-faint">Identity</p>
          <p className="mt-1 text-sm font-semibold text-ink">MAX Auth protected</p>
        </div>
        <div className="px-6 py-5 sm:px-8">
          <p className="text-xs font-medium text-ink-faint">Plan</p>
          <p className="mt-1 text-sm font-semibold text-ink">{tierLabels[user.subscriptionTier]}</p>
        </div>
      </div>
    </Card>
  );
}
