import { formatVolume, formatPercent } from "@/lib/utils";
import type { AdminMetrics } from "../types";

interface AdminDashboardMetricsProps {
  metrics: AdminMetrics | null;
}

/**
 * Admin Dashboard Metric Cards
 *
 * Displays 4 metric cards in a grid:
 * - Total Inventory (all packages volume m3)
 * - Total Production Volume (all-time output m3)
 * - Outcome Rate (weighted average %)
 * - Waste Rate (weighted average %)
 *
 * Shows "--" for zero/empty values.
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
export function AdminDashboardMetrics({ metrics }: AdminDashboardMetricsProps) {
  const hasProductionData = metrics && metrics.entryCount > 0;
  const hasInventoryData = metrics && metrics.packageCount > 0;

  const cards = [
    {
      title: "Total Inventory",
      value:
        hasInventoryData && metrics.totalInventoryM3 > 0
          ? `${formatVolume(metrics.totalInventoryM3)} m\u00B3`
          : "--",
      subtitle: `${metrics?.packageCount ?? 0} packages`,
    },
    {
      title: "Total Production Volume",
      value:
        hasProductionData && metrics.totalProductionVolumeM3 > 0
          ? `${formatVolume(metrics.totalProductionVolumeM3)} m\u00B3`
          : "--",
      subtitle: `${hasProductionData ? metrics.entryCount : 0} production entries`,
    },
    {
      title: "Overall Outcome Rate",
      value:
        hasProductionData && metrics.overallOutcomePercent > 0
          ? `${formatPercent(metrics.overallOutcomePercent)}%`
          : "--",
      subtitle: "Weighted average",
    },
    {
      title: "Overall Waste Rate",
      value:
        hasProductionData && metrics.overallWastePercent > 0
          ? `${formatPercent(metrics.overallWastePercent)}%`
          : "--",
      subtitle: "Weighted average",
    },
    {
      title: "Active Organizations",
      value: metrics?.activeOrganizations?.toString() ?? "0",
      subtitle: "Activity in last 30 days",
    },
    {
      title: "Pending Shipments",
      value: metrics?.pendingShipments?.toString() ?? "0",
      subtitle: "Awaiting acceptance",
      highlight: metrics?.pendingShipments && metrics.pendingShipments > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-lg border p-6 shadow-sm ${
            card.highlight
              ? "bg-yellow-50 border-yellow-200"
              : "bg-card"
          }`}
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            {card.title}
          </h3>
          <p className={`mt-2 text-2xl font-semibold tabular-nums ${
            card.highlight ? "text-yellow-700" : ""
          }`}>
            {card.value}
          </p>
          <p className="text-xs text-muted-foreground">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
