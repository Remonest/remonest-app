import { Suspense } from "react";
import { AdminApprovalTable } from "@/features/jobs/components/AdminApprovalTable";
import { DraftJobsContentClient } from "@/components/admin/draft-jobs-content";
import { JobsByStatusContentClient } from "@/components/admin/jobs-by-status-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllJobs } from "@/features/jobs/actions/fetch-jobs";
import {
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";

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

async function JobsByStatusContent({ status }: { status?: string }) {
  const allJobs = await getAllJobs();

  const jobs = status
    ? allJobs.filter((job: any) => job.status === status)
    : allJobs;

  const showStats = !status;

  const stats = showStats
    ? {
        draft: allJobs.filter((j: any) => j.status === "draft").length,
        pending: allJobs.filter((j: any) => j.status === "pending").length,
        published: allJobs.filter((j: any) => j.status === "published").length,
        rejected: allJobs.filter((j: any) => j.status === "rejected").length,
        expired: allJobs.filter((j: any) => j.status === "expired").length,
      }
    : undefined;

  return (
    <JobsByStatusContentClient
      initialJobs={jobs}
      showStats={showStats}
      stats={stats}
    />
  );
}

async function DraftJobsContent() {
  const allJobs = await getAllJobs();
  const draftJobs = allJobs.filter((job: any) => job.status === "draft");
  return <DraftJobsContentClient initialData={draftJobs} />;
}

export default function AdminJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Manajemen Lowongan Kerja
          </h1>
          <p className="text-sm text-muted-foreground">
            Tinjau dan kelola lowongan kerja dari pemberi kerja
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Buat Lowongan Baru
        </Link>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Menunggu Persetujuan</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="published">Terbit</TabsTrigger>
          <TabsTrigger value="all">Semua Lowongan</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <AdminApprovalTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <Suspense fallback={<LoadingState />}>
            <DraftJobsContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Suspense fallback={<LoadingState />}>
            <JobsByStatusContent status="published" />
          </Suspense>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<LoadingState />}>
            <JobsByStatusContent />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
