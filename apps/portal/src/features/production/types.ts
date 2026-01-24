/**
 * Production Feature Types
 */

export interface Process {
  id: string;
  value: string;
  sortOrder: number;
}

export interface ProductionEntry {
  id: string;
  processId: string;
  productionDate: string;
  status: "draft" | "validated";
  notes: string | null;
  totalInputM3: number | null;
  totalOutputM3: number | null;
  outcomePercentage: number | null;
  wastePercentage: number | null;
  createdAt: string;
  updatedAt: string;
  validatedAt: string | null;
}

export interface ProductionListItem {
  id: string;
  processName: string;
  productionDate: string;
  status: "draft" | "validated";
  createdAt: string;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
