import { createClient } from "@/lib/supabase/server";

/**
 * User Role Types
 *
 * MVP supports two simple roles:
 * - admin: Timber World staff with full access
 * - producer: Factory managers with production access
 */
export type UserRole = "admin" | "producer";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Get Current User Session
 *
 * Retrieves the authenticated user from Supabase and extracts role from metadata.
 * Role is set during registration in user_metadata.
 *
 * @returns SessionUser if authenticated, null otherwise
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get role from user metadata (set during registration)
  const role = (user.user_metadata?.role as UserRole) || "producer";
  const name = (user.user_metadata?.name as string) || user.email || "User";

  return {
    id: user.id,
    email: user.email || "",
    name,
    role,
  };
}

/**
 * Check if user has admin role
 */
export function isAdmin(session: SessionUser | null): boolean {
  return session?.role === "admin";
}

/**
 * Check if user has producer role
 */
export function isProducer(session: SessionUser | null): boolean {
  return session?.role === "producer";
}
