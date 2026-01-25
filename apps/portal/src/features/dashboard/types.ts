/**
 * Dashboard Feature Types
 */

export interface ProducerMetrics {
  totalInventoryM3: number;
  totalProductionVolumeM3: number;
  overallOutcomePercent: number;
  overallWastePercent: number;
}

export interface ProcessBreakdownItem {
  processId: string;
  processName: string;
  totalEntries: number;
  totalInputM3: number;
  totalOutputM3: number;
  avgOutcomePercent: number;
  avgWastePercent: number;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
