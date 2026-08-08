"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable, Column } from "@/components/shared/data-table"
import { StatCard } from "@/components/shared/stat-card"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { overrideSessionStatus, handleNoShow, cancelSession } from "@/app/actions/sessions"
import { Search, Calendar, Plus, ShieldAlert, CheckCircle, Clock, AlertTriangle, FileSpreadsheet } from "lucide-react"

interface OwnerSessionsClientProps {
  sessions: any[]
  trainers: { id: string; fullName: string }[]
}

export function OwnerSessionsClient({ sessions, trainers }: OwnerSessionsClientProps) {
  const [search, setSearch] = useState("")
  const [trainerFilter, setTrainerFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [overrideStatus, setOverrideStatus] = useState<any>("COMPLETED")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.trainer.fullName.toLowerCase().includes(search.toLowerCase())

    const matchesTrainer = trainerFilter === "ALL" || s.trainerId === trainerFilter
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter

    return matchesSearch && matchesTrainer && matchesStatus
  })

  // No-Show Analytics calculation
  const totalCount = sessions.length
  const missedCount = sessions.filter((s) => s.status === "MISSED" || s.noShow).length
  const noShowRate = totalCount > 0 ? ((missedCount / totalCount) * 100).toFixed(1) : "0.0"

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
        `"${s.id}","${new Date(s.scheduledAt).toISOString()}","${s.client.fullName}","${s.trainer.fullName}","${s.type}","${s.status}","${s.shiftStatus || 'IN_SHIFT'}","${s.fee}"`
    )
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sessions_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: Column<any>[] = [
    {
      header: "Time & Date",
      accessor: (row) => (
        <div>
          <p className="font-bold text-[#171B28] text-xs" suppressHydrationWarning>
            {new Date(row.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-[10px] text-[#8B8E98]" suppressHydrationWarning>
            {new Date(row.scheduledAt).toLocaleDateString()}
          </p>
        </div>
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

  return (
    <div>
      <PageHeader
        title="PT Session Oversight & Analytics"
        description="Monitor daily sessions across all personal trainers, manage status overrides, and track no-shows (FR-063 / SCR-25)."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#007A35]" />
              Export CSV
            </button>
            <Link
              href="/owner/sessions/book"
              className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Book PT Session
            </Link>
          </div>
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
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="ACTIVE">ACTIVE (Live)</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="MISSED">MISSED (No-Show)</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredSessions}
        keyExtractor={(s) => s.id}
        emptyMessage="No sessions match your filter criteria."
      />

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmOverride}
        loading={loading}
        title={`Override Session Status to ${overrideStatus}`}
        description={`This manual override will trigger billing calculations (pack deduction & trainer pay) if completed or missed.`}
        confirmText={`Confirm Status to ${overrideStatus}`}
        isDestructive={overrideStatus === "MISSED" || overrideStatus === "CANCELLED"}
      />
    </div>
  )
}
