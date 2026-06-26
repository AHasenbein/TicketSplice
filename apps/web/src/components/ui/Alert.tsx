import type { PropsWithChildren } from "react";

type AlertTone = "error" | "success" | "info";

interface AlertProps {
  tone?: AlertTone;
  className?: string;
  announce?: "polite" | "assertive" | "off";
}

const toneStyles: Record<AlertTone, string> = {
  error: "border-red-400/30 bg-red-400/10 text-red-100",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  info: "border border-[var(--border)] bg-white/[0.03] text-[var(--foreground)]"
};

export function Alert({
  children,
  tone = "error",
  className = "",
  announce = "polite"
}: PropsWithChildren<AlertProps>) {
  return (
    <p
      className={`rounded-lg border px-3 py-2 text-sm ${toneStyles[tone]} ${className}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={announce}
    >
      {children}
    </p>
  );
}
