import { Suspense } from "react";
import { getRecentAdminActions, getAdminActionStats, type AdminActionRecord, type AdminActionStats } from "@/features/admin/actions/activity-log";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Calendar, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-8 w-[60px]" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Activity log skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[300px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Get human-readable label for action type
 */
function getActionLabel(actionType: string): string {
  const labels: Record<string, string> = {
    approve_job: "Menyetujui Lowongan",
    reject_job: "Menolak Lowongan",
    delete_job: "Menghapus Lowongan",
    publish_job: "Menerbitkan Lowongan",
    republish_job: "Menerbitkan Ulang",
    update_job: "Memperbarui Lowongan",
    create_learning_module: "Membuat Modul Pembelajaran",
    update_learning_module: "Memperbarui Modul",
    delete_learning_module: "Menghapus Modul",
    update_user_role: "Mengubah Role User",
    delete_user: "Menghapus User",
    other: "Lainnya",
  };
  return labels[actionType] || actionType;
}

/**
 * Get badge variant for action type
 */
function getActionVariant(actionType: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    approve_job: "default",
    reject_job: "destructive",
    delete_job: "destructive",
    publish_job: "default",
    republish_job: "default",
    update_job: "outline",
    create_learning_module: "default",
    update_learning_module: "outline",
    delete_learning_module: "destructive",
    update_user_role: "secondary",
    delete_user: "destructive",
    other: "outline",
  };
  return variants[actionType] || "outline";
}

/**
 * Stats Cards Component
 */
function StatsCards({ stats }: { stats: AdminActionStats[] }) {
  const totalActions = stats.reduce((sum, s) => sum + s.action_count, 0);
  const approvals = stats.find((s) => s.action_type === "approve_job")?.action_count || 0;
  const rejections = stats.find((s) => s.action_type === "reject_job")?.action_count || 0;
  const contentChanges = stats
    .filter((s) => s.action_type.includes("learning_module"))
    .reduce((sum, s) => sum + s.action_count, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Aksi</CardTitle>
          <CardDescription>Semua aktivitas admin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalActions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Sejak pencatatan dimulai
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Lowongan Disetujui</CardTitle>
          <CardDescription>Job approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{approvals}</div>
          <p className="text-xs text-muted-foreground mt-1">Lowongan disetujui</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Lowongan Ditolak</CardTitle>
          <CardDescription>Job rejections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{rejections}</div>
          <p className="text-xs text-muted-foreground mt-1">Lowongan ditolak</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Konten Pembelajaran</CardTitle>
          <CardDescription>Learning module actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{contentChanges}</div>
          <p className="text-xs text-muted-foreground mt-1">Modul dibuat/diubah</p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Single Action Row Component
 */
function ActionRow({ action }: { action: AdminActionRecord }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Activity className="h-5 w-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={getActionVariant(action.action_type)}>
                {getActionLabel(action.action_type)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {action.table_name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Oleh: <span className="font-medium text-foreground">{action.admin_name || action.admin_email || "Unknown"}</span>
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Calendar className="h-3 w-3" />
            <time dateTime={action.created_at}>
              {formatDistanceToNow(new Date(action.created_at), { 
                addSuffix: true,
                locale: localeID 
              })}
            </time>
          </div>
        </div>

        {/* Details */}
        {(action.notes || action.target_user_name) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {action.target_user_name && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Target: {action.target_user_name}</span>
              </div>
            )}
            {action.notes && (
              <p className="italic">{action.notes}</p>
            )}
          </div>
        )}

        {/* Record ID (if available) */}
        {action.record_id && (
          <p className="text-xs font-mono text-muted-foreground">
            ID: {action.record_id.slice(0, 8)}...
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Activity Log Content (Server Component)
 */
async function ActivityLogContent() {
  const [actions, stats] = await Promise.all([
    getRecentAdminActions(100),
    getAdminActionStats(),
  ]);

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Belum Ada Aktivitas</h3>
          <p className="text-center text-sm text-muted-foreground">
            Log aktivitas akan muncul setelah admin melakukan tindakan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Log Aktivitas Admin
          </CardTitle>
          <CardDescription>
            Riwayat lengkap semua tindakan yang dilakukan admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.map((action) => (
              <ActionRow key={action.id} action={action} />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center text-xs text-muted-foreground">
            <p>Menampilkan {actions.length} aktivitas terbaru</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Admin Activity Log Page
 */
export default function AdminActivityLogPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Log Aktivitas Admin</h1>
        <p className="text-sm text-muted-foreground">
          Pantau semua tindakan yang dilakukan oleh administrator
        </p>
      </div>

      {/* Activity Log */}
      <Suspense fallback={<LoadingSkeleton />}>
        <ActivityLogContent />
      </Suspense>
    </div>
  );
}
