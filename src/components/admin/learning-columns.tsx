"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { LearningModuleRow } from "@/lib/learning/actions";
import { Badge } from "@/components/ui/badge";
import { LearningActions } from "@/components/admin/learning-actions";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale/id";
import { BookOpen, Clock, CheckCircle2, FileText, Archive, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const categoryConfig: Record<string, { label: string; color: string }> = {
  communication: {
    label: "Komunikasi",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  mindset: {
    label: "Mindset",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  career: {
    label: "Karir",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  design: {
    label: "Desain",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  },
  productivity: {
    label: "Produktivitas",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

const statusConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  published: {
    label: "Terbit",
    icon: CheckCircle2,
    variant: "default",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    variant: "outline",
  },
  archived: {
    label: "Diarsipkan",
    icon: Archive,
    variant: "secondary",
  },
};

export const learningColumns: ColumnDef<LearningModuleRow>[] = [
  {
    accessorKey: "title",
    header: "Modul",
    cell: ({ row }) => {
      const module = row.original;
      return (
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium leading-tight">
                {module.title}
              </p>
              {module.status === "published" && (
                <Link
                  href={`/learning/${module.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                    title="Lihat halaman publik"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
            {module.description && (
              <p className="truncate text-xs text-muted-foreground max-w-[280px]">
                {module.description}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      const config = categoryConfig[category] || {
        label: category,
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      };
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "duration_min",
    header: "Durasi",
    cell: ({ row }) => {
      const duration = row.getValue("duration_min") as number;
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {duration > 0 ? `${duration} menit` : "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || {
        label: status,
        icon: FileText,
        variant: "outline" as const,
      };
      const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="gap-1.5 px-2.5 py-1">
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Dibuat",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      if (!date) return <span className="text-muted-foreground">—</span>;
      else
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(date), {
              addSuffix: true,
              locale: localeId,
            })}
          </span>
        );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const module = row.original;
      return (
        <LearningActions
          moduleId={module.id}
          moduleTitle={module.title}
          currentStatus={module.status}
        />
      );
    },
  },
];
