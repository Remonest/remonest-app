import { getUserSettings, getUserProfile } from "@/features/dashboard/actions/settings";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const [profile, settings] = await Promise.all([
    getUserProfile(),
    getUserSettings(),
  ]);

  const profileData = profile
    ? {
        fullName: profile.fullName ?? "",
        email: profile.email ?? "",
        location: profile.location ?? "",
        role: profile.role ?? "",
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl ?? null,
        headline: profile.headline ?? "",
        website: profile.website ?? "",
      }
    : null;

  return <SettingsClient data={{ profile: profileData, settings }} />;
}
