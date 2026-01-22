"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Factory,
  History,
  Boxes,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icon name to component mapping
 * Icons must be imported in this Client Component to cross the Server/Client boundary
 */
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  Factory,
  History,
  Boxes,
};

export type IconName = keyof typeof ICON_MAP;

interface NavLinkProps {
  href: string;
  label: string;
  iconName: IconName;
}

/**
 * Navigation Link with Active State
 *
 * Client component that highlights the current active route.
 * Used by TopNav for role-based navigation items.
 */
export function NavLink({ href, label, iconName }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const Icon = ICON_MAP[iconName] || LayoutDashboard;

  return (
    <Link
      href={href}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center space-x-2 transition-colors",
        isActive
          ? "text-foreground font-medium"
          : "text-foreground/60 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
