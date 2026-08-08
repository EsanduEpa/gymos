"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable, Column } from "@/components/shared/data-table"
import { Search, Plus, Eye, UserPlus } from "lucide-react"

interface MembersListClientProps {
  members: any[]
  plans: any[]
}

export function MembersListClient({ members, plans }: MembersListClientProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone && m.phone.includes(search))

    const matchesStatus =
      statusFilter === "ALL" ||
      (m.memberStatus && m.memberStatus === statusFilter)

    return matchesSearch && matchesStatus
  })

  const columns: Column<any>[] = [
    {
      header: "Member Name",
      accessor: (row) => (
        <div>
          <p className="font-bold text-[#171B28] text-xs">{row.fullName}</p>
          <p className="text-[10px] text-[#8B8E98]">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: (row) => <span className="text-[#4A4D58]">{row.phone || "—"}</span>,
    },
    {
      header: "Active Plan",
      accessor: (row) => {
        const activeMembership = row.memberships[0]
        return (
          <span className="font-semibold text-[#171B28]">
            {activeMembership?.plan?.name || "No Plan"}
          </span>
        )
      },
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.memberStatus || "INACTIVE"} />,
    },
    {
      header: "Expiry Date",
      accessor: (row) => {
        const activeMembership = row.memberships[0]
        if (!activeMembership?.endDate) return <span className="text-[#8B8E98]">—</span>
        return (
          <span className="text-[#4A4D58]" suppressHydrationWarning>
            {new Date(activeMembership.endDate).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Link
          href={`/owner/members/${row.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-xs font-semibold rounded-md transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-[#007A35]" />
          View Profile
        </Link>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Member Management"
        description="Register new members, view membership statuses, and manage member profiles."
        action={
          <Link
            href="/owner/members/new"
            className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Register New Member
          </Link>
        }
      />

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
          <input
            type="text"
            placeholder="Search by member name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none font-semibold text-[#4A4D58]"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        keyExtractor={(m) => m.id}
        emptyMessage="No members match your search criteria."
      />
    </div>
  )
}
