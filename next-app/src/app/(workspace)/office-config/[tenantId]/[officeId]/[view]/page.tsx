import React, { Suspense } from "react";
import { RouteSuspenseFallback } from "@/components/shell/RouteSuspenseFallback";
import { BlankTitledPage } from "@/components/ui/Badges";
import { InvoiceTemplatesView } from "@/features/office-config/InvoiceTemplatesView";
import { getWorkspacePageTitle, WORKSPACE_BLANK_TITLES } from "@/lib/routes";

const STATIC_OFFICE_PARAMS = [
  { tenantId: "ten_sst", officeId: "off_ctg_port" },
  { tenantId: "ten_sst", officeId: "off_mgl_port" },
  { tenantId: "ten_apex", officeId: "off_dhk_corp" },
  { tenantId: "ten_apex", officeId: "off_syl_depot" },
];

export function generateStaticParams() {
  const views = [...Object.keys(WORKSPACE_BLANK_TITLES["office-config"]), "invoice-templates"];
  return STATIC_OFFICE_PARAMS.flatMap(({ tenantId, officeId }) =>
    views.map((view) => ({ tenantId, officeId, view }))
  );
}

async function OfficeConfigViewContent({
  params,
}: {
  params: Promise<{ tenantId: string; officeId: string; view: string }>;
}) {
  const { tenantId, officeId, view } = await params;

  if (view === "invoice-templates") {
    return <InvoiceTemplatesView officeId={officeId} tenantId={tenantId} />;
  }

  return <BlankTitledPage title={getWorkspacePageTitle("office-config", view) || "Overview"} />;
}

export default function OfficeConfigViewPage({
  params,
}: {
  params: Promise<{ tenantId: string; officeId: string; view: string }>;
}) {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <OfficeConfigViewContent params={params} />
    </Suspense>
  );
}
