"use client"

import { Menu } from "lucide-react"
import NotificationBell from "./NotificationBell"

interface HeaderProps {
  fullName: string
  role: string
  onMenuClick?: () => void
  navOpen?: boolean
}

export function Header({ fullName, role, onMenuClick, navOpen = false }: HeaderProps) {
  return (
    <header className="h-13 bg-white border-b border-[#E1E1E4] px-4 sm:px-6 flex items-center justify-between shrink-0 gap-3">
      {/* Below md the sidebar is off-canvas, so this is the only way to reach
          navigation. Global search is a Phase 2 item — the box that used to sit
          here had no handler behind it, and the member, trainer and session
          lists each have their own working search. */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        aria-expanded={navOpen}
        aria-controls="primary-navigation"
        className="md:hidden p-2 -ml-2 rounded-md text-[#4A4D58] hover:bg-[#F5F4F5] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007A35]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block" />

      {/* Actions / Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell />

        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#E1E1E4]">
          <div className="h-8 w-8 rounded-full bg-[#007A35]/10 border border-[#007A35]/20 flex items-center justify-center text-[#007A35] font-semibold text-xs shrink-0">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-[#171B28] leading-tight">{fullName}</p>
            <p className="text-[10px] text-[#8B8E98] capitalize">
              {role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
