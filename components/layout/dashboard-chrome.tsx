"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AlertCircle, Eye } from "lucide-react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

type Role = "SUPER_ADMIN" | "GYM_OWNER" | "PERSONAL_TRAINER" | "GYM_MEMBER"

/**
 * Holds the one piece of state the sidebar and header have to agree on: whether
 * the mobile drawer is open. Everything else stays server-rendered.
 */
export function DashboardChrome({
  role,
  fullName,
  impersonating,
  gymName,
  subLapsed,
  children,
}: {
  role: Role
  fullName: string
  impersonating: boolean
  gymName: string | null
  subLapsed: boolean
  children: React.ReactNode
}) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()

  // Navigating with the drawer open would otherwise leave it covering the page
  // the user just asked for.
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  // Escape is the expected way out of any overlay.
  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [navOpen])

  // Stop the page behind the drawer scrolling with it.
  useEffect(() => {
    if (!navOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [navOpen])

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Sidebar
        role={role}
        fullName={fullName}
        impersonating={impersonating}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {impersonating && (
          <div className="bg-[#171B28] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center">
            <Eye className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Viewing {gymName ?? "a gym"} as platform admin. Changes you make apply to that
              gym.
            </span>
          </div>
        )}

        {subLapsed && (
          <div
            role="alert"
            className="bg-red-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-md text-center"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              Your gym subscription payment failed or is in grace period. Please update your
              billing details to maintain uninterrupted access.
            </span>
          </div>
        )}

        <Header
          fullName={fullName}
          role={role}
          onMenuClick={() => setNavOpen(true)}
          navOpen={navOpen}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
