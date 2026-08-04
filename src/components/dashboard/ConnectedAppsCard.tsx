import Link from "next/link";
import { Link2, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { ConnectedAccount } from "@/types/api";

export function ConnectedAppsCard({ accounts }: { accounts: ConnectedAccount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected apps</CardTitle>
        <Link href="/connected-apps" className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300">
          Manage <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <EmptyState icon={<Link2 className="h-5 w-5" />} title="Nothing connected yet" description="Link accounts like GitHub or Discord to use them across MAX products." />
        ) : (
          <ul className="space-y-3">
            {accounts.slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span className="text-sm text-ink">{a.provider}</span>
                <Badge variant="neutral">Connected</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
