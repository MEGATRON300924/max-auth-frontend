import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { AIProfile } from "@/types/api";

export function AIPersonalizationCard({ profile }: { profile: AIProfile | null }) {
  const interests = profile?.interests ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI personalization</CardTitle>
        <Link href="/ai-personalization" className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300">
          Customize <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {interests.length === 0 ? (
          <EmptyState icon={<Sparkles className="h-5 w-5" />} title="Not personalized yet" description="Add interests and preferences so MAX AI understands you better." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {interests.slice(0, 8).map((interest) => (
              <Badge key={interest} variant="info">{interest}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
