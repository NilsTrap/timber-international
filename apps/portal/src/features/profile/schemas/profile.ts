import { z } from "zod";

/**
 * Profile Update Schema
 *
 * Validates profile form input.
 * Name is required, max 100 characters.
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
