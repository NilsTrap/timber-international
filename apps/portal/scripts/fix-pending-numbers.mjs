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

async function fixPendingNumbers() {
  console.log("=== Fixing Output Package Numbers to Pending ===\n");

  // Get the finger jointing entry ID
  const entries = await supabaseRequest(
    "portal_production_entries?select=id,status,ref_processes(value)&order=created_at.desc"
  );

  const fjEntry = entries?.find(e => e.ref_processes?.value === "Finger Jointing");
  if (!fjEntry) {
    console.log("No Finger Jointing entry found");
    return;
  }

  console.log(`Found Finger Jointing entry: ${fjEntry.id}`);
  console.log(`Status: ${fjEntry.status}\n`);

  // Get all outputs for this entry
  const outputs = await supabaseRequest(
    `portal_production_outputs?production_entry_id=eq.${fjEntry.id}&select=id,package_number`
  );

  console.log(`Found ${outputs?.length || 0} outputs\n`);

  // Update each output to pending
  for (const output of outputs || []) {
    console.log(`Updating ${output.package_number} → N-FJ-pending`);
    await supabaseRequest(
      `portal_production_outputs?id=eq.${output.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ package_number: "N-FJ-pending" }),
      }
    );
  }

  console.log("\n=== Done ===");
}

fixPendingNumbers().catch(console.error);
