import { Briefcase, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { getApplications } from "@/lib/dashboard/actions";

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; label: string; color: string }
> = {
  applied: {
    icon: Clock,
    label: "Applied",
    color: "text-muted-foreground",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-muted-foreground",
  },
  viewed: {
    icon: AlertCircle,
    label: "Viewed",
    color: "text-amber-500",
  },
  interview: {
    icon: CheckCircle2,
    label: "Interview",
    color: "text-emerald-500",
  },
  offered: {
    icon: CheckCircle2,
    label: "Offered",
    color: "text-emerald-500",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-destructive",
  },
  withdrawn: {
    icon: XCircle,
    label: "Withdrawn",
    color: "text-muted-foreground",
  },
};

export default async function ApplicationsPage() {
  const applications = await getApplications();

  const statusCounts = Object.entries(statusConfig).map(([key, config]) => ({
    ...config,
    key,
    count: applications.filter((a) => a.status === key).length,
  }));

  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Applications
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Track the status of all your job applications.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {statusCounts.map((s) => {
            if (s.count === 0 && s.key !== "applied") return null;
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="p-4 border border-border rounded-xl bg-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`size-4 ${s.color}`} />
                  <span className="text-sm text-muted-foreground">
                    {s.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {s.count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="p-8 border border-border rounded-xl bg-card text-center">
            <Briefcase className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">
              No applications yet
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start applying to jobs to track your progress here.
            </p>
            <a
              href="/jobs"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground mt-4 no-underline hover:bg-primary/90 transition-colors"
            >
              Browse Jobs
            </a>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">Position</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">Applied</div>
              <div className="col-span-2">Action</div>
            </div>
            {applications.map((app) => {
              const config =
                statusConfig[app.status] ?? statusConfig.applied;
              const Icon = config.icon;
              return (
                <div
                  key={app.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 border-border items-center hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-5 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center shrink-0">
                        <Briefcase className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {app.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.company}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color}`}
                    >
                      <Icon className="size-3.5" />
                      {config.label}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {app.appliedAt}
                  </div>
                  <div className="col-span-2">
                    <button className="text-sm text-primary font-medium hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
