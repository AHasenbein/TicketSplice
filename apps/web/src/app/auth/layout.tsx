import type { PropsWithChildren } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="page-shell flex flex-1 items-start justify-center py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center sm:py-14">
        {children}
      </main>
    </div>
  );
}
