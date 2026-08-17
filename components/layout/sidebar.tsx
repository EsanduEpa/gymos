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
  ClipboardList,
  Wallet,
  LogOut,
  UserCheck,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface SidebarProps {
  role: "SUPER_ADMIN" | "GYM_OWNER" | "PERSONAL_TRAINER" | "GYM_MEMBER"
  fullName: string
}

export function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname()

  const ownerNav = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "Members", href: "/owner/members", icon: Users },
    { name: "Trainers", href: "/owner/trainers", icon: Dumbbell },
    { name: "Sessions", href: "/owner/sessions", icon: Calendar },
    { name: "Financials", href: "/owner/financials", icon: DollarSign },
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

  const superAdminNav = [
    { name: "All Gyms", href: "/admin", icon: LayoutDashboard },
    { name: "Owner View", href: "/owner", icon: Settings },
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
    <aside className="w-56 shrink-0 bg-[#171B28] text-[#777B87] min-h-screen flex flex-col justify-between select-none">
      <div>
        {/* Logo Section */}
        <div className="p-5 border-b border-[#232736]">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#777B87] hover:bg-[#202534] hover:text-red-400 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
