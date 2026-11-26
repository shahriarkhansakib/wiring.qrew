import React from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/Badges";
import { routes } from "@/lib/routes";

export function TenantNotFoundCard({ tenantId }: { tenantId: string }) {
  return (
    <div className="card" style={{ padding: "32px" }}>
      <EmptyState
        title="Tenant Organization Not Found"
        description={`The tenant "${tenantId}" does not exist in the database.`}
        action={
          <Link href={routes.platform("tenants")} className="btn btn-primary">
            Return to Tenants Directory
          </Link>
        }
      />
    </div>
  );
}
