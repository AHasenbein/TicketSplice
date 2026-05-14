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
    <div className={`surface-card ${elevated ? "faint-glow" : ""} ${className}`}>
      {children}
    </div>
  );
}
