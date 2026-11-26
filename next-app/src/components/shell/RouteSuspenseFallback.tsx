"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BlankTitledPage } from "@/components/ui/Badges";
import { getWorkspacePageTitle, parseRouteFromPathname } from "@/lib/routes";

/**
 * Route-aware Suspense fallback that renders the exact destination blank-route
 * heading synchronously from the URL pathname instead of flashing a stale default.
 */
export function RouteSuspenseFallback() {
  const pathname = usePathname() || "/";
  const parsed = parseRouteFromPathname(pathname);
  const blankTitle = getWorkspacePageTitle(parsed.workspace, parsed.view);

  if (blankTitle) {
    return <BlankTitledPage title={blankTitle} />;
  }

  return <div style={{ minHeight: "160px" }} aria-busy="true" />;
}
