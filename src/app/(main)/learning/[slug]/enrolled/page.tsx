import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, GraduationCap, Clock } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getLearningModuleBySlug } from "@/features/learning-module/actions/fetch-learning";

interface EnrolledPageProps {
  params: Promise<{ slug: string }>;
}

interface EnrolledUser {
  userId: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  progress: number;
  startedAt: string;
  completedAt: string | null;
}

async function getModuleEnrollments(moduleId: string): Promise<EnrolledUser[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_learning_progress")
    .select("user_id, progress, started_at, completed_at")
    .eq("module_id", moduleId)
    .order("started_at", { ascending: false });

  if (error?.code) {
    console.error("[Enrolled Page] Error:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Fetch user profiles separately
  const userIds = data.map((d) => d.user_id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // Fallback: fetch emails from Supabase Auth admin
  const missingIds = userIds.filter((id) => !profileMap.has(id));
  const authEmailMap = new Map<string, string>();
  if (missingIds.length > 0) {
    const serviceClient = getSupabaseServiceClient();
    for (const uid of missingIds) {
      try {
        const { data: authUser } = await serviceClient.auth.admin.getUserById(uid);
        if (authUser?.user?.email) {
          authEmailMap.set(uid, authUser.user.email);
        }
      } catch {
        // ignore auth lookup failures
      }
    }
  }

  return data.map((row) => {
    const profile = profileMap.get(row.user_id);
    const authEmail = authEmailMap.get(row.user_id);
    const name = profile?.full_name ?? authEmail?.split("@")[0] ?? "Unknown User";
    return {
      userId: row.user_id,
      fullName: name,
      email: profile?.email ?? authEmail ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      progress: row.progress ?? 0,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    };
  });
}

export default async function EnrolledPage({ params }: EnrolledPageProps) {
  const { slug } = await params;
  const mod = await getLearningModuleBySlug(slug);

  if (!mod) {
    notFound();
  }

  const enrollments = await getModuleEnrollments(mod.id);
  const completedCount = enrollments.filter(
    (e) => e.progress === 100 && e.completedAt
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 py-6">
          <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/learning" className="hover:text-foreground">
              Learning
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <Link href="/learning" className="hover:text-foreground">
              {mod.title}
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-foreground">Enrolled Users</span>
          </nav>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Enrolled Users
              </h1>
              <p className="text-sm text-muted-foreground">
                {mod.title}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">Total Enrolled</div>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">In Progress</div>
            <div className="text-2xl font-bold text-amber-600">
              {enrollments.length - completedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Users List */}
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 pb-12">
        {enrollments.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground">No Enrollments Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to enroll in this module
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="divide-y">
              {enrollments.map((e) => {
                const isCompleted = e.progress === 100 && e.completedAt;
                return (
                  <div
                    key={e.userId}
                    className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      {e.avatarUrl ? (
                        <img
                          src={e.avatarUrl}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {e.fullName ?? e.email ?? "Unknown User"}
                      </p>
                      {e.email && e.fullName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {e.email}
                        </p>
                      )}
                    </div>

                    {/* Progress & Date */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <GraduationCap className="h-3 w-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            {e.progress}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(e.startedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
