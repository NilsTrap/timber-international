const SUPABASE_URL = "https://psmramegggsciirwldjz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbXJhbWVnZ2dzY2lpcndsZGp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODA2NjcxOSwiZXhwIjoyMDgzNjQyNzE5fQ.TPvIkwhonb_jMvwVf4OzeIhLHoOyvlzBvk5W8r0Z4MM";

async function runSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("SQL Error:", text);
    return null;
  }
  return response.json();
}

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

async function addSortOrder() {
  console.log("=== Adding sort_order to portal_production_outputs ===\n");

  // First, let's set sort_order on existing FJ outputs based on their current order
  const outputs = await supabaseRequest(
    "portal_production_outputs?production_entry_id=eq.251ccb75-c967-4b1c-b747-d3ca57483a20&select=id,package_number,thickness,width,length,pieces&order=id.asc"
  );

  console.log(`Found ${outputs?.length || 0} outputs. Setting sort_order...\n`);

  for (let i = 0; i < (outputs?.length || 0); i++) {
    const output = outputs[i];
    console.log(`Setting sort_order=${i} for ${output.thickness}x${output.width}x${output.length} (${output.pieces} pcs)`);

    await supabaseRequest(
      `portal_production_outputs?id=eq.${output.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ sort_order: i }),
      }
    );
  }

  console.log("\n=== Done ===");
}

addSortOrder().catch(console.error);
