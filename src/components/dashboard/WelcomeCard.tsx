import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
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

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <AuroraBackground variant="subtle" />
      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-ink-muted">{greeting}, {user.displayName || user.username}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Your MAX Account</h1>
        </div>
        <Badge variant="info" className="w-fit">{tierLabels[user.subscriptionTier]} plan</Badge>
      </div>
    </Card>
  );
}
