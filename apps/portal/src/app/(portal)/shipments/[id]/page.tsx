"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@timber/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@timber/ui";
import { ArrowLeft, Plus, Trash2, Send, Loader2, X } from "lucide-react";
import { getOrgShipmentDetail } from "@/features/shipments/actions/getOrgShipmentDetail";
import { removePackageFromShipment } from "@/features/shipments/actions/shipmentPackages";
import { cancelShipmentSubmission } from "@/features/shipments/actions/submitShipment";
import type { ShipmentDetail, ShipmentStatus } from "@/features/shipments/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ShipmentPackageSelector } from "@/features/shipments/components/ShipmentPackageSelector";
import { SubmitShipmentDialog } from "@/features/shipments/components/SubmitShipmentDialog";
import { AcceptRejectButtons } from "@/features/shipments/components/AcceptRejectButtons";

const statusColors: Record<ShipmentStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels: Record<ShipmentStatus, string> = {
  draft: "Draft",
  pending: "Pending Acceptance",
  accepted: "Accepted",
  completed: "Completed",
  rejected: "Rejected",
};

/**
 * Shipment Detail Page
 *
 * Shows shipment details and allows managing packages for drafts.
 * For pending shipments (incoming), shows accept/reject buttons.
 */
export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isReceiver, setIsReceiver] = useState(false);

  const fetchShipment = useCallback(async () => {
    const result = await getOrgShipmentDetail(shipmentId);
    if (result.success) {
      setShipment(result.data.shipment);
      setIsOwner(result.data.isOwner);
      setIsReceiver(result.data.isReceiver);
    } else {
      toast.error(result.error);
      router.push("/shipments");
    }
    setLoading(false);
  }, [shipmentId, router]);

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  const handleRemovePackage = async (packageId: string) => {
    if (!shipment) return;

    const result = await removePackageFromShipment(shipment.id, packageId);
    if (result.success) {
      toast.success("Package removed");
      fetchShipment();
    } else {
      toast.error(result.error);
    }
  };

  const handlePackagesAdded = () => {
    setShowPackageSelector(false);
    fetchShipment();
  };

  const handleSubmitSuccess = () => {
    setShowSubmitDialog(false);
    fetchShipment();
  };

  const handleCancelSubmission = async () => {
    if (!shipment) return;
    setCanceling(true);
    const result = await cancelShipmentSubmission(shipment.id);
    if (result.success) {
      toast.success("Submission cancelled - shipment returned to draft");
      fetchShipment();
    } else {
      toast.error(result.error);
    }
    setCanceling(false);
  };

  const formatVolume = (vol: number | null) => {
    if (vol === null) return "-";
    return vol.toLocaleString("de-DE", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const totalVolume = shipment?.packages.reduce(
    (sum, pkg) => sum + (pkg.volumeM3 ?? 0),
    0
  ) ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!shipment) {
    return null;
  }

  const isDraft = shipment.status === "draft";
  const isPending = shipment.status === "pending";
  const canEdit = isDraft && isOwner;
  const canSubmit = isDraft && isOwner && shipment.packages.length > 0;
  const canReview = isPending && isReceiver;
  const canCancel = isPending && isOwner;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/shipments")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{shipment.shipmentCode}</h1>
              <Badge className={statusColors[shipment.status]}>
                {statusLabels[shipment.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isOwner ? "To" : "From"}: {isOwner ? shipment.toOrganisationName : shipment.fromOrganisationName}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {canSubmit && (
            <Button onClick={() => setShowSubmitDialog(true)}>
              <Send className="h-4 w-4 mr-2" />
              Submit for Acceptance
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" onClick={handleCancelSubmission} disabled={canceling}>
              {canceling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Submission
                </>
              )}
            </Button>
          )}
          {canReview && (
            <AcceptRejectButtons
              shipmentId={shipment.id}
              packageCount={shipment.packages.length}
              totalVolume={totalVolume}
              fromOrgName={shipment.fromOrganisationName}
              onSuccess={fetchShipment}
            />
          )}
        </div>
      </div>

      {/* Shipment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">From</dt>
              <dd className="font-medium">{shipment.fromOrganisationName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">To</dt>
              <dd className="font-medium">{shipment.toOrganisationName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">{formatDate(shipment.shipmentDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total Volume</dt>
              <dd className="font-medium">{formatVolume(totalVolume)} m³</dd>
            </div>
          </dl>
          {shipment.notes && (
            <div className="mt-4 pt-4 border-t">
              <dt className="text-sm text-muted-foreground mb-1">Notes</dt>
              <dd className="text-sm">{shipment.notes}</dd>
            </div>
          )}
          {shipment.status === "rejected" && shipment.rejectionReason && (
            <div className="mt-4 pt-4 border-t">
              <dt className="text-sm text-red-600 font-medium mb-1">Rejection Reason</dt>
              <dd className="text-sm text-red-700">{shipment.rejectionReason}</dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Packages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Packages ({shipment.packages.length})
          </CardTitle>
          {canEdit && (
            <Button onClick={() => setShowPackageSelector(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Packages
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {shipment.packages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No packages added yet
              {canEdit && (
                <div className="mt-2">
                  <Button variant="outline" onClick={() => setShowPackageSelector(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Packages
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead className="text-right">Pieces</TableHead>
                    <TableHead className="text-right">Volume m³</TableHead>
                    {canEdit && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipment.packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.packageNumber}</TableCell>
                      <TableCell>{pkg.productName ?? "-"}</TableCell>
                      <TableCell>{pkg.woodSpecies ?? "-"}</TableCell>
                      <TableCell>
                        {pkg.thickness && pkg.width && pkg.length
                          ? `${pkg.thickness} × ${pkg.width} × ${pkg.length}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">{pkg.pieces ?? "-"}</TableCell>
                      <TableCell className="text-right">{formatVolume(pkg.volumeM3)}</TableCell>
                      {canEdit && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePackage(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Selector Dialog */}
      {showPackageSelector && (
        <ShipmentPackageSelector
          shipmentId={shipment.id}
          existingPackageIds={shipment.packages.map((p) => p.id)}
          onClose={() => setShowPackageSelector(false)}
          onPackagesAdded={handlePackagesAdded}
        />
      )}

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <SubmitShipmentDialog
          shipmentId={shipment.id}
          toOrgName={shipment.toOrganisationName}
          packageCount={shipment.packages.length}
          totalVolume={totalVolume}
          onClose={() => setShowSubmitDialog(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
