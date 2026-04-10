import { Suspense } from "react";
import { getDashboardStats } from "@/features/dashboard/actions/stats";
import { getRecentActivity } from "@/features/dashboard/actions/activity";
import { DashboardContentInner } from "./dashboard-client";

function LoadingSkeleton() {
  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="mb-8">
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 animate-pulse rounded-xl border bg-card" />
          <div className="h-64 animate-pulse rounded-xl border bg-card" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const [stats, activities] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(5),
  ]);

  return <DashboardContentInner stats={stats} activities={activities} />;
}
