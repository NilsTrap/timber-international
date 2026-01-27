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
    const text = await response.text();
    console.error(`Error ${response.status}: ${text}`);
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function fixFJNumbering() {
  console.log("=== Fixing FJ Package Numbering ===\n");

  // 1. Delete all FJ outputs from the draft
  console.log("Deleting FJ outputs from draft...");
  const deleted = await supabaseRequest(
    "portal_production_outputs?package_number=like.N-FJ-%",
    { method: "DELETE" }
  );
  console.log("Deleted FJ outputs:", deleted?.length || 0);

  // 2. Reset the FJ counter to 5 (so next will be 0006)
  console.log("\nResetting FJ counter to 5...");
  const updated = await supabaseRequest(
    "production_package_counters?process_code=eq.FJ",
    {
      method: "PATCH",
      body: JSON.stringify({ last_number: 5 }),
    }
  );
  console.log("Counter updated:", updated);

  console.log("\n=== Done ===");
  console.log("FJ counter is now set to 5.");
  console.log("Next FJ package will be N-FJ-0006.");
  console.log("Please re-add outputs to the finger jointing draft.\n");
}

fixFJNumbering().catch(console.error);
