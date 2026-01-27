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
      "Prefer": "return=representation",
      ...options.headers,
    },
  });
  if (!response.ok) {
    console.error(`Error ${response.status}: ${await response.text()}`);
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function syncProductionInputs() {
  console.log("=== Syncing Production Inputs with Current Inventory ===\n");

  // 1. Get all production entries (especially drafts)
  const entries = await supabaseRequest(
    `portal_production_entries?select=id,status,ref_processes(value)&order=created_at.desc`
  );

  if (!entries || entries.length === 0) {
    console.log("No production entries found.");
    return;
  }

  console.log(`Found ${entries.length} production entries:\n`);

  for (const entry of entries) {
    const processName = entry.ref_processes?.value || "Unknown";
    console.log(`\n--- Entry: ${entry.id} ---`);
    console.log(`Process: ${processName}, Status: ${entry.status}`);

    // 2. Get all inputs for this entry (correct column names: pieces_used, volume_m3)
    const inputs = await supabaseRequest(
      `portal_production_inputs?production_entry_id=eq.${entry.id}&select=id,package_id,pieces_used,volume_m3`
    );

    if (!inputs || inputs.length === 0) {
      console.log("  No inputs for this entry.");
      continue;
    }

    console.log(`  Found ${inputs.length} inputs`);

    // 3. For each input, get the current inventory package and update
    for (const input of inputs) {
      const pkg = await supabaseRequest(
        `inventory_packages?id=eq.${input.package_id}&select=id,package_number,pieces,volume_m3`
      );

      if (!pkg || pkg.length === 0) {
        console.log(`  Package ${input.package_id} not found in inventory!`);
        continue;
      }

      const invPkg = pkg[0];
      const invPieces = invPkg.pieces ? parseInt(invPkg.pieces, 10) : null;
      const invVolume = invPkg.volume_m3 ? parseFloat(invPkg.volume_m3) : null;
      const inputPieces = input.pieces_used;
      const inputVolume = input.volume_m3 ? parseFloat(input.volume_m3) : null;

      // Check if update is needed
      if (invPieces !== inputPieces || (invVolume !== null && inputVolume !== null && Math.abs(invVolume - inputVolume) > 0.0001)) {
        console.log(`  Updating input for package ${invPkg.package_number}:`);
        console.log(`    Pieces: ${inputPieces} → ${invPieces}`);
        console.log(`    Volume: ${inputVolume?.toFixed(3) ?? 'null'} → ${invVolume?.toFixed(3) ?? 'null'}`);

        // Update the production input
        await supabaseRequest(
          `portal_production_inputs?id=eq.${input.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              pieces_used: invPieces,
              volume_m3: invVolume,
            }),
          }
        );
        console.log(`    ✓ Updated`);
      } else {
        console.log(`  Package ${invPkg.package_number}: Already in sync`);
      }
    }
  }

  console.log("\n=== Sync Complete ===\n");
}

syncProductionInputs().catch(console.error);
