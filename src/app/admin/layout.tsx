import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require-admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, LogOut, Home } from "lucide-react";

import { ForceLightTheme } from "@/components/admin/force-light-theme";
import { UserAvatar } from "@/components/user-avatar";

const AdminSidebar = dynamic(() => import("@/components/admin/sidebar").then((mod) => ({ default: mod.AdminSidebar })));
const MobileAdminHeader = dynamic(() => import("@/components/admin/sidebar").then((mod) => ({ default: mod.MobileAdminHeader })));

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen bg-background force-light">
      {/* Sidebar skeleton */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Skeleton className="h-6 w-28" />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </nav>
      </aside>

      {/* Main content skeleton */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-border px-4 lg:hidden">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="ml-4 h-6 w-24" />
        </header>
        <main className="flex-1 p-6">
          <Skeleton className="h-96 w-full rounded-lg" />
        </main>
      </div>
    </div>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background force-light">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>

        <AdminSidebar />

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-accent p-3">
            <UserAvatar src={admin.avatar_url} name={admin.full_name} size="default" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{admin.full_name || admin.email}</p>
              <p className="truncate text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/dashboard" className="block w-full">
              <Button variant="secondary" size="sm" className="w-full gap-2 justify-start">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <form
              action={async () => {
                "use server";
                const { logoutAction } = await import("@/features/auth/actions/session");
                await logoutAction();
              }}
            >
              <Button type="submit" variant="outline" size="sm" className="w-full gap-2 justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <MobileAdminHeader user={{ fullName: admin.full_name, email: admin.email, avatarUrl: admin.avatar_url }} />

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ForceLightTheme />
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
