"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Briefcase, Settings, LogOut, Shield, FileText, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/features/auth/actions/session"
import { getUserRoleInfo } from "@/lib/roles"
import { useTranslations } from "@/lib/translations"

interface MobileMenuProps {
  roleInfo: Awaited<ReturnType<typeof getUserRoleInfo>>;
  role: "admin" | "user" | "client" | null;
}

export default function MobileMenu({ roleInfo, role }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { language, setLanguage, t } = useTranslations()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  // Handle visibility for animation
  useEffect(() => {
    if (open) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[aria-label="Menu"]')
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="size-10"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Mobile menu - floating bottom with transition */}
      {isVisible && (
        <div
          ref={menuRef}
          className={`fixed mt-1.5 left-4 right-4 z-50 transition-all duration-300 ease-out ${
            open
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col gap-2 p-4 border border-border rounded-xl bg-card shadow-lg">
            {/* Role Badge in Mobile Menu */}
            {roleInfo && (
              <div className="mb-1 px-3 py-2">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            )}

            <Link
              href="/dashboard"
              className={`h-10 px-3 flex items-center gap-2 rounded-md text-sm font-medium no-underline transition-colors hover:text-foreground ${
                isActive("/dashboard") && !isActive("/dashboard/jobs") && !isActive("/dashboard/applications") && !isActive("/dashboard/settings")
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard className="size-4" /> {t.dashboard.nav.overview}
            </Link>

            {/* Client-specific: Job Postings */}
            {role === "client" && (
              <Link
                href="/dashboard/jobs"
                className={`h-10 px-3 flex items-center gap-2 rounded-md text-sm font-medium no-underline transition-colors hover:text-foreground ${
                  isActive("/dashboard/jobs")
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setOpen(false)}
              >
                <FileText className="size-4" /> {t.dashboard.nav.jobPostings}
              </Link>
            )}

            <Link
              href="/dashboard/applications"
              className={`h-10 px-3 flex items-center gap-2 rounded-md text-sm font-medium no-underline transition-colors hover:text-foreground ${
                isActive("/dashboard/applications")
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setOpen(false)}
            >
              <Briefcase className="size-4" /> {t.dashboard.nav.applications}
            </Link>
            <Link
              href="/dashboard/settings"
              className={`h-10 px-3 flex items-center gap-2 rounded-md text-sm font-medium no-underline transition-colors hover:text-foreground ${
                isActive("/dashboard/settings")
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setOpen(false)}
            >
              <Settings className="size-4" /> {t.dashboard.nav.settings}
            </Link>

            {/* Admin Link - Only visible to admins */}
            {role === "admin" && (
              <Link
                href="/admin/jobs"
                className={`h-10 px-3 flex items-center gap-2 rounded-md text-sm font-medium no-underline transition-colors ${
                  isActive("/admin/jobs") || isActive("/admin/learning") || isActive("/admin/settings") || isActive("/admin/activity-log")
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                }`}
                onClick={() => setOpen(false)}
              >
                <Shield className="size-4" /> {t.dashboard.nav.admin}
              </Link>
            )}

            {/* Language Switcher */}
            <div className="pt-2 border-t border-border">
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Language</span>
                </div>
                <div className="flex gap-1.5">
                  {(["en", "id"] as const).map((lang) => (
                    <Button
                      key={lang}
                      variant={language === lang ? "default" : "outline"}
                      size="sm"
                      className="h-8 px-3 text-xs font-medium flex-1"
                      onClick={() => setLanguage(lang)}
                    >
                      {lang.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full h-10 px-3 flex items-center gap-2 rounded-md text-muted-foreground text-sm font-medium no-underline transition-colors hover:text-foreground hover:bg-muted"
                >
                  <LogOut className="size-4" /> {t.dashboard.signOut}
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
