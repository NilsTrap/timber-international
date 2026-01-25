"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession, isSuperAdmin } from "@/lib/auth";
import { generateTemporaryPassword } from "@/lib/utils/generatePassword";
import { sendCredentialsEmail } from "@/lib/email/sendCredentialsEmail";
import type { ActionResult } from "../types";
import { isValidUUID } from "../types";

/**
 * Resend User Credentials
 *
 * Resends login credentials for a portal user with status='invited' who already has auth_user_id:
 * 1. Verify user is in 'invited' status and has auth_user_id
 * 2. Generate a new temporary password
 * 3. Update auth.users password via Admin API
 * 4. Send email with new credentials
 * 5. Update invited_at timestamp
 *
 * Super Admin only endpoint.
 */
export async function resendUserCredentials(
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

  // 5. Check if user has status 'invited' and has auth_user_id
  if (portalUser.status !== "invited") {
    return {
      success: false,
      error: "User is not in invited status. Use Reset Password for active users.",
      code: "INVALID_STATUS",
    };
  }

  if (!portalUser.auth_user_id) {
    return {
      success: false,
      error: "User does not have login credentials yet. Use Send Credentials instead.",
      code: "NO_AUTH_USER",
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

  // 7. Generate new temporary password
  const temporaryPassword = generateTemporaryPassword(12);

  // 8. Update auth user password via Admin API
  const supabaseAdmin = createAdminClient();
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    portalUser.auth_user_id as string,
    {
      password: temporaryPassword,
      user_metadata: {
        name: portalUser.name as string,
        role: portalUser.role as string,
        organisation_name: organisationName,
      },
    }
  );

  if (authError) {
    console.error("Failed to update auth user password:", authError);
    return {
      success: false,
      error: "Failed to reset password",
      code: "AUTH_UPDATE_FAILED",
    };
  }

  // 9. Update invited_at timestamp in portal_users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("portal_users")
    .update({
      invited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Failed to update invited_at:", updateError);
    // Password was reset but timestamp update failed - this is not critical
    // Continue with sending the email
  }

  // 10. Send credentials email
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
    // Don't fail the operation - credentials were reset successfully
    console.warn(
      "Credentials resent but email delivery failed. User can still log in with the new password."
    );
  }

  return {
    success: true,
    data: { email: portalUser.email as string },
  };
}
