"use client";

/**
 * Profile Form Component
 *
 * Allows users to edit their profile name.
 * Uses React Hook Form with Zod validation.
 *
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Input, Label } from "@timber/ui";
import { profileSchema, type ProfileInput } from "../schemas/profile";
import { updateProfile } from "../actions/updateProfile";

interface ProfileFormProps {
  initialName: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: initialName },
  });

  const onSubmit = async (data: ProfileInput) => {
    setIsLoading(true);

    try {
      const result = await updateProfile(data);

      if (result.success) {
        toast.success("Profile updated");
        router.refresh(); // Refresh to update session data
        reset({ name: data.name }); // Reset form state with new values
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset({ name: initialName });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          aria-label="Your display name"
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
          disabled={isLoading}
          autoComplete="name"
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>

        {isDirty && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
