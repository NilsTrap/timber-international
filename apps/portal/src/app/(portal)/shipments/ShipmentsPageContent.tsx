"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger, Badge, Button } from "@timber/ui";
import { Plus } from "lucide-react";
import { OrgShipmentTabs, AllShipmentsTab } from "@/features/shipments/components";

interface ShipmentsPageContentProps {
  initialTab?: "outgoing" | "incoming" | "all";
  isSuperAdmin: boolean;
  isOrgUser: boolean;
  organizations: Array<{ id: string; code: string; name: string }>;
  allPendingCount: number;
}

export function ShipmentsPageContent({
  initialTab,
  isSuperAdmin,
  isOrgUser,
  organizations,
  allPendingCount,
}: ShipmentsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Determine default tab
  const defaultTab = isSuperAdmin && !isOrgUser ? "all" : "outgoing";
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming" | "all">(
    initialTab ?? (tabParam as "outgoing" | "incoming" | "all") ?? defaultTab
  );

  // Sync tab with URL
  useEffect(() => {
    if (tabParam === "incoming" || tabParam === "outgoing" || tabParam === "all") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "outgoing" | "incoming" | "all");
    router.push(`/shipments?tab=${tab}`);
  };

  // Super Admin only (no org) - show only All Shipments
  if (isSuperAdmin && !isOrgUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">All Shipments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and monitor shipments across all organizations
            </p>
          </div>
        </div>

        <AllShipmentsTab organizations={organizations} />
      </div>
    );
  }

  // Organization user or Super Admin with org context
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shipments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Manage shipments for your organization or view all shipments"
              : "Manage outgoing and incoming shipments for your organization"}
          </p>
        </div>
        {isOrgUser && (
          <Button onClick={() => router.push("/shipments/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {isOrgUser && (
            <>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
            </>
          )}
          {isSuperAdmin && (
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Shipments
              {allPendingCount > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 bg-yellow-100 text-yellow-800">
                  {allPendingCount}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {isOrgUser && (
          <>
            <TabsContent value="outgoing" className="mt-4">
              <OrgShipmentTabs
                activeTab="outgoing"
                onTabChange={(tab) => handleTabChange(tab)}
              />
            </TabsContent>
            <TabsContent value="incoming" className="mt-4">
              <OrgShipmentTabs
                activeTab="incoming"
                onTabChange={(tab) => handleTabChange(tab)}
              />
            </TabsContent>
          </>
        )}

        {isSuperAdmin && (
          <TabsContent value="all" className="mt-4">
            <AllShipmentsTab organizations={organizations} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
