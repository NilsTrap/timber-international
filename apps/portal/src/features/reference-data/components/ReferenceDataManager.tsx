"use client";

import { useState } from "react";
import { ReferenceTableSelector } from "./ReferenceTableSelector";
import { ReferenceOptionsTable } from "./ReferenceOptionsTable";
import type { ReferenceTableName } from "../types";

/**
 * Reference Data Manager
 *
 * Main component for managing reference data. Combines table selector and options table.
 */
export function ReferenceDataManager() {
  const [selectedTable, setSelectedTable] =
    useState<ReferenceTableName>("ref_product_names");

  return (
    <div className="space-y-6">
      <ReferenceTableSelector
        selectedTable={selectedTable}
        onTableChange={setSelectedTable}
      />

      <ReferenceOptionsTable tableName={selectedTable} />
    </div>
  );
}
