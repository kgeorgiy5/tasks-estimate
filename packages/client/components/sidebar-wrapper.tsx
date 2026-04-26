"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { NavigationPaths } from "@/config/navigation-paths.config";
import type { FC } from "react";

/**
 * Client wrapper that conditionally renders the Sidebar.
 * Hides the sidebar on auth pages (sign-in / sign-up).
 */
export const SidebarWrapper: FC = () => {
  const pathname = usePathname();

  if (
    pathname === NavigationPaths.SIGN_IN ||
    pathname === NavigationPaths.SIGN_UP
  ) {
    return null;
  }

  return <Sidebar />;
};

