import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface LearningBreadcrumbProps {
  moduleId?: string;
  moduleTitle?: string;
  currentPage: string;
  currentPageHref?: string;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────

export function LearningBreadcrumb({
  moduleId,
  moduleTitle,
  currentPage,
  currentPageHref,
  className,
}: LearningBreadcrumbProps) {
  const items: BreadcrumbItem[] = [
    { label: "Learning", href: "/admin/learning" },
  ];

  if (moduleId && moduleTitle) {
    items.push({
      label: moduleTitle,
      href: `/admin/learning/${moduleId}/edit`,
    });
  }

  items.push({
    label: currentPage,
    href: currentPageHref,
    active: true,
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          )}
          
          {item.href && !item.active ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : item.active ? (
            <span className="font-semibold text-foreground">
              {item.label}
            </span>
          ) : (
            <span>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
