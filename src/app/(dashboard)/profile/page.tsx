"use client";

import { useEffect, useState, type FormEvent } from "react";
import { User, Globe, Languages, Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { profileApi } from "@/lib/api/profile";
import { ApiError } from "@/lib/api/ApiError";
import { getInitials } from "@/lib/utils/formatters";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // Initializes editable form fields once the user record arrives from context.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(user.displayName ?? "");
      setCountry(user.country ?? "");
      setLanguage(user.language ?? "");
      setTimezone(user.timezone ?? "");
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await profileApi.update({
        displayName: displayName || undefined,
        country: country || undefined,
        language: language || undefined,
        timezone: timezone || undefined,
      });
      await refreshUser();
      showToast({ title: "Profile updated", variant: "success" });
    } catch (err) {
      showToast({
        title: "Couldn't save changes",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="How you appear across every MAX product." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-aurora-magenta text-xl font-semibold text-white">
              {getInitials(user.displayName || user.username)}
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              {user.displayName || user.username}
            </h3>
            <p className="text-sm text-ink-muted">@{user.username}</p>
            <Badge variant={user.verificationStatus === "VERIFIED" ? "success" : "warning"} className="mt-3">
              {user.verificationStatus === "VERIFIED" ? "Email verified" : "Email unverified"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Display name"
                icon={<User className="h-4 w-4" />}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <Input label="Email" value={user.email} disabled hint="Email changes aren't supported yet." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Country"
                  icon={<Globe className="h-4 w-4" />}
                  placeholder="US"
                  maxLength={2}
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                />
                <Input
                  label="Language"
                  icon={<Languages className="h-4 w-4" />}
                  placeholder="en"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
                <Input
                  label="Timezone"
                  icon={<Clock className="h-4 w-4" />}
                  placeholder="Africa/Lagos"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSaving}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
