"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@timber/ui";
import { referenceOptionSchema, type ReferenceOptionInput } from "../schemas";
import { createReferenceOption, updateReferenceOption } from "../actions";
import type { ReferenceTableName, ReferenceOption } from "../types";

interface ReferenceOptionFormProps {
  tableName: ReferenceTableName;
  option?: ReferenceOption | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Reference Option Form
 *
 * Dialog form for adding or editing a reference option.
 */
export function ReferenceOptionForm({
  tableName,
  option,
  open,
  onOpenChange,
  onSuccess,
}: ReferenceOptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!option;
  const isProcesses = tableName === "ref_processes";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReferenceOptionInput>({
    resolver: zodResolver(referenceOptionSchema),
    defaultValues: {
      value: option?.value ?? "",
      ...(isProcesses ? { code: option?.code ?? "" } : {}),
    },
  });

  // Reset form when option changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        value: option?.value ?? "",
        ...(isProcesses ? { code: option?.code ?? "" } : {}),
      });
    }
  }, [open, option, reset, isProcesses]);

  const onSubmit = async (data: ReferenceOptionInput) => {
    setIsSubmitting(true);

    try {
      const result = isEditing
        ? await updateReferenceOption(tableName, option.id, data)
        : await createReferenceOption(tableName, data);

      if (result.success) {
        toast.success(isEditing ? "Option updated" : "Option added");
        reset();
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Option" : "Add Option"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              placeholder="Enter option value"
              {...register("value")}
              aria-invalid={!!errors.value}
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value.message}</p>
            )}
          </div>

          {isProcesses && (
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g. PL, MS, OC"
                className="uppercase"
                maxLength={10}
                {...register("code", {
                  setValueAs: (v: string) => v?.toUpperCase(),
                })}
                aria-invalid={!!errors.code}
              />
              <p className="text-xs text-muted-foreground">
                Short code used for output package numbering (e.g. PL-001)
              </p>
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
