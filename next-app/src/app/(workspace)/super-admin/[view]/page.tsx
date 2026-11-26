import React, { Suspense } from "react";
import { RouteSuspenseFallback } from "@/components/shell/RouteSuspenseFallback";
import { BlankTitledPage } from "@/components/ui/Badges";
import { SuperAdminPermissionCatalogView } from "@/features/super-admin/SuperAdminPermissionCatalogView";
import { SuperAdminPlatformAccessView } from "@/features/super-admin/SuperAdminPlatformAccessView";
import { SuperAdminPlatformSettingsView } from "@/features/super-admin/SuperAdminPlatformSettingsView";
import { getWorkspacePageTitle } from "@/lib/routes";

const SUPER_ADMIN_VIEWS = [
  "overview",
  "platform-access",
  "permission-catalog",
  "platform-settings",
  "platform-setting",
];

export function generateStaticParams() {
  return SUPER_ADMIN_VIEWS.map((view) => ({ view }));
}

async function SuperAdminViewContent({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;

  switch (view) {
    case "platform-access":
      return <SuperAdminPlatformAccessView />;
    case "permission-catalog":
      return <SuperAdminPermissionCatalogView />;
    case "platform-settings":
    case "platform-setting":
      return <SuperAdminPlatformSettingsView />;
    case "overview":
    default:
      return <BlankTitledPage title={getWorkspacePageTitle("super-admin", view) || "Overview"} />;
  }
}

export default function SuperAdminViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <SuperAdminViewContent params={params} />
    </Suspense>
  );
}
