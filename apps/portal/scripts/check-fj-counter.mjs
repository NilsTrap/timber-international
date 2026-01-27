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

async function check() {
  // Check FJ packages in inventory
  const fjPackages = await supabaseRequest(
    "inventory_packages?package_number=like.N-FJ-%&select=package_number&order=package_number.desc"
  );
  console.log("FJ packages in inventory:", fjPackages);

  // Check FJ counter
  const counter = await supabaseRequest(
    "production_package_counters?process_code=eq.FJ&select=*"
  );
  console.log("FJ counter:", counter);

  // Check FJ outputs in the draft
  const outputs = await supabaseRequest(
    "portal_production_outputs?select=id,package_number,production_entry_id&order=created_at.asc"
  );
  console.log("Production outputs:", outputs?.slice(0, 20));
}

check().catch(console.error);
