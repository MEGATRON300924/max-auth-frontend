import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface MaxLogoProps {
  size?: number;
  showWordmark?: boolean;
  href?: string;
  className?: string;
}

export function MaxLogo({ size = 32, showWordmark = true, href = "/", className }: MaxLogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image src="/logo.png" alt="MAX AI" width={size} height={size} className="rounded-full" priority />
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          MAX <span className="text-brand-600 dark:text-brand-400">Auth</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return <Link href={href} className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">{content}</Link>;
}
