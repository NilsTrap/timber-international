"use client";

import { Download } from "lucide-react";
import { Button } from "@timber/ui";
import { formatVolume, formatPercent } from "@/lib/utils";
import type { AdminProcessBreakdownItem } from "../types";

interface ExportButtonProps {
  data: AdminProcessBreakdownItem[];
}

/**
 * Generate CSV content from breakdown data
 * Uses European number formatting (comma decimal separator)
 */
function generateCSV(data: AdminProcessBreakdownItem[]): string {
  // CSV header
  const header = "Process,Entries,Input m3,Output m3,Outcome %,Waste %";

  // CSV rows
  const rows = data.map((item) =>
    [
      // Escape process name if it contains commas
      item.processName.includes(",")
        ? `"${item.processName}"`
        : item.processName,
      item.totalEntries.toString(),
      formatVolume(item.totalInputM3),
      formatVolume(item.totalOutputM3),
      formatPercent(item.avgOutcomePercent),
      formatPercent(item.avgWastePercent),
    ].join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Trigger CSV download in browser
 */
function downloadCSV(content: string, filename: string) {
  // Add BOM for Excel to recognize UTF-8
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Button Component
 *
 * Exports efficiency breakdown data as CSV file.
 * Uses European number formatting and generates timestamped filename.
 *
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
export function ExportButton({ data }: ExportButtonProps) {
  const handleExport = () => {
    const csv = generateCSV(data);

    // Generate filename with date
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `efficiency-report-${dateStr}.csv`;

    downloadCSV(csv, filename);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={data.length === 0}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
