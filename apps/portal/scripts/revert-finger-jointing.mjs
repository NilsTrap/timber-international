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

async function revertFingerJointing() {
  console.log("=== Reverting Finger Jointing Production ===\n");

  // 1. Find the finger jointing production entry
  const entries = await supabaseRequest(
    `portal_production_entries?select=id,status,ref_processes(value)&order=created_at.desc`
  );

  const fjEntry = entries?.find(e => e.ref_processes?.value === "Finger Jointing");

  if (!fjEntry) {
    console.log("No Finger Jointing production entry found!");
    return;
  }

  console.log(`Found Finger Jointing entry: ${fjEntry.id}`);
  console.log(`Current status: ${fjEntry.status}\n`);

  if (fjEntry.status === "draft") {
    console.log("Entry is already a draft. Nothing to revert.");
    return;
  }

  const entryId = fjEntry.id;

  // 2. Get all inputs for this entry
  console.log("Fetching inputs...");
  const inputs = await supabaseRequest(
    `portal_production_inputs?production_entry_id=eq.${entryId}&select=id,package_id,pieces_used,volume_m3`
  );

  console.log(`Found ${inputs?.length || 0} inputs\n`);

  // 3. Restore input packages (change status from consumed back, restore pieces/volume)
  console.log("Restoring input packages...");
  for (const input of inputs || []) {
    // Get current package info
    const pkgResult = await supabaseRequest(
      `inventory_packages?id=eq.${input.package_id}&select=id,package_number,status,pieces,volume_m3`
    );

    if (!pkgResult || pkgResult.length === 0) {
      console.log(`  Package ${input.package_id} not found`);
      continue;
    }

    const pkg = pkgResult[0];
    console.log(`  Restoring ${pkg.package_number}:`);
    console.log(`    Pieces: ${pkg.pieces} → ${input.pieces_used}`);
    console.log(`    Volume: ${pkg.volume_m3} → ${input.volume_m3}`);

    // Determine original status based on package source
    // Packages from shipments should go back to their original status
    // Packages from production should go back to "produced"
    const pkgDetails = await supabaseRequest(
      `inventory_packages?id=eq.${input.package_id}&select=shipment_id,production_entry_id`
    );

    let newStatus = "available";
    if (pkgDetails?.[0]?.production_entry_id) {
      newStatus = "produced";
    }

    await supabaseRequest(
      `inventory_packages?id=eq.${input.package_id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          pieces: String(input.pieces_used),
          volume_m3: input.volume_m3,
          status: newStatus,
        }),
      }
    );
    console.log(`    Status: consumed → ${newStatus} ✓`);
  }

  // 4. Delete output packages from inventory that were created by this production
  console.log("\nDeleting output packages from inventory...");
  const outputPackages = await supabaseRequest(
    `inventory_packages?production_entry_id=eq.${entryId}&select=id,package_number`
  );

  for (const pkg of outputPackages || []) {
    console.log(`  Deleting ${pkg.package_number}...`);
    await supabaseRequest(
      `inventory_packages?id=eq.${pkg.id}`,
      { method: "DELETE" }
    );
    console.log(`    ✓ Deleted`);
  }

  // 5. Reset the production entry status back to draft
  console.log("\nResetting production entry to draft...");
  await supabaseRequest(
    `portal_production_entries?id=eq.${entryId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "draft" }),
    }
  );
  console.log("  ✓ Status set to draft");

  // 6. Reset the FJ package counter if needed
  // Get the highest FJ package number that still exists
  const fjPackages = await supabaseRequest(
    `inventory_packages?package_number=like.N-FJ-%&select=package_number&order=package_number.desc&limit=1`
  );

  if (fjPackages && fjPackages.length > 0) {
    const lastNum = fjPackages[0].package_number;
    const match = lastNum.match(/N-FJ-(\d+)/);
    if (match) {
      const lastSeq = parseInt(match[1], 10);
      console.log(`\nResetting FJ counter to ${lastSeq}...`);

      // Get org ID
      const orgs = await supabaseRequest(`organisations?code=eq.INE&select=id`);
      if (orgs?.[0]) {
        await supabaseRequest(
          `production_package_counters?organisation_id=eq.${orgs[0].id}&process_code=eq.FJ`,
          {
            method: "PATCH",
            body: JSON.stringify({ last_sequence: lastSeq }),
          }
        );
        console.log(`  ✓ Counter set to ${lastSeq}`);
      }
    }
  } else {
    // No FJ packages exist, reset counter to 0
    console.log("\nNo FJ packages found, resetting counter to 0...");
    const orgs = await supabaseRequest(`organisations?code=eq.INE&select=id`);
    if (orgs?.[0]) {
      await supabaseRequest(
        `production_package_counters?organisation_id=eq.${orgs[0].id}&process_code=eq.FJ`,
        {
          method: "PATCH",
          body: JSON.stringify({ last_sequence: 0 }),
        }
      );
      console.log("  ✓ Counter set to 0");
    }
  }

  console.log("\n=== Revert Complete ===");
  console.log("Finger Jointing production is now back to draft status.");
  console.log("Input packages have been restored.");
  console.log("Output packages have been deleted from inventory.\n");
}

revertFingerJointing().catch(console.error);
