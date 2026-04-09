import { Globe2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface JobsHeroProps {
  totalJobs: number;
  publishedJobs: number;
  draftJobs: number;
}

export function JobsHero({
  totalJobs,
  publishedJobs,
  draftJobs,
}: JobsHeroProps) {
  return (
    <div className="p-8 sm:p-10 border border-border rounded-2xl bg-card mb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
        {/* Left: Text and Filters */}
        <div className="flex-1 max-w-[600px]">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary border border-border text-secondary-foreground mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Hiring dashboard
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Jobs you created
          </h1>

          {/* Description */}
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Manage your posted roles, keep an eye on deadlines, and quickly open
            the next action from a premium admin-style list.
          </p>

          {/* Filter Chips */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-full bg-accent text-accent-foreground border-transparent"
            >
              All jobs
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-full"
            >
              Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-full"
            >
              Published
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-full"
            >
              Reviewing
            </Button>
          </div>
        </div>

        {/* Right: Summary Cards */}
        <div className="flex flex-col">
          <div className="flex gap-4">
            <div className="px-6 py-5 rounded-xl bg-secondary min-w-[140px]">
              <p className="text-xs text-muted-foreground">Total jobs</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
                {totalJobs}
              </p>
            </div>
            <div className="px-6 py-5 rounded-xl bg-secondary min-w-[140px]">
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
                {publishedJobs}
              </p>
            </div>
            <div className="px-6 py-5 rounded-xl bg-secondary min-w-[140px]">
              <p className="text-xs text-muted-foreground">Drafts</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
                {draftJobs}
              </p>
            </div>
          </div>

          {/* Create Job Button */}
          <div className="mt-22 flex justify-end">
            <Link
              href="/jobs/post"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Post New Job
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
