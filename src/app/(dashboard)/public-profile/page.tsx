"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Camera, ContactRound, AtSign } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { profileApi } from "@/lib/api/profile";
import { ApiError } from "@/lib/api/ApiError";
import { getInitials } from "@/lib/utils/formatters";

export default function PublicProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Sync the form when the authenticated account becomes available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayName(user.displayName ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await profileApi.update({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      await refreshUser();
      showToast({ title: "Public profile updated", variant: "success" });
    } catch (error) {
      showToast({
        title: "Couldn't update public profile",
        description: error instanceof ApiError ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const name = displayName.trim() || user.username;
  const photo = avatarUrl.trim();

  return (
    <div>
      <PageHeader
        title="Public profile"
        description="Choose the name and profile photo people see when they identify you across MAX."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Display name"
                icon={<ContactRound className="h-4 w-4" />}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={64}
                placeholder={user.username}
              />
              <Input
                label="Profile photo URL"
                icon={<Camera className="h-4 w-4" />}
                value={avatarUrl}
                onChange={(event) => { setAvatarUrl(event.target.value); setPhotoFailed(false); }}
                placeholder="https://example.com/photo.jpg"
                type="url"
              />
              <div className="flex justify-end border-t border-glass-border pt-4">
                <Button type="submit" isLoading={isSaving}>Save changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center py-7 text-center">
            <p className="mb-5 w-full text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
              Profile preview
            </p>
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-glass-border bg-base-raised text-xl font-semibold text-ink">
              {photo && !photoFailed ? (
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                getInitials(name)
              )}
            </div>
            <h2 className="mt-4 text-base font-semibold text-ink">{name}</h2>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-muted">
              <AtSign className="h-3.5 w-3.5" />{user.username}
            </p>
            <p className="mt-5 text-xs leading-5 text-ink-faint">
              This preview uses your account name and photo. Email address and account security details are not shown here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
