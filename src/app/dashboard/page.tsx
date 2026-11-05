"use client";

import dynamic from "next/dynamic";

const Terminal = dynamic(
  () => import("@/components/dashboard/Terminal").then((m) => m.Terminal),
  { ssr: false, loading: () => <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Loading terminal…</div> }
);

export default function DashboardPage() {
  return <Terminal />;
}
