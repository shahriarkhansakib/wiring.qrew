import React, { Suspense } from "react";
import { TenantLandingView } from "@/features/landing/TenantLandingView";
import { DEFAULT_CONTEXT_IDS } from "@/lib/routes";

export function generateStaticParams() {
  return [{ tenantId: "ten_sst" }, { tenantId: "ten_apex" }];
}

async function TenantLandingContent({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  return <TenantLandingView tenantId={tenantId || DEFAULT_CONTEXT_IDS.tenantId} />;
}

export default function TenantLandingPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  return (
    <Suspense fallback={<div className="landing-page" />}>
      <TenantLandingContent params={params} />
    </Suspense>
  );
}
