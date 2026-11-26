import React, { Suspense } from "react";
import { RouteSuspenseFallback } from "@/components/shell/RouteSuspenseFallback";
import { BlankTitledPage } from "@/components/ui/Badges";
import { PlatformArchiveView } from "@/features/platform/PlatformArchiveView";
import { PlatformTenantsView } from "@/features/platform/PlatformTenantsView";
import { getWorkspacePageTitle, WORKSPACE_BLANK_TITLES } from "@/lib/routes";

export function generateStaticParams() {
  return [...Object.keys(WORKSPACE_BLANK_TITLES.platform), "tenants", "archive"].map((view) => ({
    view,
  }));
}

async function PlatformViewContent({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;

  if (view === "tenants") {
    return <PlatformTenantsView />;
  }
  if (view === "archive") {
    return <PlatformArchiveView />;
  }

  const title = getWorkspacePageTitle("platform", view) || "Platform Dashboard";
  return <BlankTitledPage title={title} />;
}

export default function PlatformViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <PlatformViewContent params={params} />
    </Suspense>
  );
}
