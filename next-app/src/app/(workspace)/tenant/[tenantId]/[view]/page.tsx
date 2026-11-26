import React, { Suspense } from "react";
import { RouteSuspenseFallback } from "@/components/shell/RouteSuspenseFallback";
import { TenantMembersView } from "@/features/tenant/TenantMembersView";
import { TenantOfficesView } from "@/features/tenant/TenantOfficesView";
import { TenantOverviewView } from "@/features/tenant/TenantOverviewView";
import { TenantRolesView } from "@/features/tenant/TenantRolesView";
import { TenantSettingsView } from "@/features/tenant/TenantSettingsView";

const TENANT_IDS = ["ten_sst", "ten_apex"];
const TENANT_VIEWS = ["overview", "offices", "members", "roles", "settings"];

export function generateStaticParams() {
  return TENANT_IDS.flatMap((tenantId) =>
    TENANT_VIEWS.map((view) => ({ tenantId, view }))
  );
}

async function TenantViewContent({
  params,
}: {
  params: Promise<{ tenantId: string; view: string }>;
}) {
  const { tenantId, view } = await params;

  switch (view) {
    case "offices":
      return <TenantOfficesView tenantId={tenantId} />;
    case "members":
      return <TenantMembersView tenantId={tenantId} />;
    case "roles":
      return <TenantRolesView tenantId={tenantId} />;
    case "settings":
      return <TenantSettingsView tenantId={tenantId} />;
    case "overview":
    default:
      return <TenantOverviewView tenantId={tenantId} />;
  }
}

export default function TenantViewPage({
  params,
}: {
  params: Promise<{ tenantId: string; view: string }>;
}) {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <TenantViewContent params={params} />
    </Suspense>
  );
}
