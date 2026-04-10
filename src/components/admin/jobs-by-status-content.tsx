"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/data-table";
import { createColumns } from "@/components/admin/job-columns";
import { JobDetailModal } from "@/components/admin/job-detail-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface JobsByStatusContentClientProps {
  initialJobs: any[];
  showStats?: boolean;
  stats?: {
    draft: number;
    pending: number;
    published: number;
    rejected: number;
    expired: number;
  };
}

export function JobsByStatusContentClient({
  initialJobs,
  showStats,
  stats,
}: JobsByStatusContentClientProps) {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform jobs to match the AdminJob interface expected by columns
  const jobs = initialJobs.map((job) => ({
    // Preserve all original fields for the modal
    ...job,
    // Override with transformed fields for column display
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.job_type,
    status: job.status,
    posted_at: job.created_at,
    created_at: job.created_at,
    author_name: job.author_name || "Tidak Diketahui",
  }));

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const dynamicColumns = createColumns({ onViewDetails: handleViewDetails });

  return (
    <div className="relative">
      {showStats && stats && (
        <div className="space-y-6">
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

          <DataTable data={jobs} columns={dynamicColumns} />
        </div>
      )}

      {!showStats && (
        <DataTable data={jobs} columns={dynamicColumns} />
      )}

      <JobDetailModal
        job={selectedJob}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={() => {
          handleRefresh();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
