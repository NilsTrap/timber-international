import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Timber World Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access the production management portal
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
