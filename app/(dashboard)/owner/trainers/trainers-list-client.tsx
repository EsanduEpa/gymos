"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable, Column } from "@/components/shared/data-table"
import { Search, UserPlus, Eye, Dumbbell } from "lucide-react"

interface TrainersListClientProps {
  trainers: any[]
}

export function TrainersListClient({ trainers }: TrainersListClientProps) {
  const [search, setSearch] = useState("")

  const filteredTrainers = trainers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<any>[] = [
    {
      header: "Trainer Name",
      accessor: (row) => (
        <div>
          <p className="font-bold text-[#171B28] text-xs">{row.fullName}</p>
          <p className="text-[10px] text-[#8B8E98]">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Level",
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            row.trainerLevel === "LEVEL_2"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.trainerLevel === "LEVEL_2" ? "Level 2" : "Level 1"}
        </span>
      ),
    },
    {
      header: "Specialisations",
      accessor: (row) => {
        let specs: string[] = []
        try {
          specs = typeof row.specialisations === "string" ? JSON.parse(row.specialisations) : row.specialisations || []
        } catch (e) {}

        return (
          <div className="flex flex-wrap gap-1">
            {specs.slice(0, 2).map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-[#F5F4F5] text-[#4A4D58] rounded text-[10px]">
                {s}
              </span>
            ))}
            {specs.length > 2 && <span className="text-[10px] text-[#8B8E98]">+{specs.length - 2}</span>}
            {specs.length === 0 && <span className="text-[10px] text-[#8B8E98]">—</span>}
          </div>
        )
      },
    },
    {
      header: "Shift Hours",
      accessor: (row) => (
        <span className="text-[#4A4D58] font-medium">
          {row.shiftStart || "08:00"} - {row.shiftEnd || "17:00"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.trainerStatus || "ACTIVE"} />,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Link
          href={`/owner/trainers/${row.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-xs font-semibold rounded-md transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-[#007A35]" />
          View Trainer
        </Link>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Trainer Roster Management"
        description="Add trainer accounts, configure levels and shift hours, and monitor performance."
        action={
          <Link
            href="/owner/trainers/new"
            className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add New Trainer
          </Link>
        }
      />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
          <input
            type="text"
            placeholder="Search trainers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTrainers}
        keyExtractor={(t) => t.id}
        emptyMessage="No trainers found."
      />
    </div>
  )
}
