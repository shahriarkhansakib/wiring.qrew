import React, { Suspense } from "react";
import { RouteSuspenseFallback } from "@/components/shell/RouteSuspenseFallback";
import { DepartmentView } from "@/features/department/DepartmentView";

const STATIC_DEPT_IDS = [
  "dept_ctg_ops",
  "dept_ctg_log",
  "dept_ctg_sec",
  "dept_ctg_cust",
  "dept_mgl_ops",
  "dept_dhk_ops",
  "dept_syl_ops",
];
const DEPT_VIEWS = ["overview", "members", "queue"];

export function generateStaticParams() {
  return STATIC_DEPT_IDS.flatMap((deptId) =>
    DEPT_VIEWS.map((view) => ({ deptId, view }))
  );
}

async function DepartmentViewContent({
  params,
}: {
  params: Promise<{ deptId: string; view: string }>;
}) {
  const { deptId } = await params;
  return <DepartmentView deptId={deptId} />;
}

export default function DepartmentViewPage({
  params,
}: {
  params: Promise<{ deptId: string; view: string }>;
}) {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <DepartmentViewContent params={params} />
    </Suspense>
  );
}
