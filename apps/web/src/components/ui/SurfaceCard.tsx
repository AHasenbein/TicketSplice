import type { PropsWithChildren } from "react";

interface SurfaceCardProps {
  className?: string;
}

export function SurfaceCard({
  children,
  className = ""
}: PropsWithChildren<SurfaceCardProps>) {
  return <section className={`surface-card faint-glow ${className}`}>{children}</section>;
}
