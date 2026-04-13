import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleCatalogProps {
  modules: {
    id: string;
    slug: string;
    title: string;
    category: string;
    difficultyLevel: "beginner" | "intermediate" | "advanced";
    thumbnailUrl: string | null;
    durationMin: number;
  }[];
  userProgress: Record<string, number>; // moduleId -> progress %
  category: string;
  viewAllHref?: string;
}

const difficultyConfig = {
  beginner: { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  intermediate: { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  advanced: { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const categoryBadgeColor = "bg-primary/10 text-primary";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (remainingMin === 0) return `${hours}h`;
  return `${hours}h ${remainingMin}m`;
}

function ModuleCard({
  module,
  progress,
}: {
  module: ModuleCatalogProps["modules"][number];
  progress: number | undefined;
}) {
  const diff = difficultyConfig[module.difficultyLevel];
  const hasProgress = progress !== undefined && progress > 0;
  const isCompleted = progress === 100;
  const isInProgress = hasProgress && !isCompleted;

  const actionButton = () => {
    if (isCompleted) {
      return (
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/learning/modules/${module.slug}`}>
            <CheckCircle2 className="size-4" />
            View Certificate
          </Link>
        </Button>
      );
    }
    if (isInProgress) {
      return (
        <Button size="sm" className="w-full" asChild>
          <Link href={`/learning/modules/${module.slug}`}>
            <PlayCircle className="size-4" />
            Continue Learning
          </Link>
        </Button>
      );
    }
    return (
      <Button size="sm" className="w-full" asChild>
        <Link href={`/learning/modules/${module.slug}`}>
          <BookOpen className="size-4" />
          Start Learning
        </Link>
      </Button>
    );
  };

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {module.thumbnailUrl ? (
          <Image
            src={module.thumbnailUrl}
            alt={module.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <BookOpen className="size-12 text-muted-foreground/40" />
          </div>
        )}

        {/* Category badge overlay */}
        <span className={`absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryBadgeColor}`}>
          {module.category}
        </span>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-4 gap-3">
        {/* Difficulty + Duration */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${diff.color}`}>
            {diff.label}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {formatDuration(module.durationMin)}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/learning/modules/${module.slug}`}
          className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors"
        >
          {module.title}
        </Link>

        {/* Progress section (only when enrolled) */}
        {hasProgress && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  Completed
                </span>
              ) : (
                <span className="text-muted-foreground">In Progress</span>
              )}
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? "bg-emerald-500"
                    : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Spacer + Action button */}
        <div className="mt-auto pt-1">
          {actionButton()}
        </div>
      </div>
    </div>
  );
}

export default function ModuleCatalog({
  modules,
  userProgress,
  category,
  viewAllHref = "/learning",
}: ModuleCatalogProps) {
  if (modules.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-foreground">
            More Modules For You
          </h2>
          <p className="text-sm text-muted-foreground">
            Continue building your remote career toolkit
          </p>
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
        >
          View All Modules
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            progress={userProgress[mod.id]}
          />
        ))}
      </div>
    </section>
  );
}
