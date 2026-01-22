"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "../schemas/login";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Log in a user with email and password.
 *
 * NOTE: This is a PUBLIC endpoint - no authentication required.
 * After successful login, returns redirect path for client to navigate.
 */
export async function loginUser(
  input: LoginInput
): Promise<ActionResult<{ redirectTo: string }>> {
  // 1. Validate input with Zod
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  // 2. Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // TODO: Remove this console.log before production
    console.error("Login error from Supabase:", error.message, error.code);
    // Generic error for security (don't reveal if email exists)
    return {
      success: false,
      error: "Invalid email or password",
      code: "INVALID_CREDENTIALS",
    };
  }

  if (!data.user) {
    return { success: false, error: "Login failed", code: "LOGIN_FAILED" };
  }

  // 3. Return redirect path
  // Note: Both roles redirect to /dashboard - role-specific UI handled in Story 1.4
  return {
    success: true,
    data: { redirectTo: "/dashboard" },
  };
}
