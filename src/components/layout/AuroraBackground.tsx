export function AuroraBackground({ variant = "default" }: { variant?: "default" | "subtle" }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className={
          "absolute -top-1/4 left-1/2 h-[60vw] w-[60vw] max-h-[900px] max-w-[900px] -translate-x-1/2 rounded-full blur-[120px] animate-drift " +
          (variant === "subtle" ? "opacity-[0.12]" : "opacity-25")
        }
        style={{
          background: "conic-gradient(from 90deg, #3B82F6, #8B5CF6, #D946EF, #F59E0B, #3B82F6)",
        }}
      />
      <div
        className={
          "absolute bottom-[-20%] right-[-10%] h-[40vw] w-[40vw] max-h-[600px] max-w-[600px] rounded-full blur-[100px] animate-drift-slow " +
          (variant === "subtle" ? "opacity-[0.08]" : "opacity-[0.18]")
        }
        style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
      />
      <div className="absolute inset-0 bg-base/40" />
    </div>
  );
}
