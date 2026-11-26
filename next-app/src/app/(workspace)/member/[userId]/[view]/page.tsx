import React, { Suspense } from "react";
import { RouteSuspenseFallback } from "@/components/shell/RouteSuspenseFallback";
import { MemberView } from "@/features/member/MemberView";

const STATIC_MEMBER_IDS = [
  "usr_nusrat",
  "usr_sakib",
  "usr_rafiq",
  "usr_jack",
  "usr_tanvir",
];

export function generateStaticParams() {
  return STATIC_MEMBER_IDS.map((userId) => ({ userId, view: "overview" }));
}

async function MemberViewContent({
  params,
}: {
  params: Promise<{ userId: string; view: string }>;
}) {
  const { userId } = await params;
  return <MemberView userId={userId} />;
}

export default function MemberViewPage({
  params,
}: {
  params: Promise<{ userId: string; view: string }>;
}) {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <MemberViewContent params={params} />
    </Suspense>
  );
}
