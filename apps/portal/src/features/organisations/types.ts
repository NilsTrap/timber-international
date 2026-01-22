/**
 * Organisations Types
 *
 * Types for managing organisations in the platform.
 */

/**
 * Organisation as stored in the database
 */
export interface Organisation {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Server action result type
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * UUID validation regex pattern
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Organisation code validation regex (letter + 2 alphanumeric characters)
 */
const ORG_CODE_REGEX = /^[A-Z][A-Z0-9]{2}$/;

/**
 * Validate organisation code format
 */
export function isValidOrgCode(code: string): boolean {
  return ORG_CODE_REGEX.test(code);
}
