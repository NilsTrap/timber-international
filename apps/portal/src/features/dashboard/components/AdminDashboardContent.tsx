"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminDashboardMetrics } from "./AdminDashboardMetrics";
import { AdminProcessBreakdownTable } from "./AdminProcessBreakdownTable";
import { ProcessDetailView } from "./ProcessDetailView";
import { ExportButton } from "./ExportButton";
import type {
  AdminMetrics,
  AdminProcessBreakdownItem,
} from "../types";

interface AdminDashboardContentProps {
  initialMetrics: AdminMetrics | null;
  initialBreakdown: AdminProcessBreakdownItem[];
  hasError: boolean;
}

/**
 * Admin Dashboard Content (Client Component)
 *
 * Receives initial data from server, handles:
 * - Process detail modal state
 * - Export functionality
 *
 * Note: Date range filtering is deferred for now to keep initial load simple.
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
export function AdminDashboardContent({
  initialMetrics,
  initialBreakdown,
  hasError,
}: AdminDashboardContentProps) {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  // Error state
  if (hasError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 shadow-sm text-center">
        <p className="text-destructive font-medium">
          Failed to load dashboard metrics. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Handle process row click
  const handleProcessClick = (processId: string) => {
    setSelectedProcessId(processId);
  };

  // Handle modal close
  const handleCloseProcessDetail = () => {
    setSelectedProcessId(null);
  };

  // Empty state
  const hasProduction = initialMetrics && initialMetrics.entryCount > 0;

  return (
    <>
      <AdminDashboardMetrics metrics={initialMetrics} />

      {hasProduction ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Efficiency Overview</h2>
            <ExportButton data={initialBreakdown} />
          </div>
          <AdminProcessBreakdownTable
            breakdown={initialBreakdown}
            onProcessClick={handleProcessClick}
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-6 shadow-sm text-center">
          <p className="text-muted-foreground">
            No production data recorded yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Production efficiency metrics will appear here once producers start logging production.
          </p>
        </div>
      )}

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/reference"
            className="rounded-md border p-4 text-center hover:bg-accent/50 transition-colors"
          >
            Reference Data
          </Link>
          <Link
            href="/admin/organisations"
            className="rounded-md border p-4 text-center hover:bg-accent/50 transition-colors"
          >
            Organisations
          </Link>
          <Link
            href="/inventory"
            className="rounded-md border p-4 text-center hover:bg-accent/50 transition-colors"
          >
            View Inventory
          </Link>
        </div>
      </div>

      {/* Process Detail Modal */}
      <ProcessDetailView
        processId={selectedProcessId}
        onClose={handleCloseProcessDetail}
      />
    </>
  );
}
