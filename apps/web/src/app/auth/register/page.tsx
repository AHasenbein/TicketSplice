import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Create Account | Ticket Splice",
  description: "Create your Ticket Splice account for event ticket trading."
};

export default function RegisterPage() {
  return <AuthCard mode="register" />;
}
