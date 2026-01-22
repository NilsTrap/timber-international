import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Factory } from "lucide-react";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Production",
};

/**
 * Production Page
 *
 * Producer page for creating and managing production entries.
 * Accessible to both admin and producer roles.
 *
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
export default async function ProductionPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Production</h1>
        <p className="text-muted-foreground">
          Log and track production transformations
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <Factory className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Production Entry</h2>
          <p className="text-muted-foreground max-w-md">
            Create production entries to track material transformations (input → process → output).
            This feature will be implemented in Stories 4.1 - 4.5.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Coming in Epic 4: Production Entry & Tracking
          </p>
        </div>
      </div>
    </div>
  );
}
