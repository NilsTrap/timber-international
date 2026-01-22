import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { getSession, isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Products",
};

/**
 * Products Page (Admin Only)
 *
 * Admin page for managing the product catalog.
 * Non-admin users are redirected by middleware.
 *
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
export default async function ProductsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Defense-in-depth: Middleware is primary gate, this is backup protection.
  // Ensures security even if middleware is bypassed or misconfigured.
  if (!isAdmin(session)) {
    redirect("/dashboard?access_denied=true");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Manage your product catalog
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <Boxes className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Product Management</h2>
          <p className="text-muted-foreground max-w-md">
            Create and manage products in your catalog. This feature will be implemented in Story 2.1.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Coming in Epic 2: Admin Inventory Management
          </p>
        </div>
      </div>
    </div>
  );
}
