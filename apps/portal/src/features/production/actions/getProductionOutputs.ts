"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession, isProducer, isSuperAdmin } from "@/lib/auth";
import type { ActionResult, ProductionOutput } from "../types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Get Production Outputs
 *
 * Fetches all output rows for a given production entry.
 * Accessible by producers (own organisation) and Super Admin (any organisation).
 */
export async function getProductionOutputs(
  productionEntryId: string
): Promise<ActionResult<ProductionOutput[]>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated", code: "UNAUTHENTICATED" };
  }

  // Allow producers and Super Admin
  if (!isProducer(session) && !isSuperAdmin(session)) {
    return { success: false, error: "Permission denied", code: "FORBIDDEN" };
  }

  if (!productionEntryId || !UUID_REGEX.test(productionEntryId)) {
    return { success: false, error: "Invalid entry ID", code: "INVALID_INPUT" };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("portal_production_outputs")
    .select("id, production_entry_id, package_number, product_name_id, wood_species_id, humidity_id, type_id, processing_id, fsc_id, quality_id, thickness, width, length, pieces, volume_m3, created_at")
    .eq("production_entry_id", productionEntryId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch production outputs:", error);
    return { success: false, error: `Failed to fetch outputs: ${error.message}`, code: "QUERY_FAILED" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputs: ProductionOutput[] = (data || []).map((row: any) => ({
    id: row.id,
    productionEntryId: row.production_entry_id,
    packageNumber: row.package_number,
    productNameId: row.product_name_id,
    woodSpeciesId: row.wood_species_id,
    humidityId: row.humidity_id,
    typeId: row.type_id,
    processingId: row.processing_id,
    fscId: row.fsc_id,
    qualityId: row.quality_id,
    thickness: row.thickness,
    width: row.width,
    length: row.length,
    pieces: row.pieces,
    volumeM3: parseFloat(row.volume_m3) || 0,
    createdAt: row.created_at,
  }));

  return { success: true, data: outputs };
}
