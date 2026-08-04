export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidUsername(value: string): boolean {
  return /^[a-zA-Z0-9_.]{3,32}$/.test(value);
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too weak" | "Weak" | "Fair" | "Strong" | "Excellent";
  meetsMinimum: boolean;
}

export function getPasswordStrength(value: string): PasswordStrength {
  const meetsMinimum = value.length >= 8 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value);

  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value)) score++;

  const labels: PasswordStrength["label"][] = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];

  return {
    score: score as PasswordStrength["score"],
    label: labels[score],
    meetsMinimum,
  };
}
