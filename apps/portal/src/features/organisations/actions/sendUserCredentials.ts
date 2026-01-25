"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession, isSuperAdmin } from "@/lib/auth";
import { generateTemporaryPassword } from "@/lib/utils/generatePassword";
import { sendCredentialsEmail } from "@/lib/email/sendCredentialsEmail";
import type { ActionResult } from "../types";
import { isValidUUID } from "../types";

/**
 * Send User Credentials
 *
 * Generates login credentials for a portal user:
 * 1. Generate a temporary password
 * 2. Create auth.users record via Supabase Admin API
 * 3. Link auth_user_id in portal_users table
 * 4. Update status from 'created' to 'invited'
 * 5. Set invited_at and invited_by
 * 6. Send email with credentials
 *
 * Super Admin only endpoint.
 */
export async function sendUserCredentials(
  userId: string,
  organisationId: string
): Promise<ActionResult<{ email: string }>> {
  // 1. Check authentication
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Not authenticated",
      code: "UNAUTHENTICATED",
    };
  }

  // 2. Check Super Admin role
  if (!isSuperAdmin(session)) {
    return {
      success: false,
      error: "Permission denied",
      code: "FORBIDDEN",
    };
  }

  // 3. Validate IDs
  if (!isValidUUID(userId)) {
    return {
      success: false,
      error: "Invalid user ID",
      code: "INVALID_ID",
    };
  }

  if (!isValidUUID(organisationId)) {
    return {
      success: false,
      error: "Invalid organisation ID",
      code: "INVALID_ID",
    };
  }

  const supabase = await createClient();

  // 4. Get the user from portal_users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: portalUser, error: userError } = await (supabase as any)
    .from("portal_users")
    .select("id, email, name, role, organisation_id, auth_user_id, status")
    .eq("id", userId)
    .eq("organisation_id", organisationId)
    .single();

  if (userError || !portalUser) {
    return {
      success: false,
      error: "User not found",
      code: "USER_NOT_FOUND",
    };
  }

  // 5. Check if user already has auth credentials
  if (portalUser.auth_user_id) {
    return {
      success: false,
      error: "User already has login credentials",
      code: "ALREADY_HAS_CREDENTIALS",
    };
  }

  // 6. Get organisation name for email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase as any)
    .from("organisations")
    .select("name")
    .eq("id", organisationId)
    .single();

  const organisationName = org?.name || "Timber World";

  // 7. Get current admin's portal_users ID for invited_by
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentAdmin } = await (supabase as any)
    .from("portal_users")
    .select("id")
    .eq("auth_user_id", session.id)
    .single();

  const invitedById = currentAdmin?.id ?? null;

  // 8. Generate temporary password
  const temporaryPassword = generateTemporaryPassword(12);

  // 9. Create auth user via Admin API
  const supabaseAdmin = createAdminClient();
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: portalUser.email as string,
      password: temporaryPassword,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        name: portalUser.name as string,
        role: portalUser.role as string,
        organisation_name: organisationName,
      },
    });

  if (authError || !authUser.user) {
    console.error("Failed to create auth user:", authError);

    // Check for specific error types
    if (authError?.message?.includes("already been registered")) {
      return {
        success: false,
        error: "Email already registered in authentication system",
        code: "EMAIL_EXISTS_IN_AUTH",
      };
    }

    return {
      success: false,
      error: "Failed to create login credentials",
      code: "AUTH_CREATE_FAILED",
    };
  }

  // 10. Link auth_user_id and update status to 'invited'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("portal_users")
    .update({
      auth_user_id: authUser.user.id,
      status: "invited",
      invited_at: new Date().toISOString(),
      invited_by: invitedById,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Failed to link auth user:", updateError);
    // Auth user was created but linking failed - this is a partial success
    // The admin can try again or manually fix
    return {
      success: false,
      error: "Credentials created but failed to link to user profile",
      code: "LINK_FAILED",
    };
  }

  // 11. Send credentials email
  const loginUrl =
    process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
      : "https://portal.timber-world.com/login";

  const emailResult = await sendCredentialsEmail({
    to: portalUser.email as string,
    name: portalUser.name as string,
    email: portalUser.email as string,
    temporaryPassword,
    loginUrl,
  });

  if (!emailResult.success) {
    console.error("Failed to send credentials email:", emailResult.error);
    // Don't fail the operation - credentials were created successfully
    // Just log the error and return success
    console.warn(
      "Credentials created but email delivery failed. User can still log in with the generated credentials."
    );
  }

  return {
    success: true,
    data: { email: portalUser.email as string },
  };
}
