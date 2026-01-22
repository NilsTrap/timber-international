"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
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
import { createOrganisation, updateOrganisation } from "../actions";
import type { Organisation } from "../types";

interface OrganisationFormProps {
  organisation?: Organisation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Form schema for creating - includes code validation
const createFormSchema = z.object({
  code: z
    .string()
    .length(3, "Code must be exactly 3 characters")
    .refine((val) => /^[A-Z]/.test(val.toUpperCase()), {
      message: "First character must be a letter (A-Z), not a number",
    })
    .refine((val) => /^[A-Z][A-Z0-9]{2}$/.test(val.toUpperCase()), {
      message: "Code must be a letter followed by 2 letters or numbers",
    })
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
});

// Form schema for editing - name only
const editFormSchema = z.object({
  code: z.string().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
});

type CreateFormInput = z.infer<typeof createFormSchema>;
type EditFormInput = z.infer<typeof editFormSchema>;
type FormInput = CreateFormInput | EditFormInput;

/**
 * Organisation Form
 *
 * Dialog form for adding or editing an organisation.
 * When editing, the code field is disabled (immutable).
 */
export function OrganisationForm({
  organisation,
  open,
  onOpenChange,
  onSuccess,
}: OrganisationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!organisation;

  // Use appropriate schema based on mode
  const formSchema = isEditing ? editFormSchema : createFormSchema;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: organisation?.code ?? "",
      name: organisation?.name ?? "",
    },
  });

  // Reset form when organisation changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        code: organisation?.code ?? "",
        name: organisation?.name ?? "",
      });
    }
  }, [open, organisation, reset]);

  // Auto-uppercase the code field
  const codeValue = watch("code");
  useEffect(() => {
    if (codeValue && !isEditing) {
      const uppercased = codeValue.toUpperCase().slice(0, 3);
      if (uppercased !== codeValue) {
        setValue("code", uppercased);
      }
    }
  }, [codeValue, isEditing, setValue]);

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const result = await updateOrganisation(organisation.id, { name: data.name });
        if (result.success) {
          toast.success("Organisation updated");
          reset();
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(result.error);
        }
      } else {
        // Code is validated by Zod schema and transformed to uppercase
        const code = (data as CreateFormInput).code;
        const result = await createOrganisation({ code, name: data.name });
        if (result.success) {
          toast.success("Organisation created");
          reset();
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(result.error);
        }
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
          <DialogTitle>{isEditing ? "Edit Organisation" : "Add Organisation"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              placeholder="ABC"
              maxLength={3}
              {...register("code")}
              disabled={isEditing}
              aria-invalid={!!errors.code}
              aria-describedby={errors.code ? "code-error" : isEditing ? "code-hint" : undefined}
              className={isEditing ? "bg-muted" : ""}
            />
            {isEditing && (
              <p id="code-hint" className="text-xs text-muted-foreground">
                Code cannot be changed after creation
              </p>
            )}
            {errors.code && (
              <p id="code-error" className="text-sm text-destructive" role="alert">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter organisation name"
              {...register("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">{errors.name.message}</p>
            )}
          </div>

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
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
