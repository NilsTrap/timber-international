import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSession, isSuperAdmin } from "@/lib/auth";
import { getActiveOrganisations } from "@/features/shipments/actions/getActiveOrganisations";
import { getAllPendingShipmentCount } from "@/features/shipments/actions/getAllShipments";
import { ShipmentsPageContent } from "./ShipmentsPageContent";

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { tab } = await searchParams;
  const isSuperAdminUser = isSuperAdmin(session);
  const isOrgUser = !!session.organisationId;

  // Org users without organization assignment can't access shipments
  if (!isSuperAdminUser && !isOrgUser) {
    redirect("/dashboard");
  }

  // For Super Admin, fetch organizations for the All Shipments filter
  let organizations: Array<{ id: string; code: string; name: string }> = [];
  let allPendingCount = 0;

  if (isSuperAdminUser) {
    const [orgsResult, pendingResult] = await Promise.all([
      getActiveOrganisations(),
      getAllPendingShipmentCount(),
    ]);
    if (orgsResult.success) {
      organizations = orgsResult.data;
    }
    if (pendingResult.success) {
      allPendingCount = pendingResult.data;
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ShipmentsPageContent
        initialTab={tab as "outgoing" | "incoming" | "all" | undefined}
        isSuperAdmin={isSuperAdminUser}
        isOrgUser={isOrgUser}
        organizations={organizations}
        allPendingCount={allPendingCount}
      />
    </Suspense>
  );
}
