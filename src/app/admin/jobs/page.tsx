import { Suspense } from "react";
import { AdminApprovalTable } from "@/components/jobs";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "@/components/admin/job-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllJobs, testJobsQuery } from "@/lib/jobs/actions";
import {
  Loader2,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  console.log("📊 JobsByStatusContent called with status:", status);
  console.log("📊 Total jobs loaded:", allJobs?.length || 0);

  // Filter jobs by status if provided
  const jobs = status
    ? allJobs.filter((job: any) => job.status === status)
    : allJobs;

  console.log("📊 Jobs filtered by status:", jobs?.length || 0);

  // Calculate stats (only show on "all" tab)
  const showStats = !status;

  if (showStats) {
    const stats = {
      draft: allJobs.filter((j: any) => j.status === "draft").length,
      pending: allJobs.filter((j: any) => j.status === "pending").length,
      published: allJobs.filter((j: any) => j.status === "published").length,
      rejected: allJobs.filter((j: any) => j.status === "rejected").length,
      expired: allJobs.filter((j: any) => j.status === "expired").length,
    };

    // Transform jobs to match the mock data structure for DataTable
    const transformedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      type: job.job_type,
      status: job.status,
      location: job.location,
      created_at: job.created_at,
      posted_at: job.created_at,
    }));

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terbit</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kedaluwarsa</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expired}</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable data={transformedJobs} columns={columns} />
      </div>
    );
  }

  // Transform jobs for specific status views (no stats)
  const transformedJobs = jobs.map((job: any) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    type: job.job_type,
    status: job.status,
    location: job.location,
    created_at: job.created_at,
    posted_at: job.created_at,
  }));

  return <DataTable data={transformedJobs} columns={columns} />;
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
            <JobsByStatusContent status="draft" />
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
