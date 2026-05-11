import Link from "next/link";
import { Button } from "../ui/Button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(7,11,20,0.8)] backdrop-blur-lg">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link href="/" className="brand-heading text-base font-semibold tracking-tight">
          Ticket Splice
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button variant="ghost" className="h-9 px-4">
              Log in
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="h-9 px-4">Create account</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
