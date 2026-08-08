"use client"

import { Search, Bell, User as UserIcon } from "lucide-react"

interface HeaderProps {
  fullName: string
  role: string
}

export function Header({ fullName, role }: HeaderProps) {
  return (
    <header className="h-13 bg-white border-b border-[#E1E1E4] px-6 flex items-center justify-between shrink-0">
      {/* Search Field */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
        <input
          type="text"
          placeholder="Search members, trainers, sessions..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-full focus:outline-none focus:ring-1 focus:ring-[#007A35] text-[#171B28] placeholder-[#8B8E98]"
        />
      </div>

      {/* Actions / Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <button className="relative p-2 rounded-full text-[#4A4D58] hover:bg-[#F5F4F5] transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#007A35]"></span>
        </button>

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
