import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import { AccessDeniedHandler } from "@/components/AccessDeniedHandler";
import { getProducerMetrics, getProcessBreakdown } from "@/features/dashboard/actions";
import { ProducerDashboardMetrics } from "@/features/dashboard/components/ProducerDashboardMetrics";
import { ProcessBreakdownTable } from "@/features/dashboard/components/ProcessBreakdownTable";

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
 *
 * Fetches real metrics and process breakdown data.
 * Shows metric cards, per-process table, and quick action links.
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
async function ProducerDashboardContent() {
  const [metricsResult, breakdownResult] = await Promise.all([
    getProducerMetrics(),
    getProcessBreakdown(),
  ]);

  // Handle errors - show user-friendly message instead of silently failing
  const hasError = !metricsResult.success || !breakdownResult.success;
  if (hasError) {
    console.error("[Dashboard] Failed to load metrics:", {
      metricsError: !metricsResult.success ? metricsResult.error : null,
      breakdownError: !breakdownResult.success ? breakdownResult.error : null,
    });
  }

  const metrics = metricsResult.success ? metricsResult.data : null;
  const breakdown = breakdownResult.success ? breakdownResult.data : [];
  const hasProduction = metrics && metrics.totalProductionVolumeM3 > 0;

  // Show error state if data failed to load
  if (hasError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 shadow-sm text-center">
        <p className="text-destructive font-medium">
          Failed to load dashboard metrics. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <>
      <ProducerDashboardMetrics metrics={metrics} />

      {hasProduction ? (
        <ProcessBreakdownTable breakdown={breakdown} />
      ) : (
        <div className="rounded-lg border bg-card p-6 shadow-sm text-center">
          <p className="text-muted-foreground">
            Start tracking production to see metrics
          </p>
        </div>
      )}

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/production"
            className="rounded-md border p-4 text-center hover:bg-accent/50 transition-colors"
          >
            New Production
          </Link>
          <Link
            href="/inventory"
            className="rounded-md border p-4 text-center hover:bg-accent/50 transition-colors"
          >
            View Inventory
          </Link>
          <Link
            href="/production?tab=history"
            className="rounded-md border p-4 text-center hover:bg-accent/50 transition-colors"
          >
            Production History
          </Link>
        </div>
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
    </div>
  );
}
