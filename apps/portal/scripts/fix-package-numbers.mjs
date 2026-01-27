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

async function fixPackageNumbers() {
  // Mapping: old number -> new number
  const renameMap = {
    "N-CA-0085": "N-CA-0052",
    "N-CA-0086": "N-CA-0053",
    "N-CA-0087": "N-CA-0054",
    "N-CA-0088": "N-CA-0055",
    "N-CA-0089": "N-CA-0056",
    "N-CA-0090": "N-CA-0057",
    "N-CA-0091": "N-CA-0058",
  };

  console.log("Renaming packages:\n");

  for (const [oldNum, newNum] of Object.entries(renameMap)) {
    // Find package by old number
    const packages = await supabaseRequest(
      `inventory_packages?package_number=eq.${oldNum}&select=id,package_number`
    );

    if (!packages || packages.length === 0) {
      console.log(`  ${oldNum} - NOT FOUND, skipping`);
      continue;
    }

    const pkg = packages[0];

    // Update to new number
    await supabaseRequest(
      `inventory_packages?id=eq.${pkg.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ package_number: newNum }),
      }
    );

    console.log(`  ${oldNum} → ${newNum} ✓`);
  }

  // Also update the production_outputs table to match
  console.log("\nUpdating production outputs:\n");

  for (const [oldNum, newNum] of Object.entries(renameMap)) {
    const outputs = await supabaseRequest(
      `portal_production_outputs?package_number=eq.${oldNum}&select=id,package_number`
    );

    if (!outputs || outputs.length === 0) {
      continue;
    }

    for (const output of outputs) {
      await supabaseRequest(
        `portal_production_outputs?id=eq.${output.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ package_number: newNum }),
        }
      );
      console.log(`  Output ${oldNum} → ${newNum} ✓`);
    }
  }

  // Reset the counter to 58
  console.log("\nResetting CA counter to 58...");

  const orgs = await supabaseRequest(`organisations?code=eq.INE&select=id`);
  const orgId = orgs[0].id;

  await supabaseRequest(
    `production_package_counters?organisation_id=eq.${orgId}&process_code=eq.CA`,
    {
      method: "PATCH",
      body: JSON.stringify({ last_sequence: 58 }),
    }
  );

  console.log("✓ Counter set to 58");
  console.log("\n========================================");
  console.log("Done! Next CA package will be N-CA-0059");
  console.log("========================================\n");
}

fixPackageNumbers().catch(console.error);
