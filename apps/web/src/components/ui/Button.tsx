import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,var(--accent),var(--accent-soft))] text-white shadow-[0_8px_20px_rgba(62,164,255,0.3)] hover:brightness-110",
  secondary:
    "border border-white/15 bg-white/4 text-[var(--foreground)] hover:bg-white/10",
  ghost:
    "bg-white/0 text-[var(--foreground)] border border-[var(--border)] hover:bg-white/6",
  danger:
    "bg-[linear-gradient(135deg,#f43f5e,#fb7185)] text-white shadow-[0_8px_20px_rgba(244,63,94,0.35)] hover:brightness-110"
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
