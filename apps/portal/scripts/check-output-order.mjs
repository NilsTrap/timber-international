const SUPABASE_URL = "https://psmramegggsciirwldjz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbXJhbWVnZ2dzY2lpcndsZGp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODA2NjcxOSwiZXhwIjoyMDgzNjQyNzE5fQ.TPvIkwhonb_jMvwVf4OzeIhLHoOyvlzBvk5W8r0Z4MM";

async function supabaseRequest(path) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const response = await fetch(url, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.error(`Error ${response.status}`);
    return null;
  }
  return response.json();
}

async function checkOrder() {
  // Get the finger jointing outputs
  const outputs = await supabaseRequest(
    "portal_production_outputs?production_entry_id=eq.251ccb75-c967-4b1c-b747-d3ca57483a20&select=id,package_number,created_at,thickness,width,length,pieces&order=created_at.asc"
  );

  console.log("Outputs ordered by created_at:\n");
  for (const o of outputs || []) {
    console.log(`${o.package_number} | ${o.created_at} | ${o.thickness}x${o.width}x${o.length} | ${o.pieces} pcs`);
  }

  // Check the table schema
  console.log("\n\nChecking for sort_order column...");
  const schema = await supabaseRequest(
    "portal_production_outputs?limit=1"
  );
  console.log("Columns:", Object.keys(schema?.[0] || {}));
}

checkOrder().catch(console.error);
