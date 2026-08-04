"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/ApiError";
import { isValidEmail } from "@/lib/utils/validators";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard title="Check your inbox">
        <div className="flex flex-col items-center py-2 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
            <MailCheck className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink-muted">
            If an account exists for <span className="text-ink">{email}</span>, we&apos;ve sent a
            link to reset your password. It expires in 30 minutes.
          </p>
          <Link href="/sign-in" className="mt-6 text-sm font-medium text-brand-400 hover:text-brand-300">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to get back in."
      footer={
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 font-medium text-brand-400 hover:text-brand-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert variant="danger">{error}</Alert>}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
