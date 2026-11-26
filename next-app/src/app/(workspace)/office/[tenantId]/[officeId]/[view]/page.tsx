import React, { Suspense } from "react";
import { RouteSuspenseFallback } from "@/components/shell/RouteSuspenseFallback";
import { BlankTitledPage } from "@/components/ui/Badges";
import { getWorkspacePageTitle, WORKSPACE_BLANK_TITLES } from "@/lib/routes";

const STATIC_OFFICE_PARAMS = [
  { tenantId: "ten_sst", officeId: "off_ctg_port" },
  { tenantId: "ten_sst", officeId: "off_mgl_port" },
  { tenantId: "ten_apex", officeId: "off_dhk_corp" },
  { tenantId: "ten_apex", officeId: "off_syl_depot" },
];

export function generateStaticParams() {
  return STATIC_OFFICE_PARAMS.flatMap(({ tenantId, officeId }) =>
    Object.keys(WORKSPACE_BLANK_TITLES.office).map((view) => ({ tenantId, officeId, view }))
  );
}

async function OfficeViewContent({
  params,
}: {
  params: Promise<{ tenantId: string; officeId: string; view: string }>;
}) {
  const { view } = await params;
  return <BlankTitledPage title={getWorkspacePageTitle("office", view) || "Dashboard"} />;
}

export default function OfficeViewPage({
  params,
}: {
  params: Promise<{ tenantId: string; officeId: string; view: string }>;
}) {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <OfficeViewContent params={params} />
    </Suspense>
  );
}
