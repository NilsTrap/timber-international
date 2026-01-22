"use client";

import { Tabs, TabsList, TabsTrigger } from "@timber/ui";
import {
  REFERENCE_TABLE_MAP,
  REFERENCE_TABLE_DISPLAY_NAMES,
  type ReferenceTableName,
} from "../types";

interface ReferenceTableSelectorProps {
  selectedTable: ReferenceTableName;
  onTableChange: (table: ReferenceTableName) => void;
}

/**
 * Reference Table Selector
 *
 * Tab navigation for selecting which reference table to view/edit.
 */
export function ReferenceTableSelector({
  selectedTable,
  onTableChange,
}: ReferenceTableSelectorProps) {
  return (
    <Tabs
      value={selectedTable}
      onValueChange={(value) => onTableChange(value as ReferenceTableName)}
    >
      <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
        {Object.entries(REFERENCE_TABLE_MAP).map(([routeParam, tableName]) => (
          <TabsTrigger
            key={routeParam}
            value={tableName}
            className="data-[state=active]:bg-background"
          >
            {REFERENCE_TABLE_DISPLAY_NAMES[tableName]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
