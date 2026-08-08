"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable, Column } from "@/components/shared/data-table"
import { Search, Eye, Dumbbell, Calendar, UserCheck } from "lucide-react"

interface TrainerClientsClientProps {
  clients: any[]
}

export function TrainerClientsClient({ clients }: TrainerClientsClientProps) {
  const [search, setSearch] = useState("")

  const filteredClients = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<any>[] = [
    {
      header: "Client Name",
      accessor: (row) => (
        <div>
          <p className="font-bold text-[#171B28] text-xs">{row.fullName}</p>
          <p className="text-[10px] text-[#8B8E98]">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Member Status",
      accessor: (row) => <StatusBadge status={row.memberStatus || "ACTIVE"} />,
    },
    {
      header: "Pack Balance",
      accessor: (row) => {
        const pack = row.sessionPacks[0]
        const remaining = pack?.remainingSessions || 0
        return (
          <span
            className={`font-bold text-xs ${
              remaining === 0
                ? "text-[#D71920]"
                : remaining <= 2
                ? "text-[#F97316]"
                : "text-[#007A35]"
            }`}
          >
            {remaining} Sessions Left
          </span>
        )
      },
    },
    {
      header: "Last Session",
      accessor: (row) => {
        const lastSession = row.sessionsClient[0]
        if (!lastSession) return <span className="text-[#8B8E98] text-xs">—</span>
        return (
          <span className="text-xs text-[#4A4D58]" suppressHydrationWarning>
            {new Date(lastSession.scheduledAt).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Link
          href={`/trainer/clients/${row.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-xs font-semibold rounded-md transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-[#007A35]" />
          View 360° Profile
        </Link>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Assigned Client Roster"
        description="Monitor your active personal training clients, session pack balances, and progress (FR-041 / SCR-17)."
      />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredClients}
        keyExtractor={(c) => c.id}
        emptyMessage="No assigned clients found. Accept hire requests to add clients."
      />
    </div>
  )
}
