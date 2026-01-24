"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession, isProducer } from "@/lib/auth";
import type { ActionResult } from "../types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface OutputRowInput {
  dbId: string | null;
  packageNumber: string;
  productNameId: string;
  woodSpeciesId: string;
  humidityId: string;
  typeId: string;
  processingId: string;
  fscId: string;
  qualityId: string;
  thickness: string;
  width: string;
  length: string;
  pieces: string;
  volumeM3: number;
}

interface SaveResult {
  /** Map of clientIndex → new dbId for inserted rows */
  insertedIds: Record<number, string>;
}

/**
 * Save Production Outputs (Batch Diff)
 *
 * Compares client rows with existing DB rows for the entry:
 * - Rows with dbId=null → INSERT
 * - Rows with dbId that differ → UPDATE
 * - DB rows not in client list → DELETE
 *
 * Returns the newly inserted row IDs mapped by their index.
 */
export async function saveProductionOutputs(
  productionEntryId: string,
  rows: OutputRowInput[]
): Promise<ActionResult<SaveResult>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated", code: "UNAUTHENTICATED" };
  }

  if (!isProducer(session)) {
    return { success: false, error: "Permission denied", code: "FORBIDDEN" };
  }

  if (!productionEntryId || !UUID_REGEX.test(productionEntryId)) {
    return { success: false, error: "Invalid entry ID", code: "INVALID_INPUT" };
  }

  const supabase = await createClient();

  // Verify production entry ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entry, error: entryError } = await (supabase as any)
    .from("portal_production_entries")
    .select("id, created_by")
    .eq("id", productionEntryId)
    .single();

  if (entryError || !entry) {
    return { success: false, error: "Production entry not found", code: "NOT_FOUND" };
  }
  if (entry.created_by !== session.id) {
    return { success: false, error: "Permission denied", code: "FORBIDDEN" };
  }

  // Fetch existing DB rows with full data for diff comparison
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingRows, error: fetchError } = await (supabase as any)
    .from("portal_production_outputs")
    .select("id, package_number, product_name_id, wood_species_id, humidity_id, type_id, processing_id, fsc_id, quality_id, thickness, width, length, pieces, volume_m3")
    .eq("production_entry_id", productionEntryId);

  if (fetchError) {
    return { success: false, error: `Failed to fetch existing outputs: ${fetchError.message}`, code: "QUERY_FAILED" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingMap = new Map<string, any>((existingRows || []).map((r: any) => [r.id, r]));
  const clientDbIds = new Set<string>(rows.filter((r) => r.dbId).map((r) => r.dbId!));

  // DELETE: DB rows not in client list
  const toDelete = [...existingMap.keys()].filter((id) => !clientDbIds.has(id));
  if (toDelete.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from("portal_production_outputs")
      .delete()
      .in("id", toDelete);

    if (deleteError) {
      return { success: false, error: `Failed to delete outputs: ${deleteError.message}`, code: "DELETE_FAILED" };
    }
  }

  const insertedIds: Record<number, string> = {};

  // Helper to build DB row payload
  function toDbRow(row: OutputRowInput) {
    return {
      production_entry_id: productionEntryId,
      package_number: row.packageNumber,
      product_name_id: row.productNameId || null,
      wood_species_id: row.woodSpeciesId || null,
      humidity_id: row.humidityId || null,
      type_id: row.typeId || null,
      processing_id: row.processingId || null,
      fsc_id: row.fscId || null,
      quality_id: row.qualityId || null,
      thickness: row.thickness || null,
      width: row.width || null,
      length: row.length || null,
      pieces: row.pieces || null,
      volume_m3: row.volumeM3,
    };
  }

  // Helper to check if a row has changed compared to DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function hasChanged(row: OutputRowInput, existing: any): boolean {
    if (row.packageNumber !== existing.package_number) return true;
    if ((row.productNameId || null) !== existing.product_name_id) return true;
    if ((row.woodSpeciesId || null) !== existing.wood_species_id) return true;
    if ((row.humidityId || null) !== existing.humidity_id) return true;
    if ((row.typeId || null) !== existing.type_id) return true;
    if ((row.processingId || null) !== existing.processing_id) return true;
    if ((row.fscId || null) !== existing.fsc_id) return true;
    if ((row.qualityId || null) !== existing.quality_id) return true;
    if ((row.thickness || null) !== existing.thickness) return true;
    if ((row.width || null) !== existing.width) return true;
    if ((row.length || null) !== existing.length) return true;
    if ((row.pieces || null) !== existing.pieces) return true;
    if (row.volumeM3 !== parseFloat(existing.volume_m3)) return true;
    return false;
  }

  // Separate rows into inserts and updates
  const toInsert: { index: number; payload: ReturnType<typeof toDbRow> }[] = [];
  const toUpdate: { id: string; payload: ReturnType<typeof toDbRow> }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    if (!row.dbId) {
      toInsert.push({ index: i, payload: toDbRow(row) });
    } else {
      const existing = existingMap.get(row.dbId);
      if (existing && hasChanged(row, existing)) {
        toUpdate.push({ id: row.dbId, payload: toDbRow(row) });
      }
    }
  }

  // BATCH INSERT
  if (toInsert.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertError } = await (supabase as any)
      .from("portal_production_outputs")
      .insert(toInsert.map((r) => r.payload))
      .select("id");

    if (insertError) {
      console.error("Failed to insert output rows:", insertError);
      return { success: false, error: `Failed to save outputs: ${insertError.message}`, code: "INSERT_FAILED" };
    }

    // Map returned IDs back to client indices
    for (let j = 0; j < toInsert.length; j++) {
      insertedIds[toInsert[j]!.index] = (inserted as { id: string }[])[j]!.id;
    }
  }

  // UPDATE only changed rows (individual queries — Supabase doesn't support batch update)
  for (const { id, payload } of toUpdate) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("portal_production_outputs")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      console.error(`Failed to update output row ${id}:`, updateError);
      return { success: false, error: `Failed to update output: ${updateError.message}`, code: "UPDATE_FAILED" };
    }
  }

  return { success: true, data: { insertedIds } };
}
