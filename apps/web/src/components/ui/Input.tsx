import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
  helperText?: string;
}

export function Input({
  label,
  className = "",
  errorMessage,
  helperText,
  ...props
}: InputProps) {
  const hasError = Boolean(errorMessage);

  return (
    <label className="grid gap-1.5 text-sm">
      <span className="muted-text">{label}</span>
      <input
        className={`h-11 rounded-[var(--radius-md)] border bg-[var(--surface)] px-3 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)] ${
          hasError ? "border-red-400/50" : "border-[var(--border)]"
        } ${className}`}
        {...props}
      />
      {errorMessage ? <span className="text-xs text-danger">{errorMessage}</span> : null}
      {!errorMessage && helperText ? <span className="muted-text text-xs">{helperText}</span> : null}
    </label>
  );
}
