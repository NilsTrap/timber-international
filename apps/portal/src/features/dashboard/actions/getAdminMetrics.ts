"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession, isAdmin } from "@/lib/auth";
import type { ActionResult, AdminMetrics, DateRange } from "../types";

/**
 * Get Admin Dashboard Metrics
 *
 * Aggregates production data across ALL producers (admin view):
 * 1. Total production volume (all-time output m3 from validated entries)
 * 2. Overall weighted outcome % and waste %
 * 3. Entry count for the period
 *
 * @param dateRange - Optional date range filter (ISO strings)
 */
export async function getAdminMetrics(
  dateRange?: DateRange
): Promise<ActionResult<AdminMetrics>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated", code: "UNAUTHENTICATED" };
  }
  if (!isAdmin(session)) {
    return { success: false, error: "Permission denied", code: "FORBIDDEN" };
  }

  const supabase = await createClient();

  // Build query - admin sees ALL validated entries (no created_by filter)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("portal_production_entries")
    .select("total_input_m3, total_output_m3, validated_at")
    .eq("status", "validated");

  // Apply date range filter if provided
  if (dateRange) {
    query = query.gte("validated_at", dateRange.start);
    if (dateRange.end) {
      query = query.lte("validated_at", dateRange.end);
    }
  }

  const { data: entries, error: entriesError } = await query;

  if (entriesError) {
    console.error("[getAdminMetrics] Failed to fetch production entries:", entriesError.message);
    return { success: false, error: entriesError.message, code: "QUERY_FAILED" };
  }

  let totalProductionVolumeM3 = 0;
  let totalInputM3 = 0;
  let totalOutputM3 = 0;
  let entryCount = 0;

  if (entries) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const entry of entries as any[]) {
      const inputM3 = Number(entry.total_input_m3) || 0;
      const outputM3 = Number(entry.total_output_m3) || 0;
      totalInputM3 += inputM3;
      totalOutputM3 += outputM3;
      totalProductionVolumeM3 += outputM3;
      entryCount++;
    }
  }

  // Compute weighted averages
  const overallOutcomePercent = totalInputM3 > 0 ? (totalOutputM3 / totalInputM3) * 100 : 0;
  const overallWastePercent = totalInputM3 > 0 ? 100 - overallOutcomePercent : 0;

  return {
    success: true,
    data: {
      totalProductionVolumeM3,
      overallOutcomePercent,
      overallWastePercent,
      entryCount,
    },
  };
}
