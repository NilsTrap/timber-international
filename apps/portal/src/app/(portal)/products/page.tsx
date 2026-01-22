import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Products",
};

/**
 * Products Page - DEPRECATED
 *
 * This page has been replaced by the new inventory model.
 * Redirects to the admin reference data page.
 */
export default async function ProductsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isAdmin(session)) {
    redirect("/dashboard?access_denied=true");
  }

  // Redirect to new admin reference page (will be implemented in Story 2.1)
  redirect("/admin/reference");
}
