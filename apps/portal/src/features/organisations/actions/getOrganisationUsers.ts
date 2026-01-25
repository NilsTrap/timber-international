"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession, isSuperAdmin } from "@/lib/auth";
import type { OrganisationUser, ActionResult } from "../types";
import { isValidUUID } from "../types";

/**
 * Get Organisation Users
 *
 * Fetches all users belonging to a specific organisation.
 * Super Admin only endpoint.
 *
 * @param organisationId - The organisation ID to fetch users for
 * @param options.includeInactive - If true, includes deactivated users. Default: true
 */
export async function getOrganisationUsers(
  organisationId: string,
  options?: { includeInactive?: boolean }
): Promise<ActionResult<OrganisationUser[]>> {
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

  // 3. Validate organisation ID
  if (!isValidUUID(organisationId)) {
    return {
      success: false,
      error: "Invalid organisation ID",
      code: "INVALID_ID",
    };
  }

  const supabase = await createClient();
  const includeInactive = options?.includeInactive ?? true;

  // 4. Fetch users for this organisation, including inviter name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("portal_users")
    .select("id, email, name, role, organisation_id, auth_user_id, is_active, status, invited_at, invited_by, last_login_at, created_at, updated_at, inviter:portal_users!invited_by(name)")
    .eq("organisation_id", organisationId);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch organisation users:", error);
    return {
      success: false,
      error: "Failed to fetch users",
      code: "FETCH_FAILED",
    };
  }

  // 5. Transform snake_case to camelCase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users: OrganisationUser[] = (data || []).map((row: any) => ({
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as "admin" | "producer",
    organisationId: row.organisation_id as string,
    authUserId: row.auth_user_id as string | null,
    isActive: row.is_active as boolean,
    status: row.status as "created" | "invited" | "active",
    invitedAt: row.invited_at as string | null,
    invitedBy: row.invited_by as string | null,
    invitedByName: row.inviter?.name as string | null,
    lastLoginAt: row.last_login_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  return {
    success: true,
    data: users,
  };
}
