"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession, isAdmin } from "@/lib/auth";
import { referenceOptionSchema } from "../schemas";
import {
  VALID_REFERENCE_TABLES,
  isValidUUID,
  type ReferenceTableName,
  type ReferenceOption,
  type ActionResult,
} from "../types";

/**
 * Update Reference Option
 *
 * Updates the value of an existing option.
 * Admin only endpoint.
 */
export async function updateReferenceOption(
  tableName: ReferenceTableName,
  id: string,
  input: { value: string }
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

  // 5. Validate input with Zod
  const parsed = referenceOptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
      code: "VALIDATION_ERROR",
    };
  }

  const { value } = parsed.data;
  const supabase = await createClient();

  // 6. Check for duplicate value (excluding current record)
  // Note: Using type assertion because reference tables aren't in generated Supabase types yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from(tableName)
    .select("id")
    .eq("value", value)
    .neq("id", id)
    .single();

  if (existing) {
    return {
      success: false,
      error: "This value already exists",
      code: "DUPLICATE_VALUE",
    };
  }

  // 6. Update option
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(tableName)
    .update({
      value,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, value, sort_order, is_active, created_at, updated_at")
    .single();

  if (error) {
    console.error(`Failed to update option in ${tableName}:`, error);
    return {
      success: false,
      error: "Failed to update option",
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

  // 7. Transform and return
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
