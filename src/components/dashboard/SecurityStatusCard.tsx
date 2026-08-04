import Link from "next/link";
import { ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { MaxUser } from "@/types/api";

export function SecurityStatusCard({ user }: { user: MaxUser }) {
  const verified = user.verificationStatus === "VERIFIED";

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " + (verified ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning")}>
              {verified ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-ink">{verified ? "Account secure" : "Action recommended"}</h3>
              <p className="mt-1 text-xs text-ink-muted">
                {verified ? "Email verified. Two-factor authentication isn't enabled yet." : "Verify your email to fully secure your account."}
              </p>
            </div>
          </div>
        </div>
        <Link href="/security" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300">
          View security center <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
