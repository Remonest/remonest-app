import { getUserProfile, getUserSettings } from "@/features/dashboard/actions/settings";
import { getDashboardStats } from "@/features/dashboard/actions/stats";
import { getRecentActivity } from "@/features/dashboard/actions/activity";
import { getUserRole } from "@/lib/supabase/server";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const [profile, settings, stats, activity, role] = await Promise.all([
    getUserProfile(),
    getUserSettings(),
    getDashboardStats(),
    getRecentActivity(5),
    getUserRole(),
  ]);

  const profileData = {
    fullName: profile?.fullName ?? "User",
    email: profile?.email ?? "",
    avatarUrl: profile?.avatarUrl ?? null,
    location: settings?.location ?? "",
    role: settings?.role ?? "",
    bio: settings?.bio ?? "",
    userRole: role ?? "user",
    stats: {
      applicationsSent: stats.applicationsSent,
      modulesCompleted: stats.modulesCompleted,
      profileViews: stats.profileViews,
      cvDownloads: stats.cvDownloads,
    },
    recentActivity: activity,
  };

  return <ProfileClient data={profileData} />;
}
