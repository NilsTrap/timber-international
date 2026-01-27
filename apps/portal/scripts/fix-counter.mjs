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

async function fixCounter() {
  // Get Inerce organisation ID
  const orgs = await supabaseRequest(`organisations?code=eq.INE&select=id,name,code`);
  if (!orgs || orgs.length === 0) {
    console.error("Inerce organisation not found");
    return;
  }
  const orgId = orgs[0].id;
  console.log(`Organisation: ${orgs[0].name} (${orgs[0].code}), ID: ${orgId}\n`);

  // Find the actual max CA package number in inventory for this org
  const packages = await supabaseRequest(
    `inventory_packages?package_number=like.N-CA-*&organisation_id=eq.${orgId}&select=package_number&order=package_number.desc&limit=10`
  );
  console.log("Latest N-CA-* packages in inventory for Inerce:");
  for (const pkg of packages || []) {
    console.log(`  ${pkg.package_number}`);
  }

  // Extract max sequence
  let maxSeq = 0;
  for (const pkg of packages || []) {
    const match = pkg.package_number.match(/^N-CA-(\d+)$/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  }
  console.log(`\nMax CA sequence in inventory: ${maxSeq}`);
  console.log(`Next package should be: N-CA-${String(maxSeq + 1).padStart(4, '0')}`);

  // Now reset the counter using RPC
  console.log(`\nResetting counter to ${maxSeq}...`);

  // Direct SQL via RPC isn't available, so let's update via REST
  // First check if counter exists
  const counters = await supabaseRequest(
    `production_package_counters?organisation_id=eq.${orgId}&process_code=eq.CA&select=*`
  );

  if (counters && counters.length > 0) {
    console.log(`Current counter value: ${counters[0].last_sequence}`);

    // Update existing counter
    const updated = await supabaseRequest(
      `production_package_counters?organisation_id=eq.${orgId}&process_code=eq.CA`,
      {
        method: "PATCH",
        body: JSON.stringify({ last_sequence: maxSeq }),
      }
    );
    console.log("✓ Counter updated to", maxSeq);
  } else {
    console.log("Counter not found, creating...");
    await supabaseRequest(
      `production_package_counters`,
      {
        method: "POST",
        body: JSON.stringify({
          organisation_id: orgId,
          process_code: "CA",
          last_sequence: maxSeq
        }),
      }
    );
    console.log("✓ Counter created with value", maxSeq);
  }
}

fixCounter().catch(console.error);
