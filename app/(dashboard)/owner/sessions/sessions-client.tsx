"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { DailySessionsView } from "./daily-view"
import { MonthlyMemberView } from "./monthly-view"
import { Calendar, Plus, ShieldAlert, AlertTriangle, CalendarDays, Users } from "lucide-react"

interface OwnerSessionsClientProps {
  sessions: any[]
  trainers: { id: string; fullName: string }[]
  members: any[]
}

export function OwnerSessionsClient({ sessions, trainers, members }: OwnerSessionsClientProps) {
  const [tab, setTab] = useState<"daily" | "monthly">("daily")

  // No-Show Analytics calculation
  const totalCount = sessions.length
  const missedCount = sessions.filter((s) => s.status === "MISSED" || s.noShow).length
  const noShowRate = totalCount > 0 ? ((missedCount / totalCount) * 100).toFixed(1) : "0.0"

  return (
    <div>
      <PageHeader
        title="PT Session Oversight & Analytics"
        description="Monitor PT sessions across all personal trainers, manage status overrides, and track no-shows (FR-063 / SCR-25)."
        action={
          <Link
            href="/owner/sessions/book"
            className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Book PT Session
          </Link>
        }
      />

      {/* No-Show Analytics Highlight Banner (FR-065) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Sessions Logged"
          value={totalCount}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Missed / No-Shows"
          value={missedCount}
          icon={<AlertTriangle className="h-5 w-5 text-[#D71920]" />}
        />
        <StatCard
          label="Overall No-Show Rate"
          value={`${noShowRate}%`}
          trend={parseFloat(noShowRate) > 10 ? "High Miss Rate" : "Optimal"}
          icon={<ShieldAlert className="h-5 w-5 text-[#F97316]" />}
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#E1E1E4]">
        <button
          onClick={() => setTab("daily")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
            tab === "daily"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Daily Schedule
        </button>
        <button
          onClick={() => setTab("monthly")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
            tab === "monthly"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <Users className="h-4 w-4" />
          Monthly Member Overview
        </button>
      </div>

      {tab === "daily" ? (
        <DailySessionsView sessions={sessions} trainers={trainers} />
      ) : (
        <MonthlyMemberView members={members} sessions={sessions} />
      )}
    </div>
  )
}
