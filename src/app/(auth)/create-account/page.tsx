"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, UserRound, AtSign, ArrowLeft, ArrowRight, CalendarDays, Sparkles } from "lucide-react";
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

function calculateAge(dateOfBirth: string): number | null {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(dateOfBirth);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dob = new Date(year, month - 1, day);
  if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) return null;
  const today = new Date();
  if (dob > new Date(today.getFullYear(), today.getMonth(), today.getDate())) return null;
  let age = today.getFullYear() - year;
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age -= 1;
  return age;
}

export default function CreateAccountPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showAlmostEighteen, setShowAlmostEighteen] = useState(false);
  const [ageGroup, setAgeGroup] = useState<"UNDER_16" | "AGE_16_17" | "AGE_18_PLUS">("AGE_18_PLUS");
  const [parentEmail, setParentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const stepTitles = ["What's your name?", "What should MAX call you?", "How old are you?", "What's your email?", "Create a password"];
  const stepDescriptions = [
    "Enter your name to get your MAX Account started.",
    "Choose your display name and a unique username. You can change your display name later.",
    "Enter your date of birth so MAX can apply the right protections and approval steps.",
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
    if (step === 2 && calculateAge(dateOfBirth) === null) errors.dateOfBirth = "Choose a valid date of birth that is not in the future.";
    if (step === 2 && !ageConfirmed) errors.age = "Please confirm that your date of birth is correct.";
    if (step === 3 && ageGroup !== "AGE_18_PLUS" && !isValidEmail(parentEmail)) errors.parentEmail = "Enter a valid parent or guardian email address.";
    if (step === 3 && ageGroup !== "AGE_18_PLUS" && parentEmail.trim().toLowerCase() === email.trim().toLowerCase() && isValidEmail(email)) errors.parentEmail = "Use a parent or guardian email address, not your own.";
    if (step === 3 && !isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (step === 4 && !getPasswordStrength(password).meetsMinimum) errors.password = "Use at least 8 characters, including a letter and a number.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    setError(null);
    if (!validateStep()) return;
    if (step === 2) {
      const age = calculateAge(dateOfBirth);
      if (age === null) return;
      const nextAgeGroup = age < 16 ? "UNDER_16" : age < 18 ? "AGE_16_17" : "AGE_18_PLUS";
      setAgeGroup(nextAgeGroup);
      if (nextAgeGroup === "AGE_16_17" && !showAlmostEighteen) {
        setShowAlmostEighteen(true);
        return;
      }
      setShowAlmostEighteen(false);
    }
    setStep((currentStep) => Math.min(currentStep + 1, STEP_COUNT - 1));
  };

  const goBack = () => {
    setError(null);
    setFieldErrors({});
    if (step === 2 && showAlmostEighteen) { setShowAlmostEighteen(false); return; }
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
        ageGroup,
        ...(ageGroup !== "AGE_18_PLUS" ? { parentEmail: parentEmail.trim() } : {}),
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
      showToast({ title: ageGroup === "AGE_18_PLUS" ? "Account created" : "Approval requested", description: ageGroup === "AGE_18_PLUS" ? "Check your inbox for your email verification link." : "We sent your parent or guardian an approval request.", variant: "success" });
      if (ageGroup !== "AGE_18_PLUS") {
        router.push("/parental-approval/pending");
        return;
      }
      let returnTo = "";
      try {
        const requestedReturnTo = new URLSearchParams(window.location.search).get("returnTo");
        if (requestedReturnTo) {
          const target = new URL(requestedReturnTo);
          if (target.origin === "https://developers.max-ai.name.ng" && target.pathname === "/sign-in") {
            returnTo = `${target.origin}${target.pathname}?next=%2Fonboarding`;
          }
        }
      } catch {
        // Ignore untrusted or malformed return URLs.
      }
      router.push(`/verify-email?sent=1${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`);
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
            {showAlmostEighteen ? (
              <div className="py-3">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500"><Sparkles className="h-6 w-6" /></div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Your MAX account</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">You're almost 18 🎉</h2>
                <p className="mt-3 text-sm leading-6 text-ink-muted">Based on the date of birth you entered, you're 16–17 years old. A parent or guardian must approve your account, and some MAX services may remain restricted until you turn 18.</p>
                <div className="mt-5 rounded-2xl border border-glass-border bg-base-raised p-4">
                  <p className="text-sm font-medium text-ink">One more family safety step</p>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">On the next screen, enter a parent or guardian's email address so we can send them an approval request.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 rounded-2xl border border-glass-border bg-base-raised p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-muted"><CalendarDays className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-ink">A safer MAX experience</p>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">Choose your date of birth. MAX will calculate your age and apply the appropriate protections and approval steps.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-ink">Date of birth</label>
                  <input id="dateOfBirth" name="dateOfBirth" type="date" autoComplete="bday" max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`} value={dateOfBirth} onChange={(event) => { setDateOfBirth(event.target.value); setAgeConfirmed(false); setFieldErrors((current) => ({ ...current, dateOfBirth: "", age: "" })); }} className="h-12 w-full rounded-xl border border-glass-border bg-base px-4 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
                  {fieldErrors.dateOfBirth && <p role="alert" className="text-sm text-danger">{fieldErrors.dateOfBirth}</p>}
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-glass-border p-4 transition-colors hover:bg-surface">
                  <input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} className="mt-1 h-4 w-4 rounded border-glass-border text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm leading-6 text-ink">I confirm that the date of birth I entered is correct.</span>
                </label>
                {fieldErrors.age && <p role="alert" className="text-sm text-danger">{fieldErrors.age}</p>}
                <p className="text-xs leading-5 text-ink-faint">This is an age declaration, not independent age verification. MAX does not request an ID or payment card on this screen.</p>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {ageGroup !== "AGE_18_PLUS" && (
              <Input label="Parent or guardian email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} icon={<Mail className="h-4 w-4" />} value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} error={fieldErrors.parentEmail} placeholder="parent@example.com" required autoFocus />
            )}
            <Input label="Email address" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} icon={<Mail className="h-4 w-4" />} value={email} onChange={(event) => setEmail(event.target.value)} error={fieldErrors.email} placeholder="you@example.com" required autoFocus={ageGroup === "AGE_18_PLUS"} />
          </div>
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
            {step === STEP_COUNT - 1 ? "Create account" : <>Continue <ArrowRight className="h-4 w-4" /></> }
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
