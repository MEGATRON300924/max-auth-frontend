"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { User, Globe, Languages, Clock, Camera, Loader2 } from "lucide-react";
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
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Initializes editable form fields once the user record arrives from context.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(user.displayName ?? "");
      setCountry(user.country ?? "");
      setLanguage(user.language ?? "");
      setTimezone(user.timezone ?? "");
      if (user.avatarUrl) {
        try {
          const key = "max-auth:account-avatars";
          const stored = JSON.parse(window.localStorage.getItem(key) || "{}") as Record<string, string>;
          window.localStorage.setItem(key, JSON.stringify({ ...stored, [user.email.toLowerCase()]: user.avatarUrl, [user.username.toLowerCase()]: user.avatarUrl }));
        } catch {}
      }
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  if (!user) return null;

  const handleAvatarSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow selecting the same file again after an upload or validation error.
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      showToast({ title: "Unsupported image", description: "Choose a JPG, PNG, WebP or AVIF image.", variant: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ title: "Image is too large", description: "Your profile picture must be 5 MB or smaller.", variant: "error" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsUploadingAvatar(true);
    try {
      const result = await profileApi.uploadAvatar(file);
      await refreshUser();
      try {
        const key = "max-auth:account-avatars";
        const stored = JSON.parse(window.localStorage.getItem(key) || "{}") as Record<string, string>;
        window.localStorage.setItem(key, JSON.stringify({ ...stored, [user.email.toLowerCase()]: result.avatarUrl, [user.username.toLowerCase()]: result.avatarUrl }));
      } catch {}
      setAvatarPreview(null);
      showToast({ title: "Profile picture updated", variant: "success" });
    } catch (err) {
      setAvatarPreview(null);
      showToast({
        title: "Couldn't update profile picture",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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

  const profilePicture = avatarPreview || user.avatarUrl || "/user.png";

  return (
    <div>
      <PageHeader title="Profile" description="How you appear across every MAX product." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <div className="relative">
              <img
                src={profilePicture}
                alt="Your profile picture"
                onError={(event) => {
                  if (event.currentTarget.src !== new URL("/user.png", window.location.origin).href) {
                    event.currentTarget.src = "/user.png";
                  }
                }}
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              {user.displayName || user.username}
            </h3>
            <p className="text-sm text-ink-muted">@{user.username}</p>
            <Badge variant={user.verificationStatus === "VERIFIED" ? "success" : "warning"} className="mt-3">
              {user.verificationStatus === "VERIFIED" ? "Email verified" : "Email unverified"}
            </Badge>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleAvatarSelection}
              disabled={isUploadingAvatar}
            />
            <Button
              type="button"
              variant="secondary"
              className="mt-5"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              {isUploadingAvatar ? "Uploading photo..." : "Change profile picture"}
            </Button>
            <p className="mt-2 text-xs text-ink-muted">JPG, PNG, WebP or AVIF · Up to 5 MB</p>
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
