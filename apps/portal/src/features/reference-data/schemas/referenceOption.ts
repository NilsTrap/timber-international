import { z } from "zod";

/**
 * Reference Option Schema
 *
 * Validates input for creating/updating reference options.
 */
export const referenceOptionSchema = z.object({
  value: z
    .string()
    .min(1, "Value is required")
    .max(100, "Value must be 100 characters or less")
    .trim(),
});

export type ReferenceOptionInput = z.infer<typeof referenceOptionSchema>;

/**
 * Reorder Options Schema
 *
 * Validates input for reordering options.
 */
export const reorderOptionsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid("Invalid option ID"),
      sortOrder: z.number().int().min(0, "Sort order must be non-negative"),
    })
  ),
});

export type ReorderOptionsInput = z.infer<typeof reorderOptionsSchema>;
