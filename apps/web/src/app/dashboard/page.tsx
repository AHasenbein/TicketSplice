import { AppHeader } from "@/components/layout/AppHeader";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="page-shell flex flex-1 items-start justify-center py-14">
        <DashboardPanel />
      </main>
    </div>
  );
}
