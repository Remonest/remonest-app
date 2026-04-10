import { Search, SearchIcon } from "lucide-react";
import { JobCard } from "@/features/jobs/components/JobCard";
import { getJobs } from "@/features/jobs/actions/fetch-jobs";
import type { JobType } from "@/features/jobs/types/job";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: JobType; location?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const jobs = await getJobs({
    search: resolvedSearchParams.q,
    job_type: resolvedSearchParams.type,
    // location: resolvedSearchParams.location,
  });

  console.log(jobs);

  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Lowongan Kerja Remote
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-[640px]">
            Peluang kerja remote terverifikasi dari tim internasional yang
            terbuka untuk merekrut profesional berbasis di Indonesia.
          </p>
        </div>

        {/* Search & Filters */}
        <form className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              placeholder="Cari lowongan..."
              defaultValue={resolvedSearchParams.q}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <select
            name="type"
            defaultValue={resolvedSearchParams.type}
            className="inline-flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <option value="">Semua Tipe</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="project">Project</option>
            <option value="freelance">Freelance</option>
          </select>

          {/*<select
            name="location"
            defaultValue={resolvedSearchParams.location}
            className="inline-flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <option value="">Semua Lokasi</option>
            <option value="Remote">Remote</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Surabaya">Surabaya</option>
          </select>*/}

          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <SearchIcon className="size-4" />
            Cari
          </button>
        </form>

        {/* Results count */}
        {jobs.length > 0 && (
          <p className="text-sm text-muted-foreground mb-6">
            Menampilkan {jobs.length} lowongan
          </p>
        )}

        {/* Job List */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-2">
              Tidak ada lowongan yang ditemukan
            </p>
            <p className="text-sm text-muted-foreground">
              Coba ubah kata kunci atau filter pencarian Anda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.company}
                job_type={job.job_type}
                salary_min={job.salary_min}
                salary_max={job.salary_max}
                salary_currency={job.salary_currency}
                location={job.location}
                apply_url={job.apply_url}
                apply_email={job.apply_email}
                deadline={job.deadline}
                is_verified_by_admin={job.is_verified_by_admin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
