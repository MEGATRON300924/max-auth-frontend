"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TagInput } from "@/components/dashboard/TagInput";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useToast } from "@/lib/hooks/useToast";
import { profileApi } from "@/lib/api/profile";
import { ApiError } from "@/lib/api/ApiError";

const TONE_OPTIONS = ["casual", "professional", "concise", "detailed"] as const;

export default function AIPersonalizationPage() {
  const { data, isLoading, refetch } = useAsyncData(() =>
    profileApi.getAIProfile().then((r) => r.aiProfile)
  );
  const { showToast } = useToast();

  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [tone, setTone] = useState<string>("casual");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) {
      // Initializes editable fields once the AI profile arrives from the API.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInterests(data.interests ?? []);
      setLanguages(data.languages ?? []);
      setTone((data.preferences?.tone as string) ?? "casual");
    }
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileApi.updateAIProfile({
        interests,
        languages,
        preferences: { ...(data?.preferences ?? {}), tone },
      });
      refetch();
      showToast({ title: "AI personalization saved", variant: "success" });
    } catch (err) {
      showToast({
        title: "Couldn't save",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Personalization"
        description="Help MAX AI understand your interests and how you like to be talked to."
      />

      {isLoading ? (
        <SkeletonCard />
      ) : (
        <div className="space-y-6">
          <Alert variant="info" title="This tunes MAX AI, not your account security">
            Interests and preferences are used to personalize AI responses across the ecosystem.
            No AI memory engine is active yet — this is stored profile data only.
          </Alert>

          <Card>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-muted">Interests</label>
                <TagInput tags={interests} onChange={setInterests} placeholder="Add an interest and press Enter…" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-muted">Preferred languages</label>
                <TagInput tags={languages} onChange={setLanguages} placeholder="e.g. en, fr, yo…" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-muted">Response tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTone(option)}
                      className={
                        "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors " +
                        (tone === option
                          ? "border-brand-400 bg-brand-500/15 text-brand-300"
                          : "border-glass-border text-ink-muted hover:border-white/20 hover:text-ink")
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Sparkles className="h-4 w-4" /> Save personalization
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
