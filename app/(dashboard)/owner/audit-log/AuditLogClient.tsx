"use client"

import { useState } from "react"
import { Download, Filter, ShieldAlert } from "lucide-react"
import { getAuditLogs } from "@/app/actions/audit"

interface AuditLogClientProps {
  initialData: {
    logs: any[]
    totalCount: number
    totalPages: number
    currentPage: number
  }
}

const ACTION_TYPES = [
  "ALL",
  "MEMBER_CREATED",
  "MEMBER_UPDATED",
  "MEMBER_SUSPENDED",
  "TRAINER_CREATED",
  "SESSION_CREATED",
  "SESSION_OVERRIDDEN",
  "EXPENSE_CREATED",
  "PAY_PERIOD_CLOSED",
]

export default function AuditLogClient({ initialData }: AuditLogClientProps) {
  const [data, setData] = useState(initialData)
  const [selectedAction, setSelectedAction] = useState("ALL")
  const [loading, setLoading] = useState(false)

  const handleFilterChange = async (action: string) => {
    setSelectedAction(action)
    setLoading(true)
    try {
      const res = await getAuditLogs({ actionType: action, page: 1 })
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (page: number) => {
    setLoading(true)
    try {
      const res = await getAuditLogs({ actionType: selectedAction, page })
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Timestamp", "User Name", "User Email", "Action Type", "Affected Record ID", "Details"]
    const rows = data.logs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      `"${log.user?.fullName || ""}"`,
      `"${log.user?.email || ""}"`,
      log.actionType,
      log.affectedRecordId,
      `"${(log.details || "").replace(/"/g, '""')}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `audit-log-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171B28]">Security & Audit Logs</h1>
          <p className="text-xs text-[#8B8E98] mt-1">Trace all system actions, overrides, and administrative modifications.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#007A35] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#00632B] transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-[#8B8E98]" />
          <span className="text-xs font-semibold text-[#171B28]">Action Filter:</span>
          <select
            value={selectedAction}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-[#F8F9FA] border border-[#E1E1E4] rounded-lg text-xs font-medium text-[#171B28] focus:outline-none focus:border-[#007A35]"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#8B8E98]">
          Showing <span className="font-bold text-[#171B28]">{data.logs.length}</span> of <span className="font-bold text-[#171B28]">{data.totalCount}</span> logs
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171B28]">
            <thead className="bg-[#F8F9FA] border-b border-[#E1E1E4] font-semibold text-[#8B8E98] uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Affected Record ID</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E1E4]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8B8E98]">
                    Loading audit records...
                  </td>
                </tr>
              ) : data.logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8B8E98]">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-[#8B8E98] font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {log.user?.fullName}
                      <span className="block text-[10px] text-[#8B8E98] font-normal">{log.user?.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#007A35]/10 text-[#007A35]">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#8B8E98]">{log.affectedRecordId}</td>
                    <td className="px-4 py-3 text-[#8B8E98] max-w-xs truncate">{log.details || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data.totalPages > 1 && (
          <div className="p-4 border-t border-[#E1E1E4] flex items-center justify-between bg-[#F8F9FA]">
            <button
              disabled={data.currentPage === 1}
              onClick={() => handlePageChange(data.currentPage - 1)}
              className="px-3 py-1 bg-white border border-[#E1E1E4] rounded text-xs font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-[#8B8E98]">
              Page {data.currentPage} of {data.totalPages}
            </span>
            <button
              disabled={data.currentPage === data.totalPages}
              onClick={() => handlePageChange(data.currentPage + 1)}
              className="px-3 py-1 bg-white border border-[#E1E1E4] rounded text-xs font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
