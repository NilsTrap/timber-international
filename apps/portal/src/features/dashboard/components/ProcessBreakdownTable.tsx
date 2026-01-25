"use client";

import { useRouter } from "next/navigation";
import { formatVolume, formatPercent } from "@/lib/utils";
import type { ProcessBreakdownItem } from "../types";

interface ProcessBreakdownTableProps {
  breakdown: ProcessBreakdownItem[];
}

/** Get color class based on outcome percentage */
function getOutcomeColor(percent: number): string {
  if (percent >= 80) return "text-green-600";
  if (percent >= 60) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Process Breakdown Table
 *
 * Displays per-process production statistics with color-coded outcome %.
 * Rows are clickable — navigates to Production History filtered by process.
 */
export function ProcessBreakdownTable({ breakdown }: ProcessBreakdownTableProps) {
  const router = useRouter();

  if (breakdown.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium">Per-Process Breakdown</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Process</th>
            <th className="px-4 py-3 text-right font-medium">Entries</th>
            <th className="px-4 py-3 text-right font-medium">Input m³</th>
            <th className="px-4 py-3 text-right font-medium">Output m³</th>
            <th className="px-4 py-3 text-right font-medium">Outcome %</th>
            <th className="px-4 py-3 text-right font-medium">Waste %</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((item) => (
            <tr
              key={item.processId}
              className="border-b last:border-0 hover:bg-accent/50 transition-colors cursor-pointer focus:outline-none focus:bg-accent/50"
              onClick={() => router.push(`/production?tab=history&process=${encodeURIComponent(item.processName)}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/production?tab=history&process=${encodeURIComponent(item.processName)}`);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View production history for ${item.processName}`}
            >
              <td className="px-4 py-3 font-medium">{item.processName}</td>
              <td className="px-4 py-3 text-right tabular-nums">{item.totalEntries}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatVolume(item.totalInputM3)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatVolume(item.totalOutputM3)}</td>
              <td className={`px-4 py-3 text-right tabular-nums font-medium ${getOutcomeColor(item.avgOutcomePercent)}`}>
                {formatPercent(item.avgOutcomePercent)}%
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatPercent(item.avgWastePercent)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
