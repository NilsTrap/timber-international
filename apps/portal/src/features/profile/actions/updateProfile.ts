"use server";

import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "../schemas/profile";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Update User Profile
 *
 * Updates the user's name in Supabase Auth metadata and syncs to portal_users table.
 *
 * NOTE: This is a PROTECTED endpoint - requires authentication.
 */
export async function updateProfile(
  input: ProfileInput
): Promise<ActionResult<{ message: string }>> {
  // 1. Validate input with Zod
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const { name } = parsed.data;
  const supabase = await createClient();

  // 2. Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Not authenticated",
      code: "UNAUTHENTICATED",
    };
  }

  // 3. Update user metadata in Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    data: { name },
  });

  if (updateError) {
    console.error("Failed to update auth metadata:", updateError);
    return {
      success: false,
      error: "Failed to update profile",
      code: "UPDATE_FAILED",
    };
  }

  // 4. Also update portal_users table (keep in sync)
  // Note: Auth metadata is the primary source, portal_users sync is for convenience
  // TODO: Remove type assertion when Supabase types are regenerated with portal_users table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase as any)
    .from("portal_users")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("auth_user_id", user.id);

  if (dbError) {
    // Log but don't fail - auth metadata is primary source
    console.error("Failed to sync portal_users:", dbError);
  }

  return {
    success: true,
    data: { message: "Profile updated successfully" },
  };
}
