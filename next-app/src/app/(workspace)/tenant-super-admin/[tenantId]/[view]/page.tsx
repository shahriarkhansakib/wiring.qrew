import React, { Suspense } from "react";
import { RouteSuspenseFallback } from "@/components/shell/RouteSuspenseFallback";
import { BlankTitledPage } from "@/components/ui/Badges";
import { getWorkspacePageTitle, WORKSPACE_BLANK_TITLES } from "@/lib/routes";

const TENANT_IDS = ["ten_sst", "ten_apex"];

export function generateStaticParams() {
  return TENANT_IDS.flatMap((tenantId) =>
    Object.keys(WORKSPACE_BLANK_TITLES["tenant-super-admin"]).map((view) => ({
      tenantId,
      view,
    }))
  );
}

async function TenantSuperAdminContent({
  params,
}: {
  params: Promise<{ tenantId: string; view: string }>;
}) {
  const { view } = await params;
  return (
    <BlankTitledPage
      title={getWorkspacePageTitle("tenant-super-admin", view) || "Overview"}
    />
  );
}

export default function TenantSuperAdminViewPage({
  params,
}: {
  params: Promise<{ tenantId: string; view: string }>;
}) {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <TenantSuperAdminContent params={params} />
    </Suspense>
  );
}
