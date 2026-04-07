import { Suspense } from "react";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "@/components/admin/job-columns";
import { mockJobs } from "@/lib/admin/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-[250px]" />
        <Skeleton className="h-5 w-[400px]" />
      </div>
      <div className="rounded-md border">
        <div className="h-12 border-b bg-muted/50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-border/50">
            <div className="flex h-full items-center gap-4 px-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-6 w-[90px] rounded-full" />
              <Skeleton className="h-8 w-[160px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function JobsContent() {
  // Simulate async data fetch (replace with real API call later)
  await new Promise((resolve) => setTimeout(resolve, 500));

  return <DataTable data={mockJobs} columns={columns} />;
}

export default function AdminJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Job Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage pending job listings from employers.
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingState />}>
        <JobsContent />
      </Suspense>
    </div>
  );
}
