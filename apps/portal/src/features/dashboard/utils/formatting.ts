// Re-export from @/lib/utils for convenience
export { formatVolume, formatPercent } from "@/lib/utils";

/**
 * Get Tailwind color class based on outcome percentage
 * - Green (>=80%): Good efficiency
 * - Yellow (60-79%): Moderate efficiency
 * - Red (<60%): Poor efficiency
 */
export function getOutcomeColor(percent: number): string {
  if (percent >= 80) return "text-green-600";
  if (percent >= 60) return "text-yellow-600";
  return "text-red-600";
}
