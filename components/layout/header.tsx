"use client"

import NotificationBell from "./NotificationBell"

interface HeaderProps {
  fullName: string
  role: string
}

export function Header({ fullName, role }: HeaderProps) {
  return (
    <header className="h-13 bg-white border-b border-[#E1E1E4] px-6 flex items-center justify-between shrink-0">
      {/* Global search is a Phase 2 item. The box that sat here had no handler
          behind it, and a control that does nothing when a user types into it
          is worse than no control. The member, trainer and session lists each
          have their own working search. */}
      <div />

      {/* Actions / Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Component */}
        <NotificationBell />

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#E1E1E4]">
          <div className="h-8 w-8 rounded-full bg-[#007A35]/10 border border-[#007A35]/20 flex items-center justify-center text-[#007A35] font-semibold text-xs">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-[#171B28] leading-tight">{fullName}</p>
            <p className="text-[10px] text-[#8B8E98] capitalize">{role.toLowerCase().replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
