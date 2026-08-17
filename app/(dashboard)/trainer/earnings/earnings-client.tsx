"use client"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { DataTable, Column } from "@/components/shared/data-table"
import { DollarSign, Calendar, TrendingUp, Clock } from "lucide-react"

interface TrainerEarningsClientProps {
  payRecords: any[]
}

export function TrainerEarningsClient({ payRecords }: TrainerEarningsClientProps) {
  const totalEarnings = payRecords.reduce((acc, r) => acc + (r.amount || 0), 0)
  const totalSessionsCount = payRecords.length

  const columns: Column<any>[] = [
    {
      header: "Date",
      accessor: (row) => (
        <span className="text-xs font-semibold text-[#171B28]" suppressHydrationWarning>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Client Name",
      accessor: (row) => (
        <span className="text-xs font-medium text-[#171B28]">
          {row.session?.client?.fullName || "Gym Commission"}
        </span>
      ),
    },
    {
      header: "Session Type",
      accessor: (row) => (
        <span className="px-2 py-0.5 bg-[#F5F4F5] text-[#4A4D58] rounded text-[10px] font-semibold">
          {row.session?.type || "Standard"}
        </span>
      ),
    },
    {
      header: "Shift Status",
      accessor: (row) => (
        <span className="text-xs text-[#4A4D58] uppercase font-semibold">
          {row.session?.shiftStatus || "IN_SHIFT"}
        </span>
      ),
    },
    {
      header: "Amount Earned",
      accessor: (row) => (
        <span className="text-xs font-extrabold text-[#007A35]">
          +${row.amount?.toFixed(2) || "0.00"}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Trainer Earnings Portal"
        description="Track session payouts, calculate pay period earnings, and inspect itemized commissions (FR-045 / SCR-20)."
      />

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Net Earnings"
          value={`$${totalEarnings.toFixed(2)}`}
          trend="Accumulated"
          icon={<DollarSign className="h-5 w-5 text-[#007A35]" />}
        />
        <StatCard
          label="Paid PT Sessions"
          value={totalSessionsCount}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Average Per Session"
          value={`$${totalSessionsCount > 0 ? (totalEarnings / totalSessionsCount).toFixed(2) : "0.00"}`}
          icon={<TrendingUp className="h-5 w-5 text-[#007A35]" />}
        />
      </div>

      <DataTable
        columns={columns}
        data={payRecords}
        keyExtractor={(r) => r.id}
        label="Earnings"
        emptyMessage="Nothing earned yet this period"
        emptyHint="Pay is recorded when you complete a session."
      />
    </div>
  )
}
