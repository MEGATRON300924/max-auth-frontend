import { Card, CardContent } from "@/components/ui/Card";
import type { MaxUser } from "@/types/api";

function computeCompletion(user: MaxUser): { percent: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [!!user.displayName, "Display name"],
    [!!user.avatarUrl, "Profile photo"],
    [!!user.country, "Country"],
    [!!user.language, "Language"],
    [user.verificationStatus === "VERIFIED", "Email verification"],
  ];
  const done = checks.filter(([complete]) => complete).length;
  const missing = checks.filter(([complete]) => !complete).map(([, label]) => label);
  return { percent: Math.round((done / checks.length) * 100), missing };
}

export function ProfileCompletionCard({ user }: { user: MaxUser }) {
  const { percent, missing } = computeCompletion(user);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-ink">Profile completion</h3>
          <span className="font-display text-sm font-semibold text-brand-300">{percent}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-aurora-violet transition-all duration-700" style={{ width: `${percent}%` }} />
        </div>
        {missing.length > 0 && <p className="mt-3 text-xs text-ink-muted">Still missing: {missing.join(", ")}.</p>}
      </CardContent>
    </Card>
  );
}
