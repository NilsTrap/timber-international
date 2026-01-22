import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import { AccessDeniedHandler } from "@/components/AccessDeniedHandler";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Admin Dashboard Content
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
function AdminDashboardContent() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Inventory
          </h3>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="text-xs text-muted-foreground">Cubic meters across all facilities</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Products
          </h3>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="text-xs text-muted-foreground">In catalog</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Producer Efficiency
          </h3>
          <p className="mt-2 text-2xl font-semibold">--%</p>
          <p className="text-xs text-muted-foreground">Average outcome rate</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            Add Product
          </div>
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            Record Inventory
          </div>
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            View Reports
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Features coming in Epic 2 & 5
        </p>
      </div>
    </>
  );
}

/**
 * Producer Dashboard Content
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
function ProducerDashboardContent() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Inventory
          </h3>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="text-xs text-muted-foreground">Cubic meters</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Production Volume
          </h3>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Outcome Rate
          </h3>
          <p className="mt-2 text-2xl font-semibold">--%</p>
          <p className="text-xs text-muted-foreground">Average efficiency</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Waste Rate
          </h3>
          <p className="mt-2 text-2xl font-semibold">--%</p>
          <p className="text-xs text-muted-foreground">Average loss</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            New Production Entry
          </div>
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            View Inventory
          </div>
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            Production History
          </div>
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            Efficiency Reports
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Features coming in Epic 3-5
        </p>
      </div>
    </>
  );
}

/**
 * Dashboard Page
 *
 * Server Component that renders role-specific dashboard content.
 * - Admin sees: "Admin Overview" with inventory/product/efficiency metrics
 * - Producer sees: "Production Dashboard" with production-focused metrics
 */
export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userIsAdmin = isAdmin(session);

  return (
    <div className="space-y-6">
      {/* Client component to handle access_denied query param */}
      <Suspense fallback={null}>
        <AccessDeniedHandler />
      </Suspense>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {userIsAdmin ? "Admin Overview" : "Production Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {userIsAdmin
            ? "Manage inventory, products, and view producer efficiency"
            : "Welcome to the Timber World Production Portal"}
        </p>
      </div>

      {userIsAdmin ? <AdminDashboardContent /> : <ProducerDashboardContent />}

      <p className="text-center text-xs text-muted-foreground">
        Portal Foundation - Story 1.4 Complete
      </p>
    </div>
  );
}
