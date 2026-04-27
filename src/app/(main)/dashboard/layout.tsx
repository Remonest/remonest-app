import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getSupabaseServerClient, getUserRole } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TranslationProvider } from "@/lib/translations";
import { getUserRoleInfo } from "@/lib/roles";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardRoleBadge } from "@/components/dashboard/role-badge";
import { getUserProfile } from "@/features/dashboard/actions/settings";

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
  const profile = await getUserProfile();

  const headerUser = profile ? {
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    email: profile.email
  } : null;

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
            <DashboardHeader role={role} user={headerUser} />
            <DashboardRoleBadge role={roleInfo} />
          </nav>

          {/* Mobile menu button */}
          <MobileMenu roleInfo={roleInfo} role={role} user={headerUser} />
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
