"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProfileView } from "@/features/profile/ProfileView";

function ProfilePageInner() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const ws = searchParams.get("ws") || searchParams.get("workspace") || searchParams.get("from");
  const tenantId = searchParams.get("tenantId");
  const officeId = searchParams.get("officeId");
  const deptId = searchParams.get("deptId");
  const userId = searchParams.get("userId") || searchParams.get("memberId");
  return (
    <ProfileView
      tabParam={tab}
      wsParam={ws}
      tenantIdParam={tenantId}
      officeIdParam={officeId}
      deptIdParam={deptId}
      userIdParam={userId}
    />
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="settings-container" />}>
      <ProfilePageInner />
    </Suspense>
  );
}
