/**
 * Supabase Admin Client for Portal
 * Re-exports from @timber/database for convenience
 *
 * WARNING: Only use in server-side contexts with proper authentication checks.
 * This client bypasses Row Level Security.
 */
export { createAdminClient } from "@timber/database";
