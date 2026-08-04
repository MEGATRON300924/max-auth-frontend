"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageSpinner } from "@/components/ui/Spinner";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/ApiError";
import { getPasswordStrength } from "@/lib/utils/validators";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthCard title="Invalid reset link">
        <Alert variant="danger">
          This password reset link is missing or malformed. Request a new one below.
        </Alert>
        <Link href="/forgot-password">
          <Button className="mt-5 w-full">Request a new link</Button>
        </Link>
      </AuthCard>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!getPasswordStrength(password).meetsMinimum) {
      setError("Password must be at least 8 characters, with a letter and a number.");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/sign-in"), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <AuthCard title="Password reset">
        <div className="flex flex-col items-center py-2 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink-muted">
            Your password has been changed. All existing sessions were signed out for your
            security. Redirecting you to sign in…
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Make it something you haven't used before.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
