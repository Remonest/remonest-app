import { Suspense } from 'react';
import { AdminApprovalTable } from '@/components/jobs';
import { DataTable } from '@/components/admin/data-table';
import { columns } from '@/components/admin/job-columns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllJobs } from '@/lib/jobs/actions';
import { Loader2 } from 'lucide-react';

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

async function AllJobsContent() {
  const jobs = await getAllJobs();

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
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Menunggu Persetujuan</TabsTrigger>
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

        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<LoadingState />}>
            <AllJobsContent />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
