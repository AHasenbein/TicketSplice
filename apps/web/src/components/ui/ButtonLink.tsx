import Link from "next/link";
import type { ComponentProps, PropsWithChildren } from "react";
import { getButtonClassName } from "./Button";

type ButtonLinkVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: ButtonLinkVariant;
  className?: string;
}

export function ButtonLink({
  children,
  variant = "primary",
  className = "",
  ...props
}: PropsWithChildren<ButtonLinkProps>) {
  return (
    <Link className={getButtonClassName({ variant, className })} {...props}>
      {children}
    </Link>
  );
}
