import { getUserRole } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { getUserJobs } from "@/lib/jobs/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default async function DashboardJobsPage() {
  await requireAuth();
  const role = await getUserRole();

  // Only clients and admins can access this page
  if (role !== "client" && role !== "admin") {
    redirect("/dashboard");
  }

  const jobs = await getUserJobs();

  const statusIcons = {
    draft: <Edit3 className="size-4" />,
    pending: <Clock className="size-4" />,
    approved: <CheckCircle2 className="size-4" />,
    rejected: <XCircle className="size-4" />,
    published: <CheckCircle2 className="size-4" />,
    expired: <AlertCircle className="size-4" />,
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    approved: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    expired: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      pending: "Menunggu Persetujuan",
      approved: "Disetujui",
      rejected: "Ditolak",
      published: "Diterbitkan",
      expired: "Kadaluarsa",
    };
    return labels[status] || status;
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "full-time": "Penuh Waktu",
      "part-time": "Paruh Waktu",
      project: "Proyek",
      freelance: "Freelance",
    };
    return labels[type] || type;
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

  return (
    <div className="py-4 sm:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Job Postings
            </h1>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
              Manage your job listings and track their status.
            </p>
          </div>
          <Link
            href="/jobs/post"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Post New Job
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 border border-border rounded-xl bg-card">
            <p className="text-2xl font-bold text-foreground">
              {jobs.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Postings</p>
          </div>
          <div className="p-4 border border-border rounded-xl bg-card">
            <p className="text-2xl font-bold text-amber-600">
              {jobs.filter((j) => j.status === "pending").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </div>
          <div className="p-4 border border-border rounded-xl bg-card">
            <p className="text-2xl font-bold text-emerald-600">
              {jobs.filter((j) => j.status === "published").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Published</p>
          </div>
          <div className="p-4 border border-border rounded-xl bg-card">
            <p className="text-2xl font-bold text-gray-600">
              {jobs.filter((j) => j.status === "draft").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Drafts</p>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="p-8 sm:p-12 border border-border rounded-xl bg-card text-center">
            <FileText className="size-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold text-foreground">
              No job postings yet
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first job posting to get started.
            </p>
            <Link
              href="/jobs/post"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 sm:p-5 border border-border rounded-xl bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {job.company}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          statusColors[job.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusIcons[job.status as keyof typeof statusIcons]}
                        {getStatusLabel(job.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                      {job.job_type && (
                        <span>{getJobTypeLabel(job.job_type)}</span>
                      )}
                      {job.salary_min && (
                        <span>
                          {formatSalary(job.salary_min)}
                          {job.salary_max && ` - ${formatSalary(job.salary_max)}`}
                          {job.salary_period && ` / ${job.salary_period}`}
                        </span>
                      )}
                      {job.location && <span>{job.location}</span>}
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>

                    {job.deadline && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Application deadline: {formatDate(job.deadline)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Eye className="size-3.5" />
                      View
                    </Link>
                    {job.status === "draft" && (
                      <Link
                        href={`/jobs/${job.id}/edit`}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Edit3 className="size-3.5" />
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejected Jobs Notice */}
        {jobs.some((j) => j.status === "rejected") && (
          <div className="mt-4 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Some of your job postings were rejected
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Please review the rejection reasons and resubmit with necessary
                  changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
