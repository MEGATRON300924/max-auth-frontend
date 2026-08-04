import { getPasswordStrength } from "@/lib/utils/validators";
import { cn } from "@/lib/utils/cn";

const barColors = ["bg-danger", "bg-danger", "bg-warning", "bg-brand-400", "bg-success"];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, meetsMinimum } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full bg-white/10 transition-colors duration-300", i < score && barColors[score])} />
        ))}
      </div>
      <p className={cn("mt-1.5 text-xs", meetsMinimum ? "text-ink-muted" : "text-ink-faint")}>
        {label}
        {!meetsMinimum && " — needs 8+ characters with a letter and a number"}
      </p>
    </div>
  );
}
