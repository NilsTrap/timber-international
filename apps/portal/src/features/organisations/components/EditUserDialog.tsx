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
  Badge,
} from "@timber/ui";
import { Clock, User } from "lucide-react";
import { updateOrganisationUser } from "../actions";
import type { OrganisationUser } from "../types";

interface EditUserDialogProps {
  user: OrganisationUser | null;
  organisationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Form schema for editing a user (name only)
const editUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
});

type EditUserInput = z.infer<typeof editUserSchema>;

/**
 * Format date for display (European format with time)
 * e.g., "25 Jan 2026, 14:30"
 */
function formatCredentialDate(dateString: string | null): string {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Edit User Dialog
 *
 * Modal form for editing a user's name.
 * Email is displayed but not editable (immutable).
 */
export function EditUserDialog({
  user,
  organisationId,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (open && user) {
      reset({ name: user.name });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: EditUserInput) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const result = await updateOrganisationUser(user.id, organisationId, data);

      if (result.success) {
        toast.success("User updated");
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
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ""}
              disabled
              className="bg-muted"
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter user's full name"
              {...register("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Status and Credential History */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant={
                  !user?.isActive
                    ? "secondary"
                    : user?.status === "invited"
                      ? "warning"
                      : "success"
                }
              >
                {!user?.isActive
                  ? "Inactive"
                  : user?.status === "invited"
                    ? "Invited"
                    : "Active"}
              </Badge>
            </div>

            {user?.invitedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Credentials sent
                </span>
                <span className="text-sm">{formatCredentialDate(user.invitedAt)}</span>
              </div>
            )}

            {user?.invitedByName && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Sent by
                </span>
                <span className="text-sm">{user.invitedByName}</span>
              </div>
            )}

            {user?.lastLoginAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last login</span>
                <span className="text-sm">{formatCredentialDate(user.lastLoginAt)}</span>
              </div>
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
