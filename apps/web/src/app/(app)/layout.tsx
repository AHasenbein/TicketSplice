import type { PropsWithChildren } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
