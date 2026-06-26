import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,var(--neon-pink),var(--neon-blue))] text-white shadow-[0_10px_28px_rgba(255,46,168,0.45),inset_0_0_0_1px_rgba(255,255,255,0.12)] hover:brightness-110 hover:shadow-[0_14px_32px_rgba(34,211,255,0.45),inset_0_0_0_1px_rgba(255,255,255,0.2)]",
  secondary:
    "silver-border-glow-strong bg-[rgba(34,211,255,0.08)] text-[var(--foreground)] hover:bg-[rgba(34,211,255,0.16)] hover:border-[rgba(34,211,255,0.55)] hover:shadow-[0_0_18px_rgba(34,211,255,0.35)]",
  ghost:
    "bg-transparent text-[var(--foreground)] silver-border-glow hover:bg-[rgba(168,178,192,0.1)] hover:border-[var(--border-strong)]",
  danger:
    "bg-[linear-gradient(135deg,#f43f5e,#fb7185)] text-white shadow-[0_8px_20px_rgba(244,63,94,0.4)] hover:brightness-110"
};

interface ButtonClassOptions {
  variant?: ButtonVariant;
  className?: string;
}

export function getButtonClassName({
  variant = "primary",
  className = ""
}: ButtonClassOptions = {}): string {
  return `inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={getButtonClassName({ variant, className })}
      {...props}
    >
      {children}
    </button>
  );
}
