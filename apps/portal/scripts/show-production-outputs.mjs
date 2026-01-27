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
    console.error(`Error ${response.status}: ${await response.text()}`);
    return null;
  }
  return response.json();
}

async function showOutputs() {
  console.log("=== Production Entries ===\n");

  // Get all production entries
  const entries = await supabaseRequest(
    "portal_production_entries?select=id,status,validated_at,ref_processes(value)&order=created_at.desc"
  );

  for (const entry of entries || []) {
    console.log(`${entry.ref_processes?.value} | Status: ${entry.status} | Validated: ${entry.validated_at || 'N/A'}`);
  }

  console.log("\n=== Finger Jointing Outputs (ordered by package_number) ===\n");

  // Find the FJ entry
  const fjEntry = entries?.find(e => e.ref_processes?.value === "Finger Jointing");
  if (!fjEntry) {
    console.log("No Finger Jointing entry found");
    return;
  }

  // Get outputs
  const outputs = await supabaseRequest(
    `portal_production_outputs?production_entry_id=eq.${fjEntry.id}&select=id,package_number,thickness,width,length,pieces,volume_m3&order=package_number.asc`
  );

  console.log("Package Number     | Dimensions        | Pieces | Volume m³");
  console.log("-------------------|-------------------|--------|----------");
  for (const o of outputs || []) {
    const dims = `${o.thickness}x${o.width}x${o.length}`.padEnd(17);
    const pieces = String(o.pieces).padStart(6);
    const volume = Number(o.volume_m3).toFixed(3).padStart(8);
    console.log(`${o.package_number.padEnd(18)} | ${dims} | ${pieces} | ${volume}`);
  }

  console.log("\n=== Inventory Packages (from validated productions) ===\n");

  // Check if there are any inventory packages from this production
  const inventoryPackages = await supabaseRequest(
    `inventory_packages?production_entry_id=eq.${fjEntry.id}&select=id,package_number,shipment_id,status,thickness,width,length,pieces,volume_m3&order=package_number.asc`
  );

  if (!inventoryPackages || inventoryPackages.length === 0) {
    console.log("No inventory packages yet (production not validated)");
  } else {
    console.log("Package Number     | Shipment ID                          | Status   | Dimensions        | Pieces | Volume m³");
    console.log("-------------------|--------------------------------------|----------|-------------------|--------|----------");
    for (const p of inventoryPackages) {
      const dims = `${p.thickness}x${p.width}x${p.length}`.padEnd(17);
      const pieces = String(p.pieces).padStart(6);
      const volume = Number(p.volume_m3).toFixed(3).padStart(8);
      const shipmentId = (p.shipment_id || 'N/A').toString().padEnd(36);
      console.log(`${p.package_number.padEnd(18)} | ${shipmentId} | ${p.status.padEnd(8)} | ${dims} | ${pieces} | ${volume}`);
    }
  }

  // Also show all validated production inventory packages
  console.log("\n=== All Inventory Packages with Shipment Info ===\n");

  const allInventory = await supabaseRequest(
    `inventory_packages?select=id,package_number,shipment_id,shipments(shipment_code),status,production_entry_id,thickness,width,length,pieces,volume_m3&order=package_number.asc&limit=50`
  );

  console.log("Package Number     | Shipment Code    | Status   | Dimensions        | Pieces | Volume m³");
  console.log("-------------------|------------------|----------|-------------------|--------|----------");
  for (const p of allInventory || []) {
    const dims = `${p.thickness || '?'}x${p.width || '?'}x${p.length || '?'}`.padEnd(17);
    const pieces = String(p.pieces || '?').padStart(6);
    const volume = Number(p.volume_m3 || 0).toFixed(3).padStart(8);
    const shipmentCode = (p.shipments?.shipment_code || 'N/A').toString().padEnd(16);
    console.log(`${(p.package_number || 'N/A').padEnd(18)} | ${shipmentCode} | ${(p.status || '?').padEnd(8)} | ${dims} | ${pieces} | ${volume}`);
  }
}

showOutputs().catch(console.error);
