import { Loader2 } from "lucide-react";

export default function ReferenceDataLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reference Data</h1>
        <p className="text-muted-foreground">Loading reference data...</p>
      </div>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
