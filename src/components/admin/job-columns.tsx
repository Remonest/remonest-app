"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { JobActions } from "@/components/admin/job-actions";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { AdminJob } from "@/components/admin/types/job";

const jobTypeLabels: Record<string, string> = {
  "full-time": "Penuh Waktu",
  "part-time": "Paruh Waktu",
  project: "Proyek",
  freelance: "Freelance",
};

interface JobColumnsOptions {
  onViewDetails?: (job: AdminJob) => void;
}

export const createColumns = (options?: JobColumnsOptions): ColumnDef<AdminJob>[] => [
  {
    accessorKey: "title",
    header: "Judul Lowongan",
    cell: ({ row }) => {
      return (
        <div className="space-y-1">
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.location}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "company",
    header: "Perusahaan",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.company}</span>
    ),
  },
  {
    id: "author",
    header: "Penulis",
    cell: ({ row }) => {
      const authorName = row.original.author_name || "Tidak Diketahui";
      return (
        <span className="text-sm text-muted-foreground">{authorName}</span>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
      const type = row.original.type;
      return <span className="text-sm">{jobTypeLabels[type] || type}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <StatusBadge status={row.original.status} />;
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }: { row: Row<AdminJob> }) => {
      const job = row.original;

      if (job.status === "draft") {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => options?.onViewDetails?.(job)}
              className="h-8 gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              Lihat
            </Button>
            <JobActions
              jobId={job.id}
              jobTitle={job.title}
              currentStatus={job.status}
            />
          </div>
        );
      }

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => options?.onViewDetails?.(job)}
          className="h-8 gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          Lihat Detail
        </Button>
      );
    },
  },
];

export const columns = createColumns();
