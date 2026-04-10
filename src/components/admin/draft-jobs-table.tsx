"use client";

import { useState } from "react";
import { JobDetailModal } from "./job-detail-modal";
import { DataTable } from "./data-table";
import { type ColumnDef } from "@tanstack/react-table";
import type { AdminJob } from "@/components/admin/types/job";

interface DraftJobsTableProps {
  data: any[];
  columns: ColumnDef<AdminJob>[];
  onRefresh: () => void;
}

export function DraftJobsTable({ data, columns, onRefresh }: DraftJobsTableProps) {
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    onRefresh();
  };

  // Transform jobs with view button action for draft jobs
  const transformedData = data.map((job: any) => ({
    ...job,
    viewDetails: job.status === "draft" ? handleViewDetails : undefined,
  }));

  return (
    <div>
      <DataTable data={transformedData} columns={columns} key={refreshKey} />
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          open={!!selectedJob}
          onClose={handleCloseModal}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}