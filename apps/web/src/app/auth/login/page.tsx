import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Log In | Ticket Splice",
  description: "Sign in to buy and sell event tickets."
};

export default function LoginPage() {
  return <AuthCard mode="login" />;
}
