"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DraftJobsTable } from "@/components/admin/draft-jobs-table";
import { createColumns } from "@/components/admin/job-columns";
import { JobDetailModal } from "@/components/admin/job-detail-modal";

interface DraftJobsContentClientProps {
  initialData: any[];
}

export function DraftJobsContentClient({ initialData }: DraftJobsContentClientProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Refresh the router to refetch server data
    router.refresh();
    setIsRefreshing(false);
  };

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const dynamicColumns = createColumns({ onViewDetails: handleViewDetails });

  return (
    <div className="relative">
      {isRefreshing && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4">⏳</div>
            <span className="text-sm text-muted-foreground">Memperbarui...</span>
          </div>
        </div>
      )}
      <DraftJobsTable
        data={jobs}
        columns={dynamicColumns}
        onRefresh={handleRefresh}
      />

      {/* Job Detail Modal */}
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
