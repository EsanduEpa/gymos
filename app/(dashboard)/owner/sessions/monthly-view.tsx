"use client"

import { useState } from "react"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable, Column } from "@/components/shared/data-table"
import { Search, ChevronLeft, ChevronRight, X, CalendarClock } from "lucide-react"

function toMonthInputValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

interface MonthlyMemberViewProps {
  members: any[]
  sessions: any[]
}

export function MonthlyMemberView({ members, sessions }: MonthlyMemberViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthInputValue(new Date()))
  const [search, setSearch] = useState("")
  const [expandedRow, setExpandedRow] = useState<{ member: any; bookedThisMonth: any[] } | null>(null)

  const [year, month] = selectedMonth.split("-").map(Number)
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1) // exclusive
  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" })

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1)
    setSelectedMonth(toMonthInputValue(next))
  }

  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  )

  const rows = filteredMembers.map((m) => {
    const packs: any[] = m.sessionPacks || []
    const totalPurchased = packs.reduce((sum, p) => sum + p.totalSessions, 0)
    const remaining = packs
      .filter((p) => p.status === "ACTIVE")
      .reduce((sum, p) => sum + p.remainingSessions, 0)
    const used = packs.reduce((sum, p) => sum + (p.totalSessions - p.remainingSessions), 0)

    const bookedThisMonth = sessions
      .filter((s) => s.clientId === m.id)
      .filter((s) => {
        const d = new Date(s.scheduledAt)
        return d >= monthStart && d < monthEnd
      })
      .filter((s) => s.status === "SCHEDULED" || s.status === "PENDING_CONFIRMATION")
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

    const membership = m.memberships?.[0]

    return { member: m, membership, totalPurchased, remaining, used, bookedThisMonth }
  })

  const columns: Column<(typeof rows)[number]>[] = [
    {
      header: "Member",
      accessor: (row) => (
        <div>
          <p className="font-bold text-[#171B28] text-xs">{row.member.fullName}</p>
          <p className="text-[10px] text-[#8B8E98]">{row.member.email}</p>
        </div>
      ),
    },
    {
      header: "Subscription",
      accessor: (row) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="text-[11px] font-semibold text-[#4A4D58]">
            {row.membership?.plan?.name || "No Membership Plan"}
          </span>
          <StatusBadge status={row.membership?.status || row.member.memberStatus || "INACTIVE"} />
        </div>
      ),
    },
    {
      header: "Purchased",
      accessor: (row) => <span className="font-bold text-[#171B28]">{row.totalPurchased}</span>,
      className: "text-center",
    },
    {
      header: "Used",
      accessor: (row) => <span className="font-bold text-[#D71920]">{row.used}</span>,
      className: "text-center",
    },
    {
      header: "Available",
      accessor: (row) => <span className="font-bold text-[#007A35]">{row.remaining}</span>,
      className: "text-center",
    },
    {
      header: `Booked Sessions — ${monthLabel}`,
      accessor: (row) => {
        if (row.bookedThisMonth.length === 0) {
          return <span className="text-xs text-[#8B8E98] italic">No sessions booked.</span>
        }
        const next = row.bookedThisMonth[0]
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4A4D58]" suppressHydrationWarning>
              Next: <span className="font-semibold text-[#171B28]">
                {new Date(next.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </span>
            <button
              onClick={() => setExpandedRow({ member: row.member, bookedThisMonth: row.bookedThisMonth })}
              className="px-2.5 py-1 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-[11px] font-bold rounded cursor-pointer transition-colors whitespace-nowrap"
            >
              More ({row.bookedThisMonth.length})
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      {/* Month navigation + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            className="p-2 bg-white border border-[#E1E1E4] rounded-lg hover:bg-[#F5F4F5] cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-[#4A4D58]" />
          </button>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none font-semibold text-[#171B28]"
          />
          <button
            onClick={() => shiftMonth(1)}
            className="p-2 bg-white border border-[#E1E1E4] rounded-lg hover:bg-[#F5F4F5] cursor-pointer transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-[#4A4D58]" />
          </button>
          <button
            onClick={() => setSelectedMonth(toMonthInputValue(new Date()))}
            className="px-3 py-2 text-xs bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] font-semibold rounded-lg cursor-pointer transition-colors"
          >
            This Month
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
          <input
            type="text"
            placeholder="Search member name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(row) => row.member.id}
        emptyMessage="No members match your search."
      />

      {expandedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setExpandedRow(null)}
        >
          <div
            className="bg-white rounded-xl border border-[#E1E1E4] shadow-lg max-w-lg w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-[#E1E1E4]">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-[#DDF5E7] text-[#007A35] flex items-center justify-center shrink-0">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171B28]">{expandedRow.member.fullName}</h3>
                  <p className="text-[11px] text-[#8B8E98] mt-0.5">
                    Booked Sessions — {monthLabel} ({expandedRow.bookedThisMonth.length})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExpandedRow(null)}
                className="p-1.5 rounded-lg hover:bg-[#F5F4F5] text-[#8B8E98] cursor-pointer transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-2 overflow-y-auto">
              {expandedRow.bookedThisMonth.map((s: any) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs bg-[#F9FAFB] rounded-lg px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#171B28]" suppressHydrationWarning>
                      {new Date(s.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })},{" "}
                      {new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[#4A4D58]">
                      with <span className="font-semibold text-[#171B28]">{s.trainer.fullName}</span>
                    </span>
                    <span className="px-1.5 py-0.5 bg-white border border-[#E1E1E4] rounded text-[10px] font-semibold text-[#4A4D58]">
                      {s.type}
                    </span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
