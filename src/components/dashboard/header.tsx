"use client"

import Link from "next/link"
import { LogOut, LayoutDashboard, Briefcase, Settings, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/translations"
import { LanguageSwitcher } from "@/components/landing/language-switcher"
import { logoutAction } from "@/lib/auth/actions"

interface DashboardHeaderProps {
  role: "admin" | "user" | "client" | null
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const { t, language, setLanguage } = useTranslations()

  return (
    <>
      <Link
        href="/dashboard"
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <LayoutDashboard className="size-4" />
        {t.dashboard.nav.overview}
      </Link>

      {role === "client" && (
        <Link
          href="/dashboard/jobs"
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <FileText className="size-4" />
          {t.dashboard.nav.jobPostings}
        </Link>
      )}

      <Link
        href="/dashboard/applications"
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Briefcase className="size-4" />
        {t.dashboard.nav.applications}
      </Link>

      <Link
        href="/dashboard/settings"
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Settings className="size-4" />
        {t.dashboard.nav.settings}
      </Link>

      {role === "admin" && (
        <Link
          href="/admin/jobs"
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
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
