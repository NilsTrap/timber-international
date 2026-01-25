import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string (YYYY-MM-DD or ISO) to European format DD.MM.YYYY
 */
export function formatDate(dateStr: string): string {
  const date = dateStr.includes("T")
    ? new Date(dateStr)
    : new Date(dateStr + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format a date+time string (ISO) to European format DD.MM.YYYY HH:mm
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Format number with comma decimal separator, 3 decimal places (European format)
 * Example: 1.234 → "1,234"
 */
export function formatVolume(n: number): string {
  return n.toFixed(3).replace(".", ",");
}

/**
 * Format number with comma decimal separator, 1 decimal place (European format)
 * Example: 85.5 → "85,5"
 */
export function formatPercent(n: number): string {
  return n.toFixed(1).replace(".", ",");
}
