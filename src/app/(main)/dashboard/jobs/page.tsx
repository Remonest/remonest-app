import { getUserRole } from "@/lib/supabase/server";
import { requireAuth } from "@/features/auth/actions/guards";
import { getUserJobs } from "@/features/jobs/actions/fetch-jobs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardJobCard } from "@/features/jobs/components/DashboardJobCard";
import { JobsHero } from "@/features/jobs/components/JobsHero";
import { JobsEmptyState } from "@/features/jobs/components/JobsEmptyState";

export default async function DashboardJobsPage() {
  await requireAuth();
  const role = await getUserRole();

  // Only clients and admins can access this page
  if (role !== "client" && role !== "admin") {
    redirect("/dashboard");
  }

  const jobs = await getUserJobs();

  // Calculate stats
  const totalJobs = jobs.length;
  const publishedJobs = jobs.filter((j) => j.status === "published").length;
  const draftJobs = jobs.filter((j) => j.status === "draft").length;

  return (
    <div className="py-4 sm:py-6 lg:py-10">
      <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6">
        {/* Hero Section with Stats */}
        <JobsHero
          totalJobs={totalJobs}
          publishedJobs={publishedJobs}
          draftJobs={draftJobs}
        />

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted mb-3 sm:mb-4">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              No job postings yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Create your first job posting to get started.
            </p>
            <Link
              href="/jobs/post"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span className="text-sm">Post Your First Job</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {jobs.map((job) => (
              <DashboardJobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.company}
                status={job.status}
                job_type={job.job_type}
                salary_min={job.salary_min}
                salary_max={job.salary_max}
                salary_period={job.salary_period}
                location={job.location}
                created_at={job.created_at}
                deadline={job.deadline}
              />
            ))}
          </div>
        )}

        {/* Empty State Example */}
        {/*<div className="mt-12">
          <JobsEmptyState />
        </div>*/}
      </div>
    </div>
  );
}
