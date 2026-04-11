"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, LayoutDashboard, Briefcase, Settings, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/translations"
import { LanguageSwitcher } from "@/components/landing/language-switcher"
import { logoutAction } from "@/features/auth/actions/session"

interface DashboardHeaderProps {
  role: "admin" | "user" | "client" | null
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const { t, language, setLanguage } = useTranslations()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <>
      <Link
        href="/dashboard"
        className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium transition-colors hover:text-foreground ${
          isActive("/dashboard") && !isActive("/dashboard/jobs") && !isActive("/dashboard/applications") && !isActive("/dashboard/settings")
            ? "bg-accent text-foreground"
            : "text-muted-foreground"
        }`}
      >
        <LayoutDashboard className="size-4" />
        {t.dashboard.nav.overview}
      </Link>

      {role === "client" && (
        <Link
          href="/dashboard/jobs"
          className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium transition-colors hover:text-foreground ${
            isActive("/dashboard/jobs")
              ? "bg-accent text-foreground"
              : "text-muted-foreground"
          }`}
        >
          <FileText className="size-4" />
          {t.dashboard.nav.jobPostings}
        </Link>
      )}

      <Link
        href="/dashboard/applications"
        className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium transition-colors hover:text-foreground ${
          isActive("/dashboard/applications")
            ? "bg-accent text-foreground"
            : "text-muted-foreground"
        }`}
      >
        <Briefcase className="size-4" />
        {t.dashboard.nav.applications}
      </Link>

      <Link
        href="/dashboard/settings"
        className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium transition-colors hover:text-foreground ${
          isActive("/dashboard/settings")
            ? "bg-accent text-foreground"
            : "text-muted-foreground"
        }`}
      >
        <Settings className="size-4" />
        {t.dashboard.nav.settings}
      </Link>

      {role === "admin" && (
        <Link
          href="/admin/jobs"
          className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-950 ${
            isActive("/admin/jobs") || isActive("/admin/learning") || isActive("/admin/settings") || isActive("/admin/activity-log")
              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          <Shield className="size-4" />
          {t.dashboard.nav.admin}
        </Link>
      )}

      <LanguageSwitcher
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <form
        action={async () => {
          await logoutAction()
        }}
      >
        <Button type="submit" variant="outline" size="sm">
          <LogOut className="size-4" />
          <span className="ml-1.5">{t.dashboard.signOut}</span>
        </Button>
      </form>
    </>
  )
}
