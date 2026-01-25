"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@timber/ui";
import { Loader2 } from "lucide-react";
import { getAvailablePackagesForShipment, addPackagesToShipment } from "../actions/shipmentPackages";
import { toast } from "sonner";

interface Package {
  id: string;
  packageNumber: string;
  productName: string | null;
  woodSpecies: string | null;
  thickness: string | null;
  width: string | null;
  length: string | null;
  pieces: string | null;
  volumeM3: number | null;
}

interface ShipmentPackageSelectorProps {
  shipmentId: string;
  existingPackageIds: string[];
  onClose: () => void;
  onPackagesAdded: () => void;
}

export function ShipmentPackageSelector({
  shipmentId,
  existingPackageIds,
  onClose,
  onPackagesAdded,
}: ShipmentPackageSelectorProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchPackages() {
      const result = await getAvailablePackagesForShipment(shipmentId);
      if (result.success) {
        // Filter out packages already in the shipment
        const available = result.data.filter(
          (pkg) => !existingPackageIds.includes(pkg.id)
        );
        setPackages(available);
      } else {
        toast.error(result.error);
      }
      setLoading(false);
    }
    fetchPackages();
  }, [shipmentId, existingPackageIds]);

  const handleToggle = (packageId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(packageId)) {
      newSelected.delete(packageId);
    } else {
      newSelected.add(packageId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === packages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(packages.map((p) => p.id)));
    }
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one package");
      return;
    }

    setAdding(true);
    const result = await addPackagesToShipment(shipmentId, Array.from(selectedIds));
    if (result.success) {
      toast.success(`${result.data.added} package(s) added`);
      onPackagesAdded();
    } else {
      toast.error(result.error);
      setAdding(false);
    }
  };

  const formatVolume = (vol: number | null) => {
    if (vol === null) return "-";
    return vol.toLocaleString("de-DE", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const selectedVolume = packages
    .filter((p) => selectedIds.has(p.id))
    .reduce((sum, p) => sum + (p.volumeM3 ?? 0), 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Packages</DialogTitle>
          <DialogDescription>
            Choose packages from your inventory to add to this shipment
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No available packages in your inventory
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === packages.length && packages.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Package #</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead className="text-right">Pieces</TableHead>
                  <TableHead className="text-right">Volume m³</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow
                    key={pkg.id}
                    className={`cursor-pointer ${selectedIds.has(pkg.id) ? "bg-muted/50" : ""}`}
                    onClick={() => handleToggle(pkg.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(pkg.id)}
                        onChange={() => handleToggle(pkg.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedIds.size > 0 && (
              <>
                Selected: {selectedIds.size} package(s), {formatVolume(selectedVolume)} m³
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={adding}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={adding || selectedIds.size === 0}>
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selectedIds.size} Package(s)`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
