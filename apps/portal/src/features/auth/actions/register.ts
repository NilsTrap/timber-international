"use server";

import { createClient } from "@/lib/supabase/server";
import { registerSchema, type RegisterInput } from "../schemas/register";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Register a new user account.
 *
 * NOTE: This is a PUBLIC endpoint - no authentication required.
 * Permission check (getAuthContext/hasFunction) is intentionally skipped
 * because registration is for unauthenticated users creating new accounts.
 *
 * TODO: Add rate limiting to prevent abuse (see project-context.md security rules)
 */
export async function registerUser(
  input: RegisterInput
): Promise<ActionResult<{ message: string }>> {
  // 1. Validate input with Zod
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, role } = parsed.data;
  const supabase = await createClient();

  // 2. Create auth user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes("already registered")) {
      return { success: false, error: "Email already registered", code: "EMAIL_EXISTS" };
    }
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: "Failed to create user" };
  }

  // 3. Create portal_users record
  // TYPE ASSERTION: portal_users table exists but types aren't auto-generated yet.
  // TODO: Remove assertion after running `npx supabase gen types typescript`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase as any)
    .from("portal_users")
    .insert({
      auth_user_id: authData.user.id,
      email,
      name,
      role,
    });

  if (profileError) {
    // KNOWN ISSUE: Auth user exists but portal_users record failed.
    // Rollback requires Supabase Admin API (service role key) which isn't
    // available in the standard server client.
    //
    // Mitigation options for future:
    // 1. Use database trigger to auto-create portal_users on auth.users insert
    // 2. Add admin cleanup endpoint for orphaned auth users
    // 3. Configure service role client for this specific action
    //
    // For now, user must contact support to resolve manually.
    console.error("Failed to create portal_users record:", profileError);
    return {
      success: false,
      error: "Account created but profile setup failed. Please contact support.",
      code: "PROFILE_CREATION_FAILED",
    };
  }

  return {
    success: true,
    data: { message: "Account created successfully! Please login." },
  };
}
