import { AppHeader } from "@/components/layout/AppHeader";
import { AuthCard } from "@/components/auth/AuthCard";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="page-shell flex flex-1 items-center justify-center py-14">
        <AuthCard mode="register" />
      </main>
    </div>
  );
}
