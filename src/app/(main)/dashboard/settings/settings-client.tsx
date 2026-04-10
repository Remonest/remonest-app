"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Bell, Shield, Palette, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  saveProfileSettings,
  saveNotificationPreferences,
} from "@/features/dashboard/actions/settings";
import { updatePassword } from "@/features/dashboard/actions/security";
import { useTranslations } from "@/lib/translations";
import type { UserSettings as UserSettingsType } from "@/features/dashboard/types/dashboard";

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
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: t.dashboard.settings.profile, icon: User },
    { id: "notifications", label: t.dashboard.settings.notifications, icon: Bell },
    { id: "appearance", label: t.dashboard.settings.appearance, icon: Palette },
    { id: "security", label: t.dashboard.settings.security, icon: Shield },
  ];

  const profileData = data.profile ?? {
    fullName: "",
    email: "",
    location: "",
    role: "",
    bio: "",
  };

  const notifData = {
    emailNotifications: data.settings?.emailNotifications ?? true,
    jobAlerts: data.settings?.jobAlerts ?? true,
    learningReminders: data.settings?.learningReminders ?? false,
    marketingEmails: data.settings?.marketingEmails ?? false,
  };

  return (
    <div className="py-4 sm:py-8">
      <div className="mx-auto w-full max-w-[900px]">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            {t.dashboard.settings.title}
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            {t.dashboard.settings.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4 sm:mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-3.5 sm:size-4" />
              <span className="sm:hidden">{tab.label === "Profile" ? "Profile" : tab.label === "Notifications" ? "Notifs" : tab.label === "Appearance" ? "Theme" : "Secure"}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <ProfileTab key={`profile-${profileData.fullName}-${profileData.email}`} initialData={profileData} />
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <NotificationsTab key={`notif-${notifData.emailNotifications}-${notifData.jobAlerts}`} initialData={notifData} />
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
  const { t } = useTranslations();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return saveProfileSettings(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(t.dashboard.settings.saved);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, t]);

  return (
    <form action={formAction} className="p-4 sm:p-5 border border-border rounded-xl bg-card space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-foreground">
        {t.dashboard.settings.profileInfo}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            {t.dashboard.settings.fullName}
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
            {t.dashboard.settings.email}
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
            {t.dashboard.settings.location}
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={initialData.location}
            placeholder={t.dashboard.settings.locationPlaceholder}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="text-sm font-medium">
            {t.dashboard.settings.role}
          </label>
          <input
            id="role"
            name="role"
            type="text"
            defaultValue={initialData.role}
            placeholder={t.dashboard.settings.rolePlaceholder}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-sm font-medium">
          {t.dashboard.settings.bio}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={initialData.bio}
          placeholder={t.dashboard.settings.bioPlaceholder}
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
              {t.dashboard.settings.saving}
            </>
          ) : (
            t.dashboard.settings.saveChanges
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
  const { t } = useTranslations();
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
      toast.success(t.dashboard.settings.savePreferences);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, t]);

  const preferences = [
    {
      key: "emailNotifications" as const,
      label: t.dashboard.settings.emailNotifications,
      desc: t.dashboard.settings.emailNotificationsDesc,
    },
    {
      key: "jobAlerts" as const,
      label: t.dashboard.settings.jobAlerts,
      desc: t.dashboard.settings.jobAlertsDesc,
    },
    {
      key: "learningReminders" as const,
      label: t.dashboard.settings.learningReminders,
      desc: t.dashboard.settings.learningRemindersDesc,
    },
    {
      key: "marketingEmails" as const,
      label: t.dashboard.settings.marketingEmails,
      desc: t.dashboard.settings.marketingEmailsDesc,
    },
  ];

  return (
    <form action={formAction} className="p-4 sm:p-5 border border-border rounded-xl bg-card space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-foreground">
        {t.dashboard.settings.notificationPrefs}
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
              {t.dashboard.settings.saving}
            </>
          ) : (
            t.dashboard.settings.savePreferences
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
  const { t } = useTranslations();
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

  const themeOptions = [
    { key: "light", label: t.dashboard.settings.light },
    { key: "dark", label: t.dashboard.settings.dark },
    { key: "system", label: t.dashboard.settings.system },
  ];

  return (
    <div className="p-4 sm:p-5 border border-border rounded-xl bg-card space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-foreground">
        {t.dashboard.settings.appearance}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t.dashboard.settings.customizeTheme}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {themeOptions.map((mode) => (
          <button
            key={mode.key}
            onClick={() => applyTheme(mode.key)}
            className={`flex-1 p-3 sm:p-4 border rounded-lg text-center transition-colors ${
              theme === mode.key
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div
              className={`w-full h-14 sm:h-16 rounded-md mb-2 ${
                mode.key === "light"
                  ? "bg-white border border-border"
                  : mode.key === "dark"
                    ? "bg-zinc-900"
                    : "bg-gradient-to-br from-white to-zinc-900"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              {mode.label}
            </span>
            {theme === mode.key && (
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
  const { t } = useTranslations();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return updatePassword(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(t.dashboard.settings.updated);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, t]);

  return (
    <form action={formAction} className="p-4 sm:p-5 border border-border rounded-xl bg-card space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-foreground">
        {t.dashboard.settings.security}
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            {t.dashboard.settings.currentPassword}
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
            {t.dashboard.settings.newPassword}
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
            {t.dashboard.settings.confirmNewPassword}
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
                {t.dashboard.settings.updating}
              </>
            ) : (
              t.dashboard.settings.updatePassword
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
