"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession, isAdmin } from "@/lib/auth";
import { reorderOptionsSchema } from "../schemas";
import {
  VALID_REFERENCE_TABLES,
  type ReferenceTableName,
  type ActionResult,
} from "../types";

/**
 * Reorder Reference Options
 *
 * Updates the sort_order of multiple options at once.
 * Admin only endpoint.
 */
export async function reorderReferenceOptions(
  tableName: ReferenceTableName,
  items: Array<{ id: string; sortOrder: number }>
): Promise<ActionResult<{ message: string }>> {
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

  // 4. Validate input with Zod
  const parsed = reorderOptionsSchema.safeParse({ items });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
      code: "VALIDATION_ERROR",
    };
  }

  const supabase = await createClient();

  // 5. Update each item's sort_order
  // Note: Using individual updates since Supabase doesn't support batch updates with different values
  // Note: Using type assertion because reference tables aren't in generated Supabase types yet
  const updatePromises = parsed.data.items.map(({ id, sortOrder }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from(tableName)
      .update({
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
  );

  const results = await Promise.all(updatePromises);

  // 6. Check for errors
  const failedUpdates = results.filter((r) => r.error);
  if (failedUpdates.length > 0) {
    console.error(`Failed to reorder options in ${tableName}:`, failedUpdates);
    return {
      success: false,
      error: "Failed to reorder some options",
      code: "REORDER_FAILED",
    };
  }

  return {
    success: true,
    data: { message: "Options reordered successfully" },
  };
}
