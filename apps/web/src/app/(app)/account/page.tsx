import type { Metadata } from "next";
import { AccountPanel } from "@/components/auth/AccountPanel";

export const metadata: Metadata = {
  title: "Account | Ticket Splice",
  description: "Review your profile and authentication status."
};

export default function AccountPage() {
  return (
    <section className="page-shell flex flex-1 items-center justify-center py-14">
      <AccountPanel />
    </section>
  );
}
