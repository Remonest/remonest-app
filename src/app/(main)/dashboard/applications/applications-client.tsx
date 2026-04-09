"use client";

import { Briefcase, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "@/lib/translations";

interface Application {
  id: string;
  title: string;
  company: string;
  status: string;
  appliedAt: string;
}

interface ApplicationsClientProps {
  applications: Application[];
}

export function ApplicationsClient({ applications }: ApplicationsClientProps) {
  const { t } = useTranslations();

  const statusConfig: Record<
    string,
    { icon: typeof CheckCircle2; label: string; color: string }
  > = {
    applied: {
      icon: Clock,
      label: t.dashboard.applications.status.pending,
      color: "text-muted-foreground",
    },
    pending: {
      icon: Clock,
      label: t.dashboard.applications.status.pending,
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
      label: t.dashboard.applications.status.rejected,
      color: "text-destructive",
    },
    withdrawn: {
      icon: XCircle,
      label: "Withdrawn",
      color: "text-muted-foreground",
    },
  };

  const statusCounts = Object.entries(statusConfig).map(([key, config]) => ({
    ...config,
    key,
    count: applications.filter((a) => a.status === key).length,
  }));

  return (
    <div className="py-4 sm:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            {t.dashboard.applications.title}
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Track the status of all your job applications.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statusCounts.map((s) => {
            if (s.count === 0 && s.key !== "applied") return null;
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="p-3 sm:p-4 border border-border rounded-xl bg-card"
              >
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Icon className={`size-4 ${s.color}`} />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {s.label}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {s.count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="p-6 sm:p-8 border border-border rounded-xl bg-card text-center">
            <Briefcase className="size-10 sm:size-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              No applications yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Start applying to jobs to track your progress here.
            </p>
            <a
              href="/jobs"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground mt-4 no-underline hover:bg-primary/90 transition-colors"
            >
              {t.dashboard.applications.status.all === "All" ? "Browse Jobs" : "Browse Jobs"}
            </a>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            {/* Desktop table header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 p-4 border-b last:border-b-0 border-border items-start sm:items-center hover:bg-muted/50 transition-colors"
                >
                  {/* Position */}
                  <div className="sm:col-span-5 min-w-0">
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

                  {/* Desktop-only columns */}
                  <div className="hidden sm:flex sm:col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color}`}
                    >
                      <Icon className="size-3.5" />
                      {config.label}
                    </span>
                  </div>
                  <div className="hidden sm:block sm:col-span-3 text-sm text-muted-foreground">
                    {app.appliedAt}
                  </div>
                  <div className="hidden sm:flex sm:col-span-2">
                    <button className="text-sm text-primary font-medium hover:underline">
                      View Details
                    </button>
                  </div>

                  {/* Mobile meta row */}
                  <div className="flex sm:hidden items-center gap-2 ml-10">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color}`}
                    >
                      <Icon className="size-3.5" />
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &middot; {app.appliedAt}
                    </span>
                  </div>
                  <div className="sm:hidden ml-10">
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
