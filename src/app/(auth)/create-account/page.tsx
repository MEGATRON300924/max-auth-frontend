"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, AtSign, ArrowLeft, ArrowRight, Eye, EyeOff, CalendarCheck } from "lucide-react";
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
const STEP_COUNT = 5;

export default function CreateAccountPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const stepTitles = ["What's your name?", "What should MAX call you?", "Age check", "What's your email?", "Create a password"];
  const stepDescriptions = [
    "Tell us the name you want associated with your account.",
    "Choose the name people will see across MAX.",
    "Confirm that you meet the minimum age requirement for a MAX Account.",
    "Use an email address you can open. We'll ask you to verify it.",
    "Choose a password you don't use for another account.",
  ];

  const validateStep = () => {
    const errors: Record<string, string> = {};
    if (step === 0 && !displayName.trim()) errors.displayName = "Enter your name to continue.";
    if (step === 0 && displayName.trim().length > 64) errors.displayName = "Keep your name to 64 characters or fewer.";
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
    setStep((current) => Math.min(current + 1, STEP_COUNT - 1));
  };

  const goBack = () => {
    setError(null);
    setFieldErrors({});
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password, displayName: displayName.trim(), rememberMe });
      try {
        if (rememberMe) window.localStorage.setItem(LAST_ACCOUNT_KEY, email.trim().toLowerCase());
        else window.localStorage.removeItem(LAST_ACCOUNT_KEY);
      } catch {
        // Remembering the account identifier is optional.
      }
      showToast({ title: "Account created", description: "Check your inbox to verify your email.", variant: "success" });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const field = (content: ReactNode) => <div className="min-h-[92px]">{content}</div>;

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

      <form
        onSubmit={step === STEP_COUNT - 1 ? handleSubmit : (event) => { event.preventDefault(); goNext(); }}
        className="space-y-5"
        noValidate
      >
        {error && <Alert variant="danger">{error}</Alert>}

        {step === 0 && field(
          <Input label="Your name" type="text" autoComplete="name" icon={<User className="h-4 w-4" />} value={displayName} onChange={(event) => setDisplayName(event.target.value)} error={fieldErrors.displayName} placeholder="Your name" required autoFocus />
        )}

        {step === 1 && field(
          <Input label="What should MAX call you?" type="text" autoComplete="username" icon={<AtSign className="h-4 w-4" />} value={username} onChange={(event) => setUsername(event.target.value.replace(/\s/g, ""))} error={fieldErrors.username} hint="This becomes your unique MAX username." placeholder="Choose a username" required autoFocus />
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-glass-border bg-base-raised p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-muted"><CalendarCheck className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium text-ink">Before we continue</p>
                <p className="mt-1 text-sm leading-6 text-ink-muted">MAX uses age requirements to help apply the right protections. Please confirm you meet the minimum age requirement that applies to you.</p>
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-glass-border p-4 transition-colors hover:bg-surface">
              <input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} className="mt-1 h-4 w-4 rounded border-glass-border text-brand-600 focus:ring-brand-500" />
              <span className="text-sm leading-6 text-ink">I meet the minimum age requirement for a MAX Account.</span>
            </label>
            {fieldErrors.age && <p role="alert" className="text-sm text-danger">{fieldErrors.age}</p>}
            <p className="text-xs leading-5 text-ink-faint">This step is an age confirmation, not an independent age verification. No date of birth is requested here.</p>
          </div>
        )}

        {step === 3 && field(
          <Input label="Email address" type="email" autoComplete="email" autoCapitalize="none" icon={<Mail className="h-4 w-4" />} value={email} onChange={(event) => setEmail(event.target.value)} error={fieldErrors.email} placeholder="you@example.com" required autoFocus />
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="relative">
              <Input label="Password" type={showPassword ? "text" : "password"} autoComplete="new-password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(event) => setPassword(event.target.value)} error={fieldErrors.password} placeholder="Create a strong password" required autoFocus />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-[38px] rounded-full p-2 text-ink-faint transition-colors hover:bg-surface hover:text-ink">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-glass-border bg-base-raised p-3 text-sm text-ink-muted">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-glass-border bg-base text-brand-600 focus:ring-brand-500" />
              <span><strong className="font-semibold text-ink">Remember this account</strong><br /><span className="text-xs">Only the account identifier is remembered on this device.</span></span>
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
