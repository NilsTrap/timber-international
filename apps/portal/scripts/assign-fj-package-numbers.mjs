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

async function rpc(functionName, params) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${functionName}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    console.error(`RPC Error ${response.status}: ${await response.text()}`);
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function assignFJPackageNumbers() {
  console.log("=== Assigning Real Package Numbers to FJ Outputs ===\n");

  // Find the Finger Jointing draft entry
  const entries = await supabaseRequest(
    "portal_production_entries?select=id,status,organisation_id,ref_processes(value,code)&order=created_at.desc"
  );

  const fjEntry = entries?.find(e => e.ref_processes?.value === "Finger Jointing" && e.status === "draft");
  if (!fjEntry) {
    console.log("No Finger Jointing draft entry found");
    return;
  }

  console.log(`Found Finger Jointing draft: ${fjEntry.id}`);
  console.log(`Organisation: ${fjEntry.organisation_id}`);
  console.log(`Process code: ${fjEntry.ref_processes?.code}\n`);

  // Get all outputs ordered by id (preserves original creation order)
  const outputs = await supabaseRequest(
    `portal_production_outputs?production_entry_id=eq.${fjEntry.id}&select=id,package_number,thickness,width,length,pieces&order=id.asc`
  );

  console.log(`Found ${outputs?.length || 0} outputs\n`);

  // Assign real package numbers using the RPC
  for (let i = 0; i < (outputs?.length || 0); i++) {
    const output = outputs[i];

    // Generate package number using the same RPC as saveProductionOutputs
    const packageNumber = await rpc("generate_production_package_number", {
      p_organisation_id: fjEntry.organisation_id,
      p_process_code: fjEntry.ref_processes?.code,
    });

    if (!packageNumber) {
      console.error(`Failed to generate package number for output ${i + 1}`);
      continue;
    }

    console.log(`${output.package_number} → ${packageNumber} | ${output.thickness}x${output.width}x${output.length} | ${output.pieces} pcs`);

    // Update the output with the real package number
    await supabaseRequest(
      `portal_production_outputs?id=eq.${output.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ package_number: packageNumber }),
      }
    );
  }

  console.log("\n=== Done ===");
}

assignFJPackageNumbers().catch(console.error);
