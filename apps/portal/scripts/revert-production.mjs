/**
 * Script to revert a failed production validation
 * Run with: node scripts/revert-production.mjs
 */

const PRODUCTION_ENTRY_ID = "213f0974-5cdb-4a8e-adb3-6d61c6f38d1e";
const SUPABASE_URL = "https://psmramegggsciirwldjz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbXJhbWVnZ2dzY2lpcndsZGp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODA2NjcxOSwiZXhwIjoyMDgzNjQyNzE5fQ.TPvIkwhonb_jMvwVf4OzeIhLHoOyvlzBvk5W8r0Z4MM";

async function supabaseRequest(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.method === "DELETE" ? "return=representation" : "return=representation",
      ...options.headers,
    },
  });

  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(`Supabase error: ${response.status} ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function revertProduction() {
  console.log(`\nReverting production entry: ${PRODUCTION_ENTRY_ID}\n`);

  // 1. Fetch entry
  const entries = await supabaseRequest(
    `portal_production_entries?id=eq.${PRODUCTION_ENTRY_ID}&select=id,status`
  );

  if (!entries || entries.length === 0) {
    console.error("Entry not found");
    process.exit(1);
  }

  const entry = entries[0];
  console.log(`Entry status: ${entry.status}`);

  // 2. Fetch inputs
  const inputs = await supabaseRequest(
    `portal_production_inputs?production_entry_id=eq.${PRODUCTION_ENTRY_ID}&select=id,package_id,pieces_used,volume_m3`
  );

  console.log(`Found ${inputs?.length || 0} input(s)`);

  // 3. Restore each input package
  let restoredCount = 0;
  for (const input of inputs || []) {
    const packages = await supabaseRequest(
      `inventory_packages?id=eq.${input.package_id}&select=id,package_number,pieces,volume_m3,status`
    );

    if (!packages || packages.length === 0) {
      console.error(`  Package not found: ${input.package_id}`);
      continue;
    }

    const pkg = packages[0];
    console.log(`\n  Package: ${pkg.package_number}`);
    console.log(`    Current: pieces=${pkg.pieces}, volume=${pkg.volume_m3}, status=${pkg.status}`);
    console.log(`    Input used: pieces=${input.pieces_used}, volume=${input.volume_m3}`);

    if (input.pieces_used && input.pieces_used > 0) {
      const currentPieces = parseInt(pkg.pieces || "0", 10);
      const restoredPieces = currentPieces + input.pieces_used;

      // Calculate restored volume
      let restoredVolume = Number(pkg.volume_m3) || 0;
      if (currentPieces > 0) {
        const ratio = restoredPieces / currentPieces;
        restoredVolume = restoredVolume * ratio;
      } else if (input.volume_m3) {
        restoredVolume = restoredVolume + Number(input.volume_m3);
      }

      const newStatus = pkg.status === "consumed" ? "produced" : pkg.status;

      console.log(`    Restoring to: pieces=${restoredPieces}, volume=${restoredVolume.toFixed(3)}, status=${newStatus}`);

      await supabaseRequest(
        `inventory_packages?id=eq.${pkg.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            pieces: String(restoredPieces),
            volume_m3: restoredVolume,
            status: newStatus,
          }),
        }
      );

      console.log(`    ✓ Restored`);
      restoredCount++;
    } else if (input.volume_m3 && Number(input.volume_m3) > 0) {
      const currentVolume = Number(pkg.volume_m3) || 0;
      const restoredVolume = currentVolume + Number(input.volume_m3);
      const newStatus = pkg.status === "consumed" ? "produced" : pkg.status;

      console.log(`    Restoring to: volume=${restoredVolume.toFixed(3)}, status=${newStatus}`);

      await supabaseRequest(
        `inventory_packages?id=eq.${pkg.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            volume_m3: restoredVolume,
            status: newStatus,
          }),
        }
      );

      console.log(`    ✓ Restored`);
      restoredCount++;
    }
  }

  // 4. Delete any output inventory packages created from this entry
  const deletedOutputs = await supabaseRequest(
    `inventory_packages?production_entry_id=eq.${PRODUCTION_ENTRY_ID}&select=id,package_number`,
    { method: "DELETE" }
  );

  console.log(`\nDeleted ${deletedOutputs?.length || 0} output package(s)`);
  for (const pkg of deletedOutputs || []) {
    console.log(`  - ${pkg.package_number}`);
  }

  // 5. Reset entry status to draft
  await supabaseRequest(
    `portal_production_entries?id=eq.${PRODUCTION_ENTRY_ID}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "draft",
        validated_at: null,
        total_input_m3: null,
        total_output_m3: null,
        outcome_percentage: null,
        waste_percentage: null,
      }),
    }
  );

  console.log(`\n✓ Entry status reset to "draft"`);
  console.log(`\n========================================`);
  console.log(`Revert complete!`);
  console.log(`  - Restored ${restoredCount} input package(s)`);
  console.log(`  - Deleted ${deletedOutputs?.length || 0} output package(s)`);
  console.log(`========================================\n`);
}

revertProduction().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
