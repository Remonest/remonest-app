"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Edit3,
  Save,
  X,
  Loader2,
  TrendingUp,
  Send,
  BookOpen,
  Eye,
  Download,
  Clock,
  Building2,
  Users,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import { saveProfileSettings } from "@/features/dashboard/actions/settings";
import { UserAvatar } from "@/components/user-avatar";

interface ProfileData {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  location: string;
  role: string;
  bio: string;
  userRole: "admin" | "user" | "client";
  stats: {
    applicationsSent: number;
    modulesCompleted: number;
    profileViews: number;
    cvDownloads: number;
  };
  recentActivity: Array<{
    id: string;
    actionType: string;
    title: string;
    company: string;
    time: string;
    status: string;
  }>;
}

export default function ProfileClient({ data }: { data: ProfileData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "activity">(
    "overview"
  );

  const isClient = data.userRole === "client";

  return (
    <div className="min-h-screen bg-background">
      {/* Cover + Avatar Header */}
      <div className="relative">
        {/* Cover */}
        <div className="h-40 sm:h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-background" />

        {/* Profile Header */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-16 sm:-mt-20">
            {/* Avatar */}
            <div className="relative">
              <UserAvatar 
                src={data.avatarUrl} 
                name={data.fullName} 
                className="size-28 sm:size-32 rounded-2xl border-4 border-background bg-muted shadow-lg" 
              />
              <div className="absolute -bottom-1 -right-1 size-5 sm:size-6 bg-green-500 rounded-full border-2 border-background" />
            </div>

            {/* Name + Actions */}
            <div className="flex-1 pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {data.fullName}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {data.role && (
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="size-3.5" />
                        {data.role}
                      </span>
                    )}
                    {data.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {data.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Mail className="size-3.5" />
                      {data.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Edit3 className="size-3.5" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {(["overview", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats */}
            {isClient ? (
              <ClientStatsGrid />
            ) : (
              <StatsGrid stats={data.stats} />
            )}

            {/* Bio */}
            {data.bio && (
              <div className="p-4 sm:p-5 border border-border rounded-xl bg-card">
                <h2 className="text-base font-semibold text-foreground mb-2">
                  About
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {data.bio}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            {isClient ? <ClientQuickActions /> : <QuickActions />}
          </>
        )}

        {activeTab === "activity" && (
          <ActivityFeed activity={data.recentActivity} />
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditModal
          initialData={{
            fullName: data.fullName,
            location: data.location,
            role: data.role,
            bio: data.bio,
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// Client Stats Grid (for client role)
// ============================================================

function ClientStatsGrid() {
  const items = [
    {
      label: "Jobs Posted",
      value: 12,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active Listings",
      value: 5,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total Applicants",
      value: 47,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Jobs Filled",
      value: 8,
      icon: CheckSquare,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="p-4 sm:p-5 border border-border rounded-xl bg-card hover:border-primary/30 transition-colors"
        >
          <div className={`inline-flex p-2 rounded-lg ${item.bgColor} mb-3`}>
            <item.icon className={`size-4 ${item.color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Stats Grid
// ============================================================

function StatsGrid({
  stats,
}: {
  stats: {
    applicationsSent: number;
    modulesCompleted: number;
    profileViews: number;
    cvDownloads: number;
  };
}) {
  const items = [
    {
      label: "Applications Sent",
      value: stats.applicationsSent,
      icon: Send,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Modules Completed",
      value: stats.modulesCompleted,
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Profile Views",
      value: stats.profileViews,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "CV Downloads",
      value: stats.cvDownloads,
      icon: Download,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="p-4 sm:p-5 border border-border rounded-xl bg-card hover:border-primary/30 transition-colors"
        >
          <div className={`inline-flex p-2 rounded-lg ${item.bgColor} mb-3`}>
            <item.icon className={`size-4 ${item.color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Client Quick Actions
// ============================================================

function ClientQuickActions() {
  return (
    <div className="p-4 sm:p-5 border border-border rounded-xl bg-card">
      <h2 className="text-base font-semibold text-foreground mb-3">
        Employer Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="/jobs/post"
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors"
        >
          <FileText className="size-4 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-foreground">Post New Job</p>
            <p className="text-xs text-muted-foreground">Create a listing</p>
          </div>
        </a>
        <a
          href="/dashboard/jobs"
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors"
        >
          <Building2 className="size-4 text-green-500" />
          <div>
            <p className="text-sm font-medium text-foreground">Manage Jobs</p>
            <p className="text-xs text-muted-foreground">View your postings</p>
          </div>
        </a>
        <a
          href="/dashboard/applications"
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors"
        >
          <Users className="size-4 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-foreground">Applicants</p>
            <p className="text-xs text-muted-foreground">Review candidates</p>
          </div>
        </a>
      </div>
    </div>
  );
}

// ============================================================
// Quick Actions
// ============================================================

function QuickActions() {
  return (
    <div className="p-4 sm:p-5 border border-border rounded-xl bg-card">
      <h2 className="text-base font-semibold text-foreground mb-3">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="/dashboard/applications"
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors"
        >
          <Send className="size-4 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-foreground">Applications</p>
            <p className="text-xs text-muted-foreground">Track your jobs</p>
          </div>
        </a>
        <a
          href="/portfolio"
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors"
        >
          <FileText className="size-4 text-green-500" />
          <div>
            <p className="text-sm font-medium text-foreground">Portfolio</p>
            <p className="text-xs text-muted-foreground">Showcase your work</p>
          </div>
        </a>
        <a
          href="/cv-builder"
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted transition-colors"
        >
          <TrendingUp className="size-4 text-orange-500" />
          <div>
            <p className="text-sm font-medium text-foreground">CV Builder</p>
            <p className="text-xs text-muted-foreground">Build your resume</p>
          </div>
        </a>
      </div>
    </div>
  );
}

// ============================================================
// Activity Feed
// ============================================================

function ActivityFeed({
  activity,
}: {
  activity: Array<{
    id: string;
    actionType: string;
    title: string;
    company: string;
    time: string;
    status: string;
  }>;
}) {
  if (activity.length === 0) {
    return (
      <div className="p-8 sm:p-12 border border-border rounded-xl bg-card text-center">
        <Clock className="size-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-medium text-foreground">
          No activity yet
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your recent actions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-card divide-y divide-border">
      {activity.map((item) => (
        <div key={item.id} className="p-4 flex items-start gap-3">
          <div
            className={`mt-1 size-2 rounded-full shrink-0 ${
              item.status === "completed" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {item.title}
            </p>
            {item.company && (
              <p className="text-xs text-muted-foreground">{item.company}</p>
            )}
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {item.time}
          </time>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Edit Modal
// ============================================================

function EditModal({
  initialData,
  onClose,
}: {
  initialData: {
    fullName: string;
    location: string;
    role: string;
    bio: string;
  };
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return saveProfileSettings(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Profile updated successfully");
      router.refresh();
      onClose();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="p-4 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={initialData.fullName}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className="text-sm font-medium text-foreground">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={initialData.location}
                placeholder="Jakarta, Indonesia"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-sm font-medium text-foreground">
                Role
              </label>
              <input
                id="role"
                name="role"
                type="text"
                defaultValue={initialData.role}
                placeholder="Frontend Developer"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={initialData.bio}
              placeholder="Tell us about yourself..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 size-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
