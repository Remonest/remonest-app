import { requireAuth } from "@/lib/auth/server";
import { getUserRole } from "@/lib/supabase/server";
import { PostJobForm } from "@/components/jobs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CircleCheck } from "lucide-react";

export default async function PostJobPage() {
  const user = await requireAuth();
  const role = await getUserRole();

  // Redirect non-clients/non-admins
  if (role !== "client" && role !== "admin") {
    redirect("/dashboard");
  }

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={isAdmin ? "/admin/jobs" : "/dashboard/jobs"}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to {isAdmin ? "Admin Jobs" : "My Jobs"}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Post a New Job
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Fill in the details below to create a new job listing.
          </p>
        </div>

        {/* Auto-Verified Banner */}
        <div className="mb-6 p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 rounded-xl">
          <div className="flex gap-3">
            <CircleCheck className="size-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                Auto-Verified Publishing
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Your job posting will be published immediately with verified status.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 border border-border rounded-xl bg-card">
          <PostJobForm isAdmin={true} />
        </div>

        {/* Help Section */}
        <div className="mt-6 p-4 border border-border rounded-xl bg-muted/50">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Tips for a Great Job Posting
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              <span>
                Use a clear, specific job title (e.g., "Senior React Developer"
                instead of "Developer Needed")
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              <span>
                Include detailed job description with responsibilities and
                requirements
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              <span>
                Provide competitive salary range to attract qualified candidates
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              <span>
                Specify work arrangement (Remote, Hybrid, On-site) clearly
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              <span>Set a reasonable application deadline (30-60 days)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
