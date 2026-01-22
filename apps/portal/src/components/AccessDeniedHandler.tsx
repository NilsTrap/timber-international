"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Access Denied Handler
 *
 * Client component that checks for access_denied query param and shows toast.
 * Cleans up URL after showing the notification.
 *
 * TODO [i18n]: Replace hardcoded text with useTranslations()
 */
export function AccessDeniedHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("access_denied") === "true") {
      toast.error("Access denied. You don't have permission to view that page.");
      // Clean up URL by removing the query param
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return null;
}
