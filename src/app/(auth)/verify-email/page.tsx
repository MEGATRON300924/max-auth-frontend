"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/ApiError";

type Status = "verifying" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      setMessage("This verification link is missing or malformed.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "This link is invalid or has expired.");
      });
  }, [token]);

  if (status === "verifying") {
    return (
      <AuthCard title="Verifying your email">
        <div className="flex flex-col items-center py-4">
          <Spinner className="h-7 w-7" />
        </div>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard title="Email verified">
        <div className="flex flex-col items-center py-2 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink-muted">
            Your email is confirmed. Your MAX Account is fully set up.
          </p>
          <Link href="/dashboard" className="mt-6 w-full">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Couldn't verify email">
      <div className="flex flex-col items-center py-2 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
          <XCircle className="h-6 w-6" />
        </div>
        <p className="text-sm text-ink-muted">{message}</p>
        <Link href="/dashboard" className="mt-6 w-full">
          <Button variant="secondary" className="w-full">
            <MailCheck className="h-4 w-4" /> Resend from your dashboard
          </Button>
        </Link>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthCard title="Verifying your email"><div /></AuthCard>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
