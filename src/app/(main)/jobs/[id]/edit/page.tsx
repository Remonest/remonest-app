import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, MapPin, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getJobById } from "@/features/jobs/actions/fetch-jobs";
import { EditJobForm } from "@/features/jobs/components/EditJobForm";
import type { JobType } from "@/features/jobs/types/job";

const statusStyles: Record<string, string> = {
  draft:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  pending:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  published:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  rejected:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending: "In Review",
  published: "Published",
  rejected: "Rejected",
};

const statusDotColors: Record<string, string> = {
  draft: "bg-amber-500",
  pending: "bg-blue-500",
  published: "bg-emerald-500",
  rejected: "bg-red-500",
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

interface JobData {
  id: string;
  title: string;
  company: string;
  description_html: string;
  job_type: JobType;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  location: string;
  deadline: string | null;
  duration_estimate: string | null;
  apply_method: "url" | "email";
  apply_url: string | null;
  apply_email: string | null;
  status: "draft" | "pending" | "published" | "rejected";
  skills: string[];
  created_at?: string;
  rejection_reason?: string;
}

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return (
      <div className="py-8">
        <div className="w-full max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">
              Lowongan tidak ditemukan
            </h2>
            <p className="text-muted-foreground mb-6">
              The job you're trying to edit does not exist or you don't have
              permission to access it.
            </p>
            <a
              href="/dashboard/jobs"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90"
            >
              Kembali ke Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Extract skills from description HTML (if any tags exist)
  const extractSkills = (html: string): string[] => {
    const skillRegex = /<div class="tag">([^<]+)<\/div>/g;
    const skills: string[] = [];
    let match;
    while ((match = skillRegex.exec(html)) !== null) {
      skills.push(match[1]);
    }
    return skills;
  };

  const jobData: JobData = {
    id: job.id,
    title: job.title,
    company: job.company,
    description_html: job.description_html,
    job_type: job.job_type,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: job.salary_currency || "IDR",
    location: job.location,
    deadline: job.deadline,
    duration_estimate: job.duration_estimate,
    apply_method: job.apply_method,
    apply_url: job.apply_url,
    apply_email: job.apply_email,
    status: job.status,
    skills: extractSkills(job.description_html),
    created_at: job.created_at,
    rejection_reason: job.rejection_reason,
  };

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
                  Edit Job Listing
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
                    {job.salary_max &&
                      ` - ${formatSalary(job.salary_max, job.salary_currency || "IDR")}`}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/dashboard/jobs/${job.id}`}>
                <Button variant="outline" className="h-10 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">View Job</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <EditJobForm job={jobData} />
      </div>
    </div>
  );
}
