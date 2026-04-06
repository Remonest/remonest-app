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

const stats = [
  {
    label: "Applications Sent",
    value: "12",
    change: "+3 this week",
    icon: Briefcase,
    trend: "up",
  },
  {
    label: "Modules Completed",
    value: "8",
    change: "2 in progress",
    icon: BookOpen,
    trend: "up",
  },
  {
    label: "Profile Views",
    value: "47",
    change: "+12% vs last week",
    icon: TrendingUp,
    trend: "up",
  },
  {
    label: "CV Downloads",
    value: "3",
    change: "ATS-ready",
    icon: FileText,
    trend: "neutral",
  },
];

const recentActivity = [
  {
    title: "Applied to Senior Frontend Developer",
    company: "RemoteFirst Inc.",
    time: "2 hours ago",
    status: "pending",
  },
  {
    title: "Completed: Async Communication Basics",
    company: "Learning Module",
    time: "Yesterday",
    status: "completed",
  },
  {
    title: "Applied to Product Designer",
    company: "DesignLab",
    time: "3 days ago",
    status: "viewed",
  },
];

export default function DashboardPage() {
  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Track your progress, applications, and learning journey.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-5 border border-border rounded-xl bg-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-md bg-secondary text-primary flex items-center justify-center">
                  <stat.icon className="size-5" />
                </div>
                {stat.trend === "up" && (
                  <ArrowUpRight className="size-4 text-emerald-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-foreground">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 p-5 border border-border rounded-xl bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-b-0 border-border last:mb-0"
                >
                  <div className="mt-0.5">
                    {activity.status === "completed" ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : activity.status === "viewed" ? (
                      <AlertCircle className="size-5 text-amber-500" />
                    ) : (
                      <Clock className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.company}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 border border-border rounded-xl bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">
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
                    2 modules in progress
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
