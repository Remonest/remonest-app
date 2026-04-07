"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LayoutDashboard, Briefcase, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/lib/auth/actions"

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />
          <div className="absolute right-4 top-16 z-50 w-56 rounded-lg border border-border bg-card p-2 shadow-lg">
            <nav className="flex flex-col gap-1">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <LayoutDashboard className="size-4" /> Overview
              </Link>
              <Link href="/dashboard/applications" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Briefcase className="size-4" /> Applications
              </Link>
              <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Settings className="size-4" /> Settings
              </Link>
              <div className="my-1 h-px bg-border" />
              <form action={logoutAction}>
                <button type="submit" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <LogOut className="size-4" /> Sign Out
                </button>
              </form>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
