"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, UserRound, AtSign, ArrowLeft, ArrowRight, CalendarCheck, Sparkles } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/auth/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { ApiError } from "@/lib/api/ApiError";
import { isValidEmail, isValidUsername, getPasswordStrength } from "@/lib/utils/validators";

const LAST_ACCOUNT_KEY = "max-auth:last-account";
const ACCOUNTS_KEY = "max-auth:accounts";
const STEP_COUNT = 5;

export default function CreateAccountPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const stepTitles = ["What's your name?", "What should MAX call you?", "Age check", "What's your email?", "Create a password"];
  const stepDescriptions = [
    "Enter your name to get your MAX Account started.",
    "Choose your display name and a unique username. You can change your display name later.",
    "Confirm that you meet the minimum age requirement for a MAX Account.",
    "Use an email address you can access. We'll send you a verification link.",
    "Choose a password you don't use for another account.",
  ];

  const validateStep = () => {
    const errors: Record<string, string> = {};
    if (step === 0 && !fullName.trim()) errors.fullName = "Enter your name to continue.";
    if (step === 0 && fullName.trim().length > 128) errors.fullName = "Keep your name to 128 characters or fewer.";
    if (step === 1 && !displayName.trim()) errors.displayName = "Tell MAX what to call you.";
    if (step === 1 && displayName.trim().length > 64) errors.displayName = "Keep your display name to 64 characters or fewer.";
    if (step === 1 && !isValidUsername(username)) errors.username = "Use 3–32 letters, numbers, underscores, or periods.";
    if (step === 2 && !ageConfirmed) errors.age = "Please confirm the age requirement before continuing.";
    if (step === 3 && !isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (step === 4 && !getPasswordStrength(password).meetsMinimum) errors.password = "Use at least 8 characters, including a letter and a number.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    setError(null);
    if (!validateStep()) return;
    setStep((currentStep) => Math.min(currentStep + 1, STEP_COUNT - 1));
  };

  const goBack = () => {
    setError(null);
    setFieldErrors({});
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        displayName: displayName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        ageConfirmed: true,
        rememberMe,
      });
      if (rememberMe) {
        try {
          const account = email.trim().toLowerCase();
          const saved = window.localStorage.getItem(ACCOUNTS_KEY);
          const parsed: unknown = saved ? JSON.parse(saved) : [];
          const accounts = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
          const unique = [...new Map([account, ...accounts].map((item) => [item.toLowerCase(), item])).values()].slice(0, 5);
          window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(unique));
          window.localStorage.removeItem(LAST_ACCOUNT_KEY);
        } catch {
          // Remembering the account is optional and must never block registration.
        }
      }
      showToast({ title: "Account created", description: "Check your inbox for your email verification link.", variant: "success" });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title={stepTitles[step]}
      subtitle={stepDescriptions[step]}
      footer={<><span>Already have a MAX Account? </span><Link href="/sign-in" className="font-medium text-brand-400 hover:text-brand-300">Sign in</Link></>}
    >
      <div className="mb-7">
        <div className="mb-2 flex items-center justify-between text-xs text-ink-faint">
          <span>CREATE ACCOUNT</span>
          <span>Step {step + 1} of {STEP_COUNT}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300" style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={step === STEP_COUNT - 1 ? handleSubmit : (event) => { event.preventDefault(); goNext(); }} className="space-y-5" noValidate>
        {error && <Alert variant="danger">{error}</Alert>}

        {step === 0 && (
          <Input label="Your full name" type="text" autoComplete="name" icon={<UserRound className="h-4 w-4" />} value={fullName} onChange={(event) => setFullName(event.target.value)} error={fieldErrors.fullName} placeholder="Enter your name" required autoFocus />
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-glass-border bg-base-raised p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-muted"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium text-ink">Your name, your way</p>
                <p className="mt-1 text-sm leading-5 text-ink-muted">Your display name appears across MAX. Your username helps identify your account.</p>
              </div>
            </div>
            <Input label="Display name" type="text" autoComplete="nickname" icon={<UserRound className="h-4 w-4" />} value={displayName} onChange={(event) => setDisplayName(event.target.value)} error={fieldErrors.displayName} placeholder="What should MAX call you?" required autoFocus />
            <Input label="MAX username" type="text" autoComplete="username" autoCapitalize="none" icon={<AtSign className="h-4 w-4" />} value={username} onChange={(event) => setUsername(event.target.value.replace(/\s/g, ""))} error={fieldErrors.username} hint="3–32 characters: letters, numbers, periods, or underscores." placeholder="Choose a unique username" required />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-glass-border bg-base-raised p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-muted"><CalendarCheck className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium text-ink">Before we continue</p>
                <p className="mt-1 text-sm leading-6 text-ink-muted">MAX uses age requirements to help apply the right protections. Please confirm that you meet the minimum age requirement that applies to you.</p>
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-glass-border p-4 transition-colors hover:bg-surface">
              <input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} className="mt-1 h-4 w-4 rounded border-glass-border text-brand-600 focus:ring-brand-500" />
              <span className="text-sm leading-6 text-ink">I meet the minimum age requirement for a MAX Account.</span>
            </label>
            {fieldErrors.age && <p role="alert" className="text-sm text-danger">{fieldErrors.age}</p>}
            <p className="text-xs leading-5 text-ink-faint">This is an age confirmation, not independent age verification. MAX does not ask for your date of birth on this screen.</p>
          </div>
        )}

        {step === 3 && (
          <Input label="Email address" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} icon={<Mail className="h-4 w-4" />} value={email} onChange={(event) => setEmail(event.target.value)} error={fieldErrors.email} placeholder="you@example.com" required autoFocus />
        )}

        {step === 4 && (
          <div className="space-y-3">
            <Input label="Password" type="password" autoComplete="new-password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(event) => setPassword(event.target.value)} error={fieldErrors.password} placeholder="Create a strong password" required autoFocus />
            <PasswordStrengthMeter password={password} />
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-glass-border bg-base-raised p-3 text-sm text-ink-muted">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-glass-border bg-base text-brand-600 focus:ring-brand-500" />
              <span><strong className="font-semibold text-ink">Remember this account</strong><br /><span className="text-xs">Only the account identifier is remembered on this device, and only if you opt in.</span></span>
            </label>
            <p className="text-xs leading-5 text-ink-faint">By creating an account, you agree to the <Link href="/terms-of-service" className="text-ink-muted underline underline-offset-2 hover:text-ink">Terms of Service</Link> and <Link href="/privacy-policy" className="text-ink-muted underline underline-offset-2 hover:text-ink">Privacy Policy</Link>.</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          {step > 0 && (
            <button type="button" onClick={goBack} disabled={isLoading} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-glass-border px-5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface disabled:opacity-50">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          <Button type="submit" size="lg" className="w-full rounded-full" isLoading={isLoading}>
            {step === STEP_COUNT - 1 ? "Create account" : <>Continue <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
