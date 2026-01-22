import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import { OrganisationsTable } from "@/features/organisations";

export const metadata: Metadata = {
  title: "Organisations",
};

/**
 * Organisations Management Page (Admin Only)
 *
 * Allows admins to manage organisations.
 */
export default async function OrganisationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isAdmin(session)) {
    redirect("/dashboard?access_denied=true");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Organisations</h1>
        <p className="text-muted-foreground">
          Manage organisations
        </p>
      </div>

      <OrganisationsTable />
    </div>
  );
}
