"use client"

import { useState } from "react"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable, Column } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { overrideSessionStatus } from "@/app/actions/sessions"
import { Search, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react"

function toDateInputValue(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface DailySessionsViewProps {
  sessions: any[]
  trainers: { id: string; fullName: string }[]
}

export function DailySessionsView({ sessions, trainers }: DailySessionsViewProps) {
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()))
  const [search, setSearch] = useState("")
  const [trainerFilter, setTrainerFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [overrideStatus, setOverrideStatus] = useState<any>("COMPLETED")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const daySessions = sessions
    .filter((s) => toDateInputValue(new Date(s.scheduledAt)) === selectedDate)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const filteredSessions = daySessions.filter((s) => {
    const matchesSearch =
      s.client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.trainer.fullName.toLowerCase().includes(search.toLowerCase())

    const matchesTrainer = trainerFilter === "ALL" || s.trainerId === trainerFilter
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter

    return matchesSearch && matchesTrainer && matchesStatus
  })

  const shiftDay = (delta: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    setSelectedDate(toDateInputValue(new Date(y, m - 1, d + delta)))
  }

  const handleConfirmOverride = async () => {
    if (!selectedSession) return
    setLoading(true)
    await overrideSessionStatus(selectedSession.id, overrideStatus)
    setLoading(false)
    setDialogOpen(false)
  }

  const triggerOverride = (sessionObj: any, targetStatus: string) => {
    setSelectedSession(sessionObj)
    setOverrideStatus(targetStatus)
    setDialogOpen(true)
  }

  const exportCSV = () => {
    const headers = ["ID,ScheduledAt,Client,Trainer,Type,Status,ShiftStatus,Fee"]
    const rows = filteredSessions.map(
      (s) =>
        `"${s.id}","${new Date(s.scheduledAt).toISOString()}","${s.client.fullName}","${s.trainer.fullName}","${s.type}","${s.status}","${s.shiftStatus || "IN_SHIFT"}","${s.fee}"`
    )
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sessions_${selectedDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: Column<any>[] = [
    {
      header: "Time",
      accessor: (row) => (
        <p className="font-bold text-[#171B28] text-xs" suppressHydrationWarning>
          {new Date(row.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      ),
    },
    {
      header: "Member",
      accessor: (row) => (
        <div>
          <p className="font-bold text-[#171B28] text-xs">{row.client.fullName}</p>
          <p className="text-[10px] text-[#8B8E98]">{row.client.email}</p>
        </div>
      ),
    },
    {
      header: "Trainer",
      accessor: (row) => (
        <div>
          <p className="font-medium text-[#171B28] text-xs">{row.trainer.fullName}</p>
          <span className="text-[10px] text-[#8B8E98] uppercase tracking-wider">{row.shiftStatus || "IN_SHIFT"}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row) => (
        <span className="px-2 py-0.5 bg-[#F5F4F5] text-[#4A4D58] rounded text-[10px] font-semibold">
          {row.type}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === "ACTIVE" && (
            <span className="h-2 w-2 rounded-full bg-[#007A35] animate-ping" />
          )}
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      header: "Fee",
      accessor: (row) => <span className="font-bold text-[#007A35]">${row.fee?.toFixed(2) || "50.00"}</span>,
    },
    {
      header: "Owner Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === "SCHEDULED" || row.status === "ACTIVE" ? (
            <>
              <button
                onClick={() => triggerOverride(row, "COMPLETED")}
                className="px-2.5 py-1 bg-[#DDF5E7] hover:bg-[#BBEBD0] text-[#007A35] text-[11px] font-bold rounded cursor-pointer transition-colors"
              >
                Mark Complete
              </button>
              <button
                onClick={() => triggerOverride(row, "MISSED")}
                className="px-2.5 py-1 bg-[#FDE4E4] hover:bg-[#F8C4C4] text-[#D71920] text-[11px] font-bold rounded cursor-pointer transition-colors"
              >
                No-Show
              </button>
            </>
          ) : (
            <span className="text-[11px] text-[#8B8E98] italic">Locked</span>
          )}
        </div>
      ),
    },
  ]

  const dateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div>
      {/* Date navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDay(-1)}
            className="p-2 bg-white border border-[#E1E1E4] rounded-lg hover:bg-[#F5F4F5] cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-[#4A4D58]" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none font-semibold text-[#171B28]"
          />
          <button
            onClick={() => shiftDay(1)}
            className="p-2 bg-white border border-[#E1E1E4] rounded-lg hover:bg-[#F5F4F5] cursor-pointer transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-[#4A4D58]" />
          </button>
          <button
            onClick={() => setSelectedDate(toDateInputValue(new Date()))}
            className="px-3 py-2 text-xs bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#4A4D58]" suppressHydrationWarning>
            {dateLabel} · {filteredSessions.length} session{filteredSessions.length === 1 ? "" : "s"}
          </span>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#007A35]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
          <input
            type="text"
            placeholder="Search member or trainer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
          />
        </div>

        <select
          value={trainerFilter}
          onChange={(e) => setTrainerFilter(e.target.value)}
          className="px-3.5 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none font-semibold text-[#4A4D58]"
        >
          <option value="ALL">All Trainers</option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none font-semibold text-[#4A4D58]"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_CONFIRMATION">PENDING CONFIRMATION</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="ACTIVE">ACTIVE (Live)</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="MISSED">MISSED (No-Show)</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="DECLINED">DECLINED</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredSessions}
        keyExtractor={(s) => s.id}
        emptyMessage="No sessions scheduled for this day."
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmOverride}
        loading={loading}
        title={`Override Session Status to ${overrideStatus}`}
        description="This manual override will trigger billing calculations (pack deduction & trainer pay) if completed or missed."
        confirmText={`Confirm Status to ${overrideStatus}`}
        isDestructive={overrideStatus === "MISSED" || overrideStatus === "CANCELLED"}
      />
    </div>
  )
}
