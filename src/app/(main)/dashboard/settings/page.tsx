import { getUserSettings, getUserProfile } from "@/lib/dashboard/actions";
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
        location: settings?.location ?? "",
        role: settings?.role ?? "",
        bio: settings?.bio ?? "",
      }
    : null;

  return <SettingsClient data={{ profile: profileData, settings }} />;
}
