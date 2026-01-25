import type { DateRangeFilterType, DateRange } from "../types";

/**
 * Get the date range for a given filter type
 *
 * @param filter - The filter type (week, month, quarter, all, custom)
 * @param customRange - Optional custom date range (required when filter is 'custom')
 * @returns DateRange with start and end ISO strings
 */
export function getDateRangeForFilter(
  filter: DateRangeFilterType,
  customRange?: DateRange
): DateRange {
  const now = new Date();
  const end = now.toISOString();

  switch (filter) {
    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString(), end };
    }
    case "month": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString(), end };
    }
    case "quarter": {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return { start: start.toISOString(), end };
    }
    case "all": {
      // Use Unix epoch start for "all time"
      return { start: new Date(0).toISOString(), end };
    }
    case "custom": {
      if (customRange) {
        return customRange;
      }
      // Default to last 30 days if no custom range provided
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString(), end };
    }
    default: {
      // Default to all time
      return { start: new Date(0).toISOString(), end };
    }
  }
}

/**
 * Get human-readable label for a date range filter
 */
export function getDateRangeLabel(filter: DateRangeFilterType): string {
  switch (filter) {
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    case "quarter":
      return "This Quarter";
    case "all":
      return "All Time";
    case "custom":
      return "Custom Range";
    default:
      return "All Time";
  }
}

/**
 * Available filter options for dropdown
 * Note: "custom" option excluded until date picker UI is implemented
 */
export const DATE_RANGE_OPTIONS: { value: DateRangeFilterType; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "all", label: "All Time" },
];
