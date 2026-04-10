"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";
import type { Job } from "@/lib/admin/mock-data";
import { jobTypeLabels } from "@/lib/admin/mock-data";
import { StatusBadge } from "@/components/admin/status-badge";
import { JobActions } from "@/components/admin/job-actions";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: "Job Title",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="space-y-1">
          <p className="font-medium">{job.title}</p>
          <p className="text-xs text-muted-foreground">{job.location}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("company")}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as keyof typeof jobTypeLabels;
      return <span className="text-sm">{jobTypeLabels[type]}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as
        | "pending"
        | "draft"
        | "approved"
        | "rejected";
      return <StatusBadge status={status} />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: Row<Job> }) => {
      const job = row.original;

      // For draft jobs, show view details button instead of JobActions
      if (job.status === "draft") {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => (job as any).viewDetails?.(job)}
            className="h-8 gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            Lihat Detail
          </Button>
        );
      }

      return (
        <JobActions
          jobId={job.id}
          jobTitle={job.title}
          currentStatus={job.status}
        />
      );
    },
  },
];
