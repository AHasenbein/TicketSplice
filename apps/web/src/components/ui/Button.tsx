import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,var(--neon-pink),var(--neon-blue))] text-white shadow-[0_10px_28px_rgba(255,46,168,0.45),inset_0_0_0_1px_rgba(255,255,255,0.12)] hover:brightness-110 hover:shadow-[0_14px_32px_rgba(34,211,255,0.45),inset_0_0_0_1px_rgba(255,255,255,0.2)] max-md:min-h-12 max-md:px-6 max-md:text-[15px] max-md:shadow-[0_12px_34px_rgba(255,46,168,0.55),0_0_0_1px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.25)] max-md:hover:shadow-[0_16px_40px_rgba(34,211,255,0.5),0_0_0_1px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.3)]",
  secondary:
    "border border-[var(--border-strong)] bg-[rgba(34,211,255,0.08)] text-[var(--foreground)] hover:bg-[rgba(34,211,255,0.16)] hover:border-[rgba(34,211,255,0.55)] hover:shadow-[0_0_18px_rgba(34,211,255,0.35)] max-md:min-h-12 max-md:border-[rgba(34,211,255,0.45)] max-md:bg-[rgba(34,211,255,0.14)] max-md:shadow-[0_0_22px_rgba(34,211,255,0.28)]",
  ghost:
    "bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[rgba(232,235,243,0.08)] hover:border-[var(--border-strong)] max-md:min-h-12 max-md:border-[var(--border-strong)] max-md:bg-[rgba(232,235,243,0.06)]",
  danger:
    "bg-[linear-gradient(135deg,#f43f5e,#fb7185)] text-white shadow-[0_8px_20px_rgba(244,63,94,0.4)] hover:brightness-110 max-md:min-h-12"
};

interface ButtonClassOptions {
  variant?: ButtonVariant;
  className?: string;
}

export function getButtonClassName({
  variant = "primary",
  className = ""
}: ButtonClassOptions = {}): string {
  return `inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60 max-md:touch-manipulation max-md:active:scale-[0.97] max-md:disabled:active:scale-100 ${variantClasses[variant]} ${className}`;
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
