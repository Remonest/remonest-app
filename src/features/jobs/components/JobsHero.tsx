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
    <div className="p-4 sm:p-8 lg:p-10 border border-border rounded-2xl bg-card mb-6 sm:mb-8 lg:mb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 sm:gap-8 lg:gap-12">
        <div className="flex-1 max-w-[600px] w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary border border-border text-secondary-foreground mb-4 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Hiring dashboard
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Jobs you created
          </h1>

          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Manage your posted roles, keep an eye on deadlines, and quickly open
            the next action from a premium admin-style list.
          </p>

          <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-full text-xs sm:text-sm bg-accent text-accent-foreground border-transparent"
            >
              All jobs
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-full text-xs sm:text-sm"
            >
              Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-full text-xs sm:text-sm"
            >
              Published
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-full text-xs sm:text-sm"
            >
              Reviewing
            </Button>
          </div>
        </div>

        <div className="flex flex-col w-full lg:w-auto">
          <div className="grid grid-cols-3 sm:flex sm:gap-3 lg:gap-4 gap-2 sm:gap-3">
            <div className="px-3 sm:px-6 py-3 sm:py-5 rounded-xl bg-secondary">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total jobs</p>
              <p className="mt-1 sm:mt-2 text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">
                {totalJobs}
              </p>
            </div>
            <div className="px-3 sm:px-6 py-3 sm:py-5 rounded-xl bg-secondary">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Published</p>
              <p className="mt-1 sm:mt-2 text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">
                {publishedJobs}
              </p>
            </div>
            <div className="px-3 sm:px-6 py-3 sm:py-5 rounded-xl bg-secondary">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Drafts</p>
              <p className="mt-1 sm:mt-2 text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">
                {draftJobs}
              </p>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 lg:mt-22 flex justify-start lg:justify-end">
            <Link
              href="/jobs/post"
              className="inline-flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-md bg-primary text-xs sm:text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90"
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
