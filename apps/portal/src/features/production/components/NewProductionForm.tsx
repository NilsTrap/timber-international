"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@timber/ui";
import { createProductionEntry } from "../actions";
import type { Process } from "../types";

interface NewProductionFormProps {
  processes: Process[];
}

/**
 * New Production Form
 *
 * Simple form with a process dropdown and "Start Production" button.
 * Creates a draft production entry and redirects to the entry page.
 */
export function NewProductionForm({ processes }: NewProductionFormProps) {
  const router = useRouter();
  const [selectedProcessId, setSelectedProcessId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!selectedProcessId) {
      toast.error("Please select a process");
      return;
    }

    setIsSubmitting(true);

    const result = await createProductionEntry(selectedProcessId);

    if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success("Production entry created");
    router.push(`/production/${result.data.id}`);
  }, [selectedProcessId, router]);

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 max-w-xs">
        <label
          htmlFor="process-select"
          className="block text-sm font-medium mb-1.5"
        >
          Process
        </label>
        <select
          id="process-select"
          value={selectedProcessId}
          onChange={(e) => setSelectedProcessId(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          <option value="">Select process...</option>
          {processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.value}
            </option>
          ))}
        </select>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedProcessId || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          "Start Production"
        )}
      </Button>
    </div>
  );
}
