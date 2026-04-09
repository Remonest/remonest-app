import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Banknote,
  Copy,
  PencilLine,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getJobById } from "@/lib/jobs/actions";
import { requireAuth, getCurrentUser } from "@/lib/auth/server";
import { getUserRole } from "@/lib/supabase/server";

const statusStyles: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  pending: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  published: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  rejected: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  expired: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending: "In Review",
  published: "Published",
  rejected: "Rejected",
  expired: "Expired",
  approved: "Approved",
};

const statusDotColors: Record<string, string> = {
  draft: "bg-amber-500",
  pending: "bg-blue-500",
  published: "bg-emerald-500",
  rejected: "bg-red-500",
  expired: "bg-gray-500",
  approved: "bg-emerald-500",
};

const jobTypeLabels: Record<string, string> = {
  "full-time": "Penuh Waktu",
  "part-time": "Paruh Waktu",
  project: "Proyek",
  freelance: "Freelance",
};

const formatSalary = (amount: number, currency = "IDR") => {
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

async function getJobWithStats(id: string, userId: string | null) {
  const job = await getJobById(id);

  if (!job) {
    return null;
  }

  // Check if user has access (owner or admin)
  if (userId && job.posted_by_user_id !== userId) {
    const role = await getUserRole();
    if (role !== "admin") {
      return null;
    }
  }

  return job;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const user = await getCurrentUser();
  const { id } = await params;
  const job = await getJobWithStats(id, user?.id || null);

  if (!job) {
    redirect("/dashboard/jobs");
  }

  // Mock stats - replace with actual data from database when available
  const mockStats = {
    totalApplicants: 23,
    inReview: 8,
    shortlisted: 3,
    interviewing: 1,
    rejected: 11,
    trendToday: 5,
  };

  const extractSkills = (html: string): string[] => {
    const skillRegex = /<div class="tag">([^<]+)<\/div>/g;
    const skills: string[] = [];
    let match;
    while ((match = skillRegex.exec(html)) !== null) {
      skills.push(match[1]);
    }
    return skills;
  };

  const skills = extractSkills(job.description_html || "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Back Navigation */}
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jobs
        </Link>

        {/* Job Header Panel */}
        <div className="panel p-6 sm:p-8 border border-border rounded-2xl bg-card mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Job Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 flex-wrap mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {job.title}
                </h1>
                <span
                  className={`inline-flex items-center gap-2 h-8 px-3 rounded-full text-sm font-medium border ${statusStyles[job.status]}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${statusDotColors[job.status]}`}
                  />
                  {statusLabels[job.status]}
                </span>
              </div>

              {/* Meta Pills */}
              <div className="flex flex-wrap gap-3">
                {job.job_type && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-foreground">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {jobTypeLabels[job.job_type] || job.job_type}
                  </div>
                )}
                {job.location && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {job.location}
                  </div>
                )}
                {job.salary_min && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-foreground">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    {formatSalary(job.salary_min, job.salary_currency || "IDR")}
                    {job.salary_max && ` - ${formatSalary(job.salary_max, job.salary_currency || "IDR")}`}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="h-10 gap-2">
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Duplicate</span>
              </Button>
              {(job.status === "draft" || job.status === "pending") && (
                <Link href={`/dashboard/jobs/${job.id}/edit`}>
                  <Button variant="outline" className="h-10 gap-2">
                    <PencilLine className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Job</span>
                  </Button>
                </Link>
              )}
              {job.status === "published" && (
                <Button className="h-10 gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">View Candidates</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column: Description */}
          <div className="panel p-6 sm:p-8 border border-border rounded-2xl bg-card">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 pb-4 border-b border-border mb-6">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Job Description
            </h2>

            <div
              className="text-sm sm:text-base text-muted-foreground rich-text-content"
              dangerouslySetInnerHTML={{ __html: job.description_html || "" }}
            />

            {/* Skills Tags */}
            {skills.length > 0 && (
              <>
                <h3 className="text-base font-semibold text-foreground mt-8 mb-3">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 bg-secondary text-foreground text-sm rounded-md border border-border"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Performance Panel */}
            {job.status === "published" && (
              <div className="panel p-6 border border-border rounded-2xl bg-card">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  Candidate Pipeline
                </h3>

                <div className="p-4 bg-secondary rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Applicants
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {mockStats.totalApplicants}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{mockStats.trendToday} today
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      In Review
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {mockStats.inReview}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Shortlisted
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {mockStats.shortlisted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Interviewing
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {mockStats.interviewing}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Rejected
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {mockStats.rejected}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Details Panel */}
            <div className="panel p-6 border border-border rounded-2xl bg-card">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Posting Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Date Posted
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(job.created_at)}
                  </p>
                </div>

                {job.deadline && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Application Deadline
                    </p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(job.deadline)}
                    </p>
                  </div>
                )}

                {job.duration_estimate && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Duration Estimate
                    </p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {job.duration_estimate}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Visibility
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {job.status === "published"
                      ? "Public Job Board"
                      : job.status === "draft"
                        ? "Private Draft"
                        : "Pending Review"}
                  </p>
                </div>

                {job.status === "rejected" && job.rejection_reason && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {job.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
