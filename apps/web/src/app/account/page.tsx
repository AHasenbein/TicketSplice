import { AccountPanel } from "@/components/auth/AccountPanel";
import { AppHeader } from "@/components/layout/AppHeader";

export default function AccountPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="page-shell flex flex-1 items-center justify-center py-14">
        <AccountPanel />
      </main>
    </div>
  );
}
