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

async function resetSandingCounter() {
  console.log("Resetting Sanding (SD) counter to 0...\n");

  // Check current counter
  const counters = await supabaseRequest(
    `production_package_counters?process_code=eq.SD&select=*`
  );

  if (counters && counters.length > 0) {
    for (const c of counters) {
      console.log(`Current counter for org ${c.organisation_id}: last_number = ${c.last_number}`);
    }

    // Update all SD counters to 0
    const updated = await supabaseRequest(
      `production_package_counters?process_code=eq.SD`,
      {
        method: "PATCH",
        body: JSON.stringify({ last_number: 0 }),
      }
    );
    console.log("\n✓ Sanding counters reset to 0");
  } else {
    console.log("No Sanding counters found");
  }
}

resetSandingCounter().catch(console.error);
