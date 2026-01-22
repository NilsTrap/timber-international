"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession, isAdmin } from "@/lib/auth";
import {
  VALID_REFERENCE_TABLES,
  isValidUUID,
  type ReferenceTableName,
  type ReferenceOption,
  type ActionResult,
} from "../types";

/**
 * Toggle Reference Option
 *
 * Activates or deactivates an option (soft delete).
 * Admin only endpoint.
 */
export async function toggleReferenceOption(
  tableName: ReferenceTableName,
  id: string,
  isActive: boolean
): Promise<ActionResult<ReferenceOption>> {
  // 1. Check authentication
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Not authenticated",
      code: "UNAUTHENTICATED",
    };
  }

  // 2. Check admin role
  if (!isAdmin(session)) {
    return {
      success: false,
      error: "Permission denied",
      code: "FORBIDDEN",
    };
  }

  // 3. Validate table name
  if (!VALID_REFERENCE_TABLES.includes(tableName)) {
    return {
      success: false,
      error: "Invalid table name",
      code: "INVALID_TABLE",
    };
  }

  // 4. Validate UUID format
  if (!isValidUUID(id)) {
    return {
      success: false,
      error: "Invalid option ID",
      code: "INVALID_ID",
    };
  }

  const supabase = await createClient();

  // 5. Update is_active status
  // Note: Using type assertion because reference tables aren't in generated Supabase types yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(tableName)
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, value, sort_order, is_active, created_at, updated_at")
    .single();

  if (error) {
    console.error(`Failed to toggle option in ${tableName}:`, error);
    return {
      success: false,
      error: "Failed to update option status",
      code: "UPDATE_FAILED",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Option not found",
      code: "NOT_FOUND",
    };
  }

  // 5. Transform and return
  const option: ReferenceOption = {
    id: data.id as string,
    value: data.value as string,
    sortOrder: data.sort_order as number,
    isActive: data.is_active as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };

  return {
    success: true,
    data: option,
  };
}
