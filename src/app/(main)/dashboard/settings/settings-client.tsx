"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Bell, Shield, Palette, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  saveProfileSettings,
  saveNotificationPreferences,
  updatePassword,
} from "@/lib/dashboard/actions";
import type { UserSettings as UserSettingsType } from "@/lib/dashboard/actions";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

interface SettingsData {
  profile: {
    fullName: string;
    email: string;
    location: string;
    role: string;
    bio: string;
  } | null;
  settings: UserSettingsType | null;
}

export default function SettingsClient({
  data,
}: {
  data: SettingsData;
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState(data.profile ?? {
    fullName: "",
    email: "",
    location: "",
    role: "",
    bio: "",
  });

  const [notifForm, setNotifForm] = useState({
    emailNotifications: data.settings?.emailNotifications ?? true,
    jobAlerts: data.settings?.jobAlerts ?? true,
    learningReminders: data.settings?.learningReminders ?? false,
    marketingEmails: data.settings?.marketingEmails ?? false,
  });

  return (
    <div className="py-8">
      <div className="w-full max-w-[900px] mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage your profile, preferences, and account settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <ProfileTab initialData={profileForm} />
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <NotificationsTab initialData={notifForm} />
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && <AppearanceTab />}

        {/* Security Tab */}
        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}

// ============================================================
// Profile Tab
// ============================================================

function ProfileTab({
  initialData,
}: {
  initialData: {
    fullName: string;
    email: string;
    location: string;
    role: string;
    bio: string;
  };
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
      toast.success("Profile saved successfully");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="p-5 border border-border rounded-xl bg-card space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Profile Information
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            defaultValue={initialData.fullName}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            defaultValue={initialData.email}
            disabled
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="location" className="text-sm font-medium">
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
        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="text-sm font-medium">
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
      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-sm font-medium">
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
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// Notifications Tab
// ============================================================

function NotificationsTab({
  initialData,
}: {
  initialData: {
    emailNotifications: boolean;
    jobAlerts: boolean;
    learningReminders: boolean;
    marketingEmails: boolean;
  };
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return saveNotificationPreferences(formData);
    },
    null
  );

  const [toggles, setToggles] = useState(initialData);

  useEffect(() => {
    if (state?.success) {
      toast.success("Notification preferences saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const preferences = [
    {
      key: "emailNotifications" as const,
      label: "Email notifications",
      desc: "Receive updates about your applications via email",
    },
    {
      key: "jobAlerts" as const,
      label: "Job alerts",
      desc: "Get notified when new jobs match your profile",
    },
    {
      key: "learningReminders" as const,
      label: "Learning reminders",
      desc: "Reminders to continue your learning modules",
    },
    {
      key: "marketingEmails" as const,
      label: "Marketing emails",
      desc: "Receive tips, news, and product updates",
    },
  ];

  return (
    <form action={formAction} className="p-5 border border-border rounded-xl bg-card space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Notification Preferences
      </h2>
      {preferences.map((pref) => (
        <div
          key={pref.key}
          className="flex items-center justify-between py-3 border-b last:border-b-0 border-border"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {pref.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pref.desc}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name={pref.key}
              checked={toggles[pref.key]}
              onChange={(e) =>
                setToggles((prev) => ({
                  ...prev,
                  [pref.key]: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// Appearance Tab
// ============================================================

function AppearanceTab() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("remonest-theme") ?? "light";
    }
    return "light";
  });

  const applyTheme = (mode: string) => {
    setTheme(mode);
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", mode === "dark");
    }
    localStorage.setItem("remonest-theme", mode);
  };

  return (
    <div className="p-5 border border-border rounded-xl bg-card space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Appearance
      </h2>
      <p className="text-sm text-muted-foreground">
        Customize how Remonest looks on your device.
      </p>
      <div className="flex gap-4">
        {["Light", "Dark", "System"].map((mode) => (
          <button
            key={mode}
            onClick={() => applyTheme(mode.toLowerCase())}
            className={`flex-1 p-4 border rounded-lg text-center transition-colors ${
              theme === mode.toLowerCase()
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div
              className={`w-full h-16 rounded-md mb-2 ${
                mode === "Light"
                  ? "bg-white border border-border"
                  : mode === "Dark"
                    ? "bg-zinc-900"
                    : "bg-gradient-to-br from-white to-zinc-900"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              {mode}
            </span>
            {theme === mode.toLowerCase() && (
              <Check className="size-4 mx-auto mt-1 text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Security Tab
// ============================================================

function SecurityTab() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return updatePassword(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Password updated successfully");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="p-5 border border-border rounded-xl bg-card space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Security
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirmNewPassword" className="text-sm font-medium">
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
