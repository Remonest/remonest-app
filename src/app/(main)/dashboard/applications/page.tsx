import { Briefcase, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const applications = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "RemoteFirst Inc.",
    appliedAt: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    title: "Product Designer",
    company: "DesignLab",
    appliedAt: "3 days ago",
    status: "viewed",
  },
  {
    id: 3,
    title: "Full Stack Engineer",
    company: "CloudNative Co.",
    appliedAt: "1 week ago",
    status: "rejected",
  },
  {
    id: 4,
    title: "Digital Marketing Specialist",
    company: "GrowthHQ",
    appliedAt: "2 weeks ago",
    status: "interview",
  },
];

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; label: string; color: string }
> = {
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
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-destructive",
  },
};

export default function ApplicationsPage() {
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
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = applications.filter(
              (a) => a.status === key
            ).length;
            const Icon = config.icon;
            return (
              <div
                key={key}
                className="p-4 border border-border rounded-xl bg-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`size-4 ${config.color}`} />
                  <span className="text-sm text-muted-foreground">
                    {config.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Applications List */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-5">Position</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Applied</div>
            <div className="col-span-2">Action</div>
          </div>
          {applications.map((app) => {
            const config = statusConfig[app.status];
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
      </div>
    </div>
  );
}
