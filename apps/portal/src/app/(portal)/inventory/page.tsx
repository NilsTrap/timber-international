import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { getSession, isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Inventory",
};

/**
 * Inventory Page
 *
 * Shows inventory based on user role:
 * - Admin: Full inventory management (Epic 2)
 * - Producer: Read-only view of facility inventory (Epic 3)
 *
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
export default async function InventoryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userIsAdmin = isAdmin(session);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          {userIsAdmin
            ? "Manage inventory across all facilities"
            : "View current inventory at your facility"}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            {userIsAdmin ? "Inventory Management" : "Facility Inventory"}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {userIsAdmin
              ? "Record inventory sent to producers and view inventory levels across all facilities. This feature will be implemented in Stories 2.2 - 2.3."
              : "View current inventory available at your facility for production. This feature will be implemented in Stories 3.1 - 3.2."}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Coming in {userIsAdmin ? "Epic 2: Admin Inventory Management" : "Epic 3: Producer Inventory View"}
          </p>
        </div>
      </div>
    </div>
  );
}
