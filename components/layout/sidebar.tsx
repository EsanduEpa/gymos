"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  DollarSign,
  Settings,
  Shield,
  CreditCard,
  BarChart3,
  Wallet,
  LogOut,
  UserCheck,
  X,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface SidebarProps {
  role: "SUPER_ADMIN" | "GYM_OWNER" | "PERSONAL_TRAINER" | "GYM_MEMBER"
  fullName: string
  /** Super admin only: a gym is currently being viewed. */
  impersonating?: boolean
  /** Drawer state, used only below the md breakpoint. */
  open?: boolean
  onClose?: () => void
}

export function Sidebar({
  role,
  fullName,
  impersonating = false,
  open = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname()

  const ownerNav = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "Members", href: "/owner/members", icon: Users },
    { name: "Trainers", href: "/owner/trainers", icon: Dumbbell },
    { name: "Sessions", href: "/owner/sessions", icon: Calendar },
    { name: "Financials", href: "/owner/financials", icon: DollarSign },
    { name: "Analytics", href: "/owner/analytics", icon: BarChart3 },
    { name: "Gym Config", href: "/owner/gym-config", icon: Settings },
    { name: "Audit Log", href: "/owner/audit-log", icon: Shield },
    { name: "Subscription", href: "/owner/subscription", icon: CreditCard },
  ]

  const trainerNav = [
    { name: "Schedule", href: "/trainer/schedule", icon: Calendar },
    { name: "Clients", href: "/trainer/clients", icon: Users },
    { name: "Earnings", href: "/trainer/earnings", icon: Wallet },
  ]

  const memberNav = [
    { name: "Trainers", href: "/member/trainers", icon: UserCheck },
    { name: "My Sessions", href: "/member/sessions", icon: Calendar },
  ]

  // "Owner View" is only reachable once a gym is being impersonated — a super
  // admin has no gym of their own, so the link would otherwise land on an
  // error. The /admin screen is where a gym gets selected.
  const superAdminNav = [
    { name: "All Gyms", href: "/admin", icon: LayoutDashboard },
    ...(impersonating
      ? [{ name: "Owner View", href: "/owner", icon: Settings }]
      : []),
  ]

  const navItems =
    role === "PERSONAL_TRAINER"
      ? trainerNav
      : role === "GYM_MEMBER"
      ? memberNav
      : role === "SUPER_ADMIN"
      ? superAdminNav
      : ownerNav

  return (
    <>
      {/* Backdrop, mobile only. Clicking away is how most people expect to
          dismiss a drawer, so it matters as much as the close button. */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="primary-navigation"
        // Off-canvas below md, a static column from md up. `fixed` only applies
        // on small screens so the desktop layout is untouched.
        className={`
          fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-[#171B28] text-[#777B87]
          flex flex-col justify-between select-none overflow-y-auto
          transition-transform duration-200 ease-out
          md:static md:z-auto md:w-56 md:translate-x-0 md:transition-none
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Main navigation"
      >
      <div>
        {/* Logo Section */}
        <div className="p-5 border-b border-[#232736] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#007A35] flex items-center justify-center text-white shrink-0">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-white">GymOS</h1>
              <p className="text-[10px] font-semibold text-[#8B8E98] tracking-wider uppercase mt-1">
                Management System
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="md:hidden p-1.5 -mr-1 rounded-md text-[#8B8E98] hover:text-white hover:bg-[#202534] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/owner" && item.href !== "/trainer" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                // Tells a screen reader which item is the current page; the
                // green background alone conveys nothing to one.
                aria-current={isActive ? "page" : undefined}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#45B472] ${
                  isActive
                    ? "bg-[#007A35] text-white shadow-sm"
                    : "text-[#777B87] hover:bg-[#202534] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-[#232736]">
        <div className="px-3 py-2 text-xs font-medium text-[#8B8E98] truncate">
          {fullName} ({role.replace("_", " ")})
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#777B87] hover:bg-[#202534] hover:text-red-400 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#45B472]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
      </aside>
    </>
  )
}
