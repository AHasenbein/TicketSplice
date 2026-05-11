import type { PropsWithChildren } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="page-shell flex flex-1 items-center justify-center py-14">
        {children}
      </main>
    </div>
  );
}
