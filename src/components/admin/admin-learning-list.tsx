"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Library,
  CheckCircle2,
  FileEdit,
  Users,
  Eye,
  BarChart2,
  MoreVertical,
  Pencil,
  Layers,
  HelpCircle,
  Trash2,
  Archive,
  Eye as EyeIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  updateLearningModuleStatus,
  deleteLearningModule,
  type LearningModuleRow,
} from "@/lib/learning/actions";
import type {
  ModuleCompletion,
  ModuleEnrollment,
} from "@/lib/learning/actions";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  LEARNING_CATEGORY_LABELS,
  type ModuleDifficulty,
} from "@/features/learning-module/types/learning";

// ─── Types ───────────────────────────────────────────────────

type ModuleWithLessonCount = LearningModuleRow & {
  lessonCount: number;
  completionCount: number;
  enrollmentCount: number;
  completions: ModuleCompletion[];
  enrollments: ModuleEnrollment[];
};

interface AdminLearningListProps {
  modules: ModuleWithLessonCount[];
}

// ─── Config ──────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  published: {
    label: "Published",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  draft: {
    label: "Draft",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  archived: {
    label: "Archived",
    bg: "bg-gray-100 dark:bg-gray-800/50",
    text: "text-gray-600 dark:text-gray-400",
  },
};

const ITEMS_PER_PAGE = 10;

// ─── Component ───────────────────────────────────────────────

export default function AdminLearningList({ modules }: AdminLearningListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [completionsModuleId, setCompletionsModuleId] = useState<string | null>(
    null,
  );
  const [enrollmentsModuleId, setEnrollmentsModuleId] = useState<string | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);

  // Stats
  const stats = {
    total: modules.length,
    published: modules.filter((m) => m.status === "published").length,
    draft: modules.filter((m) => m.status === "draft").length,
    learners: modules.reduce((sum, m) => sum + (m.enrollment_count ?? 0), 0),
    completed: modules.reduce((sum, m) => sum + (m.completionCount ?? 0), 0),
  };

  // Filter
  const filtered = modules.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    const matchCategory =
      categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  // Actions
  const handleStatusChange = async (
    id: string,
    title: string,
    status: "draft" | "published" | "archived",
  ) => {
    setIsPending(true);
    const result = await updateLearningModuleStatus(id, status);
    setIsPending(false);
    if (result.success) {
      toast.success(`"${title}" → ${status}`);
      router.refresh();
    } else {
      toast.error("Failed", { description: result.error });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    setIsPending(true);
    const result = await deleteLearningModule(id);
    setIsPending(false);
    if (result.success) {
      toast.success(`"${title}" deleted`);
      setDeleteId(null);
      router.refresh();
    } else {
      toast.error("Failed", { description: result.error });
    }
  };

  const formatLearners = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return n.toString();
  };

  const categories = Object.keys(LEARNING_CATEGORY_LABELS);

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <MetricCard
          label="Total Modules"
          value={stats.total.toString()}
          icon={Library}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          label="Published"
          value={stats.published.toString()}
          icon={CheckCircle2}
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          label="In Draft"
          value={stats.draft.toString()}
          icon={FileEdit}
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          label="Active Learners"
          value={formatLearners(stats.learners)}
          icon={Users}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          label="Completed"
          value={formatLearners(stats.completed)}
          icon={GraduationCap}
          iconColor="text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* Table Container */}
      <div className="rounded-xl border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <FilterSelect
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />
            <FilterSelect
              value={categoryFilter}
              onChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Categories" },
                ...categories.map((c) => ({
                  value: c,
                  label:
                    LEARNING_CATEGORY_LABELS[
                      c as keyof typeof LEARNING_CATEGORY_LABELS
                    ],
                })),
              ]}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Module Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Learners
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-50" />
                      <p className="text-sm">No modules found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageItems.map((mod) => (
                  <tr
                    key={mod.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/20"
                  >
                    {/* Module Name + Thumbnail */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                          {mod.thumbnail_url ? (
                            <img
                              src={mod.thumbnail_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {mod.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span
                              className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                                DIFFICULTY_COLORS[
                                  ((mod as any).difficulty_level ??
                                    "beginner") as ModuleDifficulty
                                ] ?? "bg-muted text-muted-foreground"
                              }`}
                            >
                              {DIFFICULTY_LABELS[
                                ((mod as any).difficulty_level ??
                                  "beginner") as ModuleDifficulty
                              ] ?? "Beginner"}
                            </span>
                            <span>•</span>
                            <span>{mod.lessonCount} Steps</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {LEARNING_CATEGORY_LABELS[
                          mod.category as keyof typeof LEARNING_CATEGORY_LABELS
                        ] ?? mod.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={mod.status} />
                    </td>

                    {/* Learners */}
                    <td className="px-6 py-4">
                      {mod.status === "published" ? (
                        <div className="flex flex-col">
                          <button
                            onClick={() => setEnrollmentsModuleId(mod.id)}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
                          >
                            {formatLearners(mod.enrollmentCount ?? 0)}
                          </button>
                          <span className="text-[11px] text-muted-foreground">
                            Enrolled
                          </span>
                          {mod.completionCount > 0 && (
                            <button
                              onClick={() => setCompletionsModuleId(mod.id)}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline"
                            >
                              <GraduationCap className="h-3 w-3" />
                              {mod.completionCount} completed
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Not published
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/*<Link
                          href={`/admin/learning/${mod.id}/edit`}
                          title="Edit Module Metadata"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/admin/learning/${mod.id}/builder`}
                          title="Open Flow Builder (Lessons & Content)"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </Link>*/}
                        <RowActions
                          module={mod}
                          onStatusChange={handleStatusChange}
                          onDelete={() => setDeleteId(mod.id)}
                          disabled={isPending}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{filtered.length === 0 ? 0 : start + 1}</strong> to{" "}
            <strong>{Math.min(start + ITEMS_PER_PAGE, filtered.length)}</strong>{" "}
            of <strong>{filtered.length}</strong> modules
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Completions Dialog */}
      <Dialog
        open={completionsModuleId !== null}
        onOpenChange={(open) => {
          if (!open) setCompletionsModuleId(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-violet-600" />
              Completed Users
              {(() => {
                const mod = modules.find((m) => m.id === completionsModuleId);
                return mod ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    — {mod.title}
                  </span>
                ) : null;
              })()}
            </DialogTitle>
            <DialogDescription>
              Users who have completed this module and earned a certificate.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {(() => {
              const mod = modules.find((m) => m.id === completionsModuleId);
              if (!mod || mod.completions.length === 0) {
                return (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <GraduationCap className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    No completions yet
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    {mod.completions.length} user
                    {mod.completions.length !== 1 ? "s" : ""} completed
                  </div>
                  <div className="rounded-lg border divide-y">
                    {mod.completions.map((c) => (
                      <div
                        key={c.userId}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                          {c.avatarUrl ? (
                            <img
                              src={c.avatarUrl}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {c.fullName ?? c.email ?? "Unknown User"}
                          </p>
                          {c.email && c.fullName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {c.email}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.completedAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompletionsModuleId(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId) {
                  const mod = modules.find((m) => m.id === deleteId);
                  if (mod) handleDelete(deleteId, mod.title);
                }
              }}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrollments Dialog */}
      <Dialog
        open={enrollmentsModuleId !== null}
        onOpenChange={(open) => {
          if (!open) setEnrollmentsModuleId(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Enrolled Users
              {(() => {
                const mod = modules.find((m) => m.id === enrollmentsModuleId);
                return mod ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    — {mod.title}
                  </span>
                ) : null;
              })()}
            </DialogTitle>
            <DialogDescription>
              All users enrolled in this module, including in-progress learners.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {(() => {
              const mod = modules.find((m) => m.id === enrollmentsModuleId);
              if (!mod || mod.enrollments.length === 0) {
                return (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <Users className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    No enrollments yet
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    {mod.enrollments.length} user
                    {mod.enrollments.length !== 1 ? "s" : ""} enrolled
                    {" · "}
                    {mod.completions.length} completed
                  </div>
                  <div className="rounded-lg border divide-y">
                    {mod.enrollments.map((e) => {
                      const isCompleted = e.progress === 100 && e.completedAt;
                      return (
                        <div
                          key={e.userId}
                          className="flex items-center gap-3 p-3"
                        >
                          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            {e.avatarUrl ? (
                              <img
                                src={e.avatarUrl}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
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
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  isCompleted
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                }`}
                              >
                                {isCompleted ? "Completed" : `${e.progress}%`}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {new Date(e.startedAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEnrollmentsModuleId(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border bg-background px-3 pr-8 text-sm text-foreground outline-none appearance-none"
      style={{
        backgroundImage: `url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%2371717a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function RowActions({
  module,
  onStatusChange,
  onDelete,
  disabled,
}: {
  module: LearningModuleRow;
  onStatusChange: (
    id: string,
    title: string,
    status: "draft" | "published" | "archived",
  ) => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={disabled}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/admin/learning/${module.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Metadata
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/learning/${module.id}/builder`}>
            <BookOpen className="mr-2 h-4 w-4" />
            Flow Builder
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/learning/${module.id}/materials`}>
            <Layers className="mr-2 h-4 w-4" />
            Kelola Materi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/learning/${module.id}/quiz`}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Kelola Kuis
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {module.status !== "published" && (
          <DropdownMenuItem
            onClick={() => onStatusChange(module.id, module.title, "published")}
          >
            <Eye className="mr-2 h-4 w-4 text-emerald-600" />
            Publish
          </DropdownMenuItem>
        )}
        {module.status !== "draft" && (
          <DropdownMenuItem
            onClick={() => onStatusChange(module.id, module.title, "draft")}
          >
            <FileText className="mr-2 h-4 w-4 text-blue-600" />
            Revert to Draft
          </DropdownMenuItem>
        )}
        {module.status !== "archived" && (
          <DropdownMenuItem
            onClick={() => onStatusChange(module.id, module.title, "archived")}
          >
            <Archive className="mr-2 h-4 w-4 text-amber-600" />
            Archive
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
