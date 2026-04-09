import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getSupabaseServerClient, getUserRole } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TranslationProvider } from "@/lib/translations";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
  Shield,
  FileText,
} from "lucide-react";
import { getUserRoleInfo } from "@/lib/roles";

const MobileMenu = dynamic(() => import("@/components/mobile-menu"));

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Skeleton header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl animate-pulse items-center justify-between px-4 md:px-8">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-20 rounded-md bg-muted" />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          {/* Skeleton stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border bg-card"
              />
            ))}
          </div>
          {/* Skeleton table */}
          <div className="mt-8 rounded-xl border bg-card">
            <div className="h-12 animate-pulse border-b bg-muted/50" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse border-b border-border/50"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

async function DashboardShell({ children }: { children: React.ReactNode }) {
  // Guard against missing env vars (e.g. during static generation)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build/SSG, render skeleton — middleware protects at runtime
    return (
      <TranslationProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</div>
          </main>
        </div>
      </TranslationProvider>
    );
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const roleInfo = await getUserRoleInfo();
  const role = await getUserRole();

  return (
    <TranslationProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Authenticated header variant */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
            </div>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LayoutDashboard className="size-4" />
              Overview
            </Link>

            {/* Client-specific: Job Postings */}
            {role === "client" && (
              <Link
                href="/dashboard/jobs"
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <FileText className="size-4" />
                Job Postings
              </Link>
            )}

            <Link
              href="/dashboard/applications"
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Briefcase className="size-4" />
              Applications
            </Link>
            <Link
              href="/dashboard/settings"
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="size-4" />
              Settings
            </Link>

            {/* Admin Link - Only visible to admins */}
            {role === "admin" && (
              <Link
                href="/admin/jobs"
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Shield className="size-4" />
                Admin
              </Link>
            )}

            {/* Role Badge */}
            {roleInfo && (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleInfo.color}`}
              >
                {roleInfo.label}
              </span>
            )}

            <form
              action={async () => {
                "use server";
                const { logoutAction } = await import("@/lib/auth/actions");
                await logoutAction();
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="size-4" />
                <span className="ml-1.5">Sign Out</span>
              </Button>
            </form>
          </nav>

          {/* Mobile menu button */}
          <MobileMenu roleInfo={roleInfo} role={role} />
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
    </TranslationProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
