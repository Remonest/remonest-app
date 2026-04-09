import { Suspense } from "react";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  CheckCircle2,
  FileText,
  Archive,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningDataTable } from "@/components/admin/learning-data-table";
import { learningColumns } from "@/components/admin/learning-columns";
import {
  getAllLearningModules,
  type LearningModuleRow,
} from "@/lib/learning/actions";

// ─── Loading Skeleton ────────────────────────────────────────

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="rounded-md border">
        <div className="h-12 border-b bg-muted/50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-border/50">
            <div className="flex h-full items-center gap-4 px-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats Cards ─────────────────────────────────────────────

function StatsCards({ modules }: { modules: LearningModuleRow[] }) {
  const stats = {
    total: modules.length,
    published: modules.filter((m) => m.status === "published").length,
    draft: modules.filter((m) => m.status === "draft").length,
    archived: modules.filter((m) => m.status === "archived").length,
  };

  const cards = [
    {
      title: "Total Modul",
      value: stats.total,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Terbit",
      value: stats.published,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-500",
    },
    {
      title: "Draft",
      value: stats.draft,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-500",
    },
    {
      title: "Diarsipkan",
      value: stats.archived,
      icon: Archive,
      color: "text-amber-600 dark:text-amber-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Tabbed Content ──────────────────────────────────────────

async function LearningModulesContent({
  status,
}: {
  status?: "published" | "draft" | "archived";
}) {
  const allModules = await getAllLearningModules();

  const filtered = status
    ? allModules.filter((m) => m.status === status)
    : allModules;

  const showStats = !status;

  return (
    <div className="space-y-6">
      {showStats && <StatsCards modules={allModules} />}
      <LearningDataTable data={filtered} columns={learningColumns} />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function AdminLearningPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Manajemen Learning Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola modul pembelajaran untuk freelancer Remonest
          </p>
        </div>
        <Link
          href="/admin/learning/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Buat Modul Baru
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua Modul</TabsTrigger>
          <TabsTrigger value="published">Terbit</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="archived">Diarsipkan</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Suspense
            fallback={
              <>
                <StatsLoadingSkeleton />
                <TableLoadingSkeleton />
              </>
            }
          >
            <LearningModulesContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <LearningModulesContent status="published" />
          </Suspense>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <LearningModulesContent status="draft" />
          </Suspense>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <LearningModulesContent status="archived" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
