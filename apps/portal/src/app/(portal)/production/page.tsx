import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProcesses, getDraftProductions } from "@/features/production/actions";
import { NewProductionForm } from "@/features/production/components/NewProductionForm";
import { DraftProductionList } from "@/features/production/components/DraftProductionList";

export const metadata: Metadata = {
  title: "Production",
};

/**
 * Production Page
 *
 * Producer page for creating and managing production entries.
 * Shows a form to start new production and a list of draft entries.
 *
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
export default async function ProductionPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [processesResult, draftsResult] = await Promise.all([
    getProcesses(),
    getDraftProductions(),
  ]);

  const processes = processesResult.success ? processesResult.data : [];
  const drafts = draftsResult.success ? draftsResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Production</h1>
        <p className="text-muted-foreground">
          Log and track production transformations
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">New Production</h2>
        <NewProductionForm processes={processes} />
      </div>

      <DraftProductionList drafts={drafts} />
    </div>
  );
}
