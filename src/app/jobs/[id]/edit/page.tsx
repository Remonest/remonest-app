import { redirect } from "next/navigation";
import { getJobById } from "@/lib/jobs/actions";
import { EditJobForm } from "@/components/jobs/edit-job-form";
import type { JobType } from "@/lib/jobs/utils";

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
            <a href="/dashboard/jobs" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90">
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
  };

  return <EditJobForm job={jobData} />;
}
