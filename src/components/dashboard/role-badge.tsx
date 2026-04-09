"use client"

import { useTranslations } from "@/lib/translations"
import { getUserRoleInfo } from "@/lib/roles"

interface DashboardRoleBadgeProps {
  role: Awaited<ReturnType<typeof getUserRoleInfo>>
}

export function DashboardRoleBadge({ role }: DashboardRoleBadgeProps) {
  const { t } = useTranslations()

  if (!role) return null

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${role.color}`}>
      {role.label}
    </span>
  )
}
