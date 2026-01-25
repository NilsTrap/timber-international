"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Label,
} from "@timber/ui";
import { Loader2, Check, X } from "lucide-react";
import { acceptShipment, rejectShipment } from "../actions/acceptRejectShipment";
import { toast } from "sonner";

interface AcceptRejectButtonsProps {
  shipmentId: string;
  packageCount: number;
  totalVolume: number;
  fromOrgName: string;
  onSuccess: () => void;
}

export function AcceptRejectButtons({
  shipmentId,
  packageCount,
  totalVolume,
  fromOrgName,
  onSuccess,
}: AcceptRejectButtonsProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const formatVolume = (vol: number) => {
    return vol.toLocaleString("de-DE", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const handleAccept = async () => {
    setProcessing(true);
    const result = await acceptShipment(shipmentId);
    if (result.success) {
      toast.success("Shipment accepted - inventory transferred");
      setShowAcceptDialog(false);
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    const result = await rejectShipment(shipmentId, rejectReason.trim());
    if (result.success) {
      toast.success("Shipment rejected");
      setShowRejectDialog(false);
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setProcessing(false);
  };

  return (
    <>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowRejectDialog(true)}>
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
        <Button onClick={() => setShowAcceptDialog(true)}>
          <Check className="h-4 w-4 mr-2" />
          Accept
        </Button>
      </div>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Shipment?</DialogTitle>
            <DialogDescription>
              The packages will be transferred to your organization&apos;s inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">From:</span>
                <p className="font-medium">{fromOrgName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Packages:</span>
                <p className="font-medium">{packageCount}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Total Volume:</span>
                <p className="font-medium">{formatVolume(totalVolume)} m³</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Accept Shipment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Shipment?</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this shipment. The sender will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <textarea
                id="reason"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Shipment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
