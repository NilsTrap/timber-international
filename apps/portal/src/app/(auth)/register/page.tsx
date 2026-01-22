import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Register to access the Timber World Portal
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
