"use client";

import Link from "next/link";
import { Eye, Pencil, Send, Pause, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { useState } from "react";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  status: "draft" | "pending" | "published" | "rejected";
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  location?: string;
  created_at: string;
  deadline?: string;
  applicants_count?: number;
  last_updated?: string;
}

const statusStyles = {
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  pending: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  published:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const statusColors = {
  draft: "bg-amber-500",
  pending: "bg-blue-500",
  published: "bg-emerald-500",
  rejected: "bg-red-500",
};

const formatSalary = (amount?: number, currency = "IDR") => {
  if (!amount) return "Negosiasi";
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
};

const getJobTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    "full-time": "Penuh Waktu",
    "part-time": "Paruh Waktu",
    project: "Proyek",
    freelance: "Freelance",
    contract: "Kontrak",
  };
  return type ? labels[type] || type : "-";
};

export function DashboardJobCard({
  id,
  title,
  status,
  job_type,
  salary_min,
  salary_max,
  salary_period,
  location,
  created_at,
  deadline,
  applicants_count,
  last_updated,
}: JobCardProps) {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      // Trigger publish action
      window.location.href = `/api/jobs/${id}/publish`;
    } catch (error) {
      console.error("Publish failed:", error);
      setIsPublishing(false);
    }
  };

  const statusLabel = {
    draft: "Draft",
    pending: "In review",
    published: "Published",
    rejected: "Rejected",
  }[status];

  console.log(statusLabel, "asdas");
  return (
    <div className="p-4 sm:p-5 md:p-6 border border-border rounded-2xl bg-card flex flex-col gap-4">
      {/* Header: Title, Status, and Quick Actions */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
              {title}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[status]}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[status]}`}
              />
              <span className="hidden xs:inline sm:inline">{statusLabel}</span>
              <span className="xs:hidden sm:hidden">{statusLabel[0]}</span>
            </span>
          </div>

          {/* Subtitle Info */}
          <div className="mt-2 flex flex-col gap-1.5 text-xs sm:text-sm text-muted-foreground">
            {job_type && <span>{getJobTypeLabel(job_type)}</span>}

            {salary_min && (
              <span>
                {formatSalary(salary_min)}
                {salary_max && ` - ${formatSalary(salary_max)}`}
                {salary_period && ` / ${salary_period}`}
              </span>
            )}
            {location && <span>{location}</span>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Link href={`/dashboard/jobs/${id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </Link>
          {status === "draft" && (
            <>
              <Link href={`/jobs/${id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </Link>
              <Button
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:gap-2"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isPublishing ? "Publishing..." : "Publish"}
                </span>
              </Button>
            </>
          )}
          {status === "published" && (
            <>
              <Link href={`/jobs/${id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:gap-2"
              >
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">Pause</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Meta Information Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-secondary flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Posted</p>
          <p className="text-sm font-medium text-foreground">
            {formatDate(created_at)}
          </p>
        </div>
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-secondary flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Deadline</p>
          <p className="text-sm font-medium text-foreground">
            {deadline ? formatDate(deadline) : "No deadline"}
          </p>
        </div>
        {applicants_count !== undefined && (
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-secondary flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Applicants</p>
            <p className="text-sm font-medium text-foreground">
              {applicants_count}
            </p>
          </div>
        )}
        {last_updated && (
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-secondary flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Updated</p>
            <p className="text-sm font-medium text-foreground">
              {formatTimeAgo(last_updated)}
            </p>
          </div>
        )}
      </div>

      {/* Status-specific Info */}
      {status === "draft" && (
        <div className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-secondary flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          {last_updated ? `Last edited ${formatTimeAgo(last_updated)}` : "Draft"}
        </div>
      )}
      {status === "pending" && (
        <div className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-secondary flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          Waiting for approval
        </div>
      )}
      {status === "published" && (
        <div className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-secondary flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          {applicants_count ? `${applicants_count} applicants` : "Live"}
        </div>
      )}
    </div>
  );
}
