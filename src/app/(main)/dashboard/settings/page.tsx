"use client";

import { useState } from "react";
import { User, Bell, Shield, Palette } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

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

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="p-5 border border-border rounded-xl bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Profile Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  defaultValue="Jakarta, Indonesia"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Role</label>
                <input
                  type="text"
                  defaultValue="Frontend Developer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                rows={3}
                defaultValue="Passionate about building beautiful web experiences."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-5 border border-border rounded-xl bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Notification Preferences
            </h2>
            {[
              {
                label: "Email notifications",
                desc: "Receive updates about your applications via email",
                defaultChecked: true,
              },
              {
                label: "Job alerts",
                desc: "Get notified when new jobs match your profile",
                defaultChecked: true,
              },
              {
                label: "Learning reminders",
                desc: "Reminders to continue your learning modules",
                defaultChecked: false,
              },
              {
                label: "Marketing emails",
                desc: "Receive tips, news, and product updates",
                defaultChecked: false,
              },
            ].map((pref) => (
              <div
                key={pref.label}
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
                    defaultChecked={pref.defaultChecked}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === "appearance" && (
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
                  className="flex-1 p-4 border border-border rounded-lg text-center hover:border-primary/50 transition-colors"
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
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="p-5 border border-border rounded-xl bg-card space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Security
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex justify-end">
                <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/90">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
