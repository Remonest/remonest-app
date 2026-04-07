import { Suspense } from "react";
import {
  Briefcase,
  BookOpen,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, getRecentActivity } from "@/lib/dashboard/actions";

function LoadingSkeleton() {
  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="mb-8">
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 animate-pulse rounded-xl border bg-card" />
          <div className="h-64 animate-pulse rounded-xl border bg-card" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContentInner({ stats, activities }: {
  stats: Awaited<ReturnType<typeof getDashboardStats>>;
  activities: Awaited<ReturnType<typeof getRecentActivity>>;
}) {
  const statusIconMap: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    pending: { icon: Clock, color: "text-muted-foreground" },
    completed: { icon: CheckCircle2, color: "text-emerald-500" },
    "in-progress": { icon: AlertCircle, color: "text-amber-500" },
  };

  const statsCards = [
    {
      label: "Applications Sent",
      value: stats.applicationsSent.toString(),
      change: stats.applicationsChange,
      icon: Briefcase,
      trend: "up" as const,
    },
    {
      label: "Modules Completed",
      value: stats.modulesCompleted.toString(),
      change: stats.modulesChange,
      icon: BookOpen,
      trend: "up" as const,
    },
    {
      label: "Profile Views",
      value: stats.profileViews.toString(),
      change: stats.profileViewsChange,
      icon: TrendingUp,
      trend: "up" as const,
    },
    {
      label: "CV Downloads",
      value: stats.cvDownloads.toString(),
      change: stats.cvDownloadsChange,
      icon: FileText,
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="py-4 sm:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Track your progress, applications, and learning journey.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="p-4 sm:p-5 border border-border rounded-xl bg-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-md bg-secondary text-primary flex items-center justify-center">
                  <stat.icon className="size-5" />
                </div>
                {stat.trend === "up" && (
                  <ArrowUpRight className="size-4 text-emerald-500" />
                )}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 p-4 sm:p-5 border border-border rounded-xl bg-card">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No activity yet. Start by browsing jobs or learning modules.
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const iconConfig =
                    statusIconMap[activity.status] ?? {
                      icon: Clock,
                      color: "text-muted-foreground",
                    };
                  const Icon = iconConfig.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-b-0 border-border last:mb-0"
                    >
                      <div className={`mt-0.5 shrink-0 ${iconConfig.color}`}>
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        {activity.company && (
                          <p className="text-xs text-muted-foreground">
                            {activity.company}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 sm:p-5 border border-border rounded-xl bg-card">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/jobs"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors no-underline"
              >
                <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center shrink-0">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Browse Jobs
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Find remote opportunities
                  </p>
                </div>
              </Link>
              <Link
                href="/learning"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors no-underline"
              >
                <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center shrink-0">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Continue Learning
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Build remote-ready skills
                  </p>
                </div>
              </Link>
              <Link
                href="/cv-builder"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors no-underline"
              >
                <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Update CV
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Edit your resume
                  </p>
                </div>
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors no-underline"
              >
                <div className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center shrink-0">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Edit Portfolio
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Showcase your work
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const [stats, activities] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(5),
  ]);

  return <DashboardContentInner stats={stats} activities={activities} />;
}
