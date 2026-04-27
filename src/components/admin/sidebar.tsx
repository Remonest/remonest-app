"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  BookOpen,
  Settings,
  LayoutDashboard,
  Menu,
  Activity,
  Upload,
  NotebookText,
  Home,
} from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";

import { UserAvatar } from "@/components/user-avatar";

const navItems = [
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/learning", label: "Learning", icon: BookOpen },
  { href: "/admin/quizzes", label: "Quizzes", icon: NotebookText },
  { href: "/admin/upload", label: "File Manager", icon: Upload },
  { href: "/admin/activity-log", label: "Activity Log", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 p-4">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileAdminHeader({ user }: { user?: { fullName?: string, email?: string, avatarUrl?: string | null } }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>

          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <UserAvatar src={user?.avatarUrl} name={user?.fullName} size="default" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{user?.fullName || user?.email}</p>
              <p className="truncate text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>

          <AdminSidebar />

          <Separator />

          <div className="p-4 space-y-2">
            <Link href="/dashboard" className="block">
              <Button variant="secondary" className="w-full !h-11 gap-2 justify-start px-4">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <SignOutButton />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold">Admin Panel</span>
      </div>

      <div className="w-10" />
    </header>
  );
}
