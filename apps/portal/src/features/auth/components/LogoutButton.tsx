"use client";

/**
 * Logout Button Component
 *
 * Uses form action to call the logout Server Action.
 * TODO [i18n]: Replace hardcoded text with useTranslations().
 */

import { Button } from "@timber/ui";
import { logoutUser } from "../actions/logout";

export function LogoutButton() {
  return (
    <form action={logoutUser}>
      <Button type="submit" variant="ghost" size="sm" aria-label="Log out of your account">
        Logout
      </Button>
    </form>
  );
}
