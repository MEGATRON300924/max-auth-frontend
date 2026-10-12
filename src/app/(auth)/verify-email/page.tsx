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

type Status = "verifying" | "sent" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isNewVerification = searchParams.get("sent") === "1";\n  const developerReturnTo = (() => {\n    const value = searchParams.get("returnTo");\n    if (!value) return null;\n    try {\n      const target = new URL(value);\n      return target.origin === "https://developers.max-ai.name.ng" && target.pathname === "/sign-in" && target.searchParams.get("next") === "/onboarding"\n        ? target.toString()\n        : null;\n    } catch {\n      return null;\n    }\n  })();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(isNewVerification ? "sent" : "error");
      setMessage(isNewVerification ? "Your MAX Account has been created. Check your inbox for the verification link, and check spam if it is not there." : "This verification link is missing or malformed.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "This link is invalid or has expired.");
      });
  }, [token, isNewVerification]);

  if (status === "verifying") {
    return (
      <AuthCard title="Verifying your email">
        <div className="flex flex-col items-center py-4">
          <Spinner className="h-7 w-7" />
        </div>
      </AuthCard>
    );
  }

  if (status === "sent") {
    return (
      <AuthCard title="Check your inbox">
        <div className="flex flex-col items-center py-2 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-500"><MailCheck className="h-6 w-6" /></div>
          <p className="text-sm leading-6 text-ink-muted">{message}</p>
          <div className="mt-6 w-full space-y-3">
            <Button className="w-full" isLoading={isResending} onClick={async () => {
              setIsResending(true);
              setResendMessage("");
              try {
                await authApi.sendVerificationEmail();
                setResendMessage("A fresh verification link has been sent. Check your inbox and spam folder.");
              } catch (err) {
                setResendMessage(err instanceof ApiError ? err.message : "Please sign in again and request a new verification email.");
              } finally {
                setIsResending(false);
              }
            }}>Resend verification email</Button>
            {resendMessage && <p role="status" className="text-sm leading-6 text-ink-muted">{resendMessage}</p>}
            <Link href={developerReturnTo || "/dashboard"} className="block text-sm font-medium text-brand-400 hover:text-brand-300">{developerReturnTo ? "Return to Developer Platform" : "Continue to MAX"}</Link>
          </div>
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
        <div className="mt-6 w-full space-y-3">
          <Button variant="secondary" className="w-full" isLoading={isResending} onClick={async () => {
            setIsResending(true);
            setResendMessage("");
            try {
              await authApi.sendVerificationEmail();
              setResendMessage("A fresh verification link has been sent. Check your inbox and spam folder.");
            } catch (err) {
              setResendMessage(err instanceof ApiError ? err.message : "Sign in to your MAX Account first, then request a new verification email.");
            } finally {
              setIsResending(false);
            }
          }}>
            <MailCheck className="h-4 w-4" /> Resend verification email
          </Button>
          {resendMessage && <p role="status" className="text-sm leading-6 text-ink-muted">{resendMessage}</p>}
          <Link href="/sign-in" className="block text-sm font-medium text-brand-400 hover:text-brand-300">Back to sign in</Link>
        </div>
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
