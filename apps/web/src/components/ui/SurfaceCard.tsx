import type { PropsWithChildren } from "react";

interface SurfaceCardProps {
  className?: string;
  elevated?: boolean;
}

export function SurfaceCard({
  children,
  className = "",
  elevated = true
}: PropsWithChildren<SurfaceCardProps>) {
  return (
    <section className={`surface-card ${elevated ? "faint-glow" : ""} ${className}`}>
      {children}
    </section>
  );
}
