import type { PropsWithChildren } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <AppShell>
      <div className="page-shell flex flex-1 items-start justify-center py-6 sm:items-center sm:py-14">
        {children}
      </div>
    </AppShell>
  );
}
