"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, AtSign } from "lucide-react";
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

export default function CreateAccountPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!isValidUsername(username)) errors.username = "3–32 characters: letters, numbers, underscores, periods.";
    if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!getPasswordStrength(password).meetsMinimum) errors.password = "At least 8 characters, with a letter and a number.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({ username, email, password, displayName: displayName || undefined, rememberMe });
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

  return (
    <AuthCard
      title="Create your MAX Account"
      subtitle="One account unlocks every product in the ecosystem."
      footer={<><span>Already have an account? </span><Link href="/sign-in" className="font-medium text-brand-400 hover:text-brand-300">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert variant="danger">{error}</Alert>}
        <Input label="Display name" type="text" autoComplete="name" icon={<User className="h-4 w-4" />} value={displayName} onChange={(e) => setDisplayName(e.target.value)} hint="Optional — how you'll appear across MAX products." />
        <Input label="Username" type="text" autoComplete="username" icon={<AtSign className="h-4 w-4" />} value={username} onChange={(e) => setUsername(e.target.value)} error={fieldErrors.username} required />
        <Input label="Email" type="email" autoComplete="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} required />
        <div>
          <Input label="Password" type="password" autoComplete="new-password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} required />
          <PasswordStrengthMeter password={password} />
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-glass-border bg-base-raised p-3 text-sm text-ink-muted">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-glass-border bg-base text-brand-600 focus:ring-brand-500" />
          <span><strong className="font-semibold text-ink">Save login info on this device</strong><br /><span className="text-xs">Keep your MAX Account signed in on this device.</span></span>
        </label>
        <p className="text-xs text-ink-faint">By creating an account, you agree to the <Link href="/terms-of-service" className="text-ink-muted hover:text-ink underline underline-offset-2">Terms of Service</Link> and <Link href="/privacy-policy" className="text-ink-muted hover:text-ink underline underline-offset-2">Privacy Policy</Link>.</p>
        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>Create account</Button>
      </form>
    </AuthCard>
  );
}
