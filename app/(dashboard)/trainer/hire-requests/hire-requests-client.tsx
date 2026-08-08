"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { respondHireRequest } from "@/app/actions/hire"
import { Check, X, User, Calendar, MessageSquare } from "lucide-react"

interface HireRequestsClientProps {
  requests: any[]
}

export function HireRequestsClient({ requests }: HireRequestsClientProps) {
  const [loading, setLoading] = useState(false)

  const handleResponse = async (requestId: string, status: "ACCEPTED" | "DECLINED") => {
    setLoading(true)
    await respondHireRequest(requestId, status)
    setLoading(false)
  }

  return (
    <div>
      <PageHeader
        title="Client Hire Requests"
        description="Review private trainer hire requests submitted by gym members (FR-083 / SCR-31)."
      />

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-[#007A35]/10 border border-[#007A35]/20 flex items-center justify-center text-[#007A35] font-extrabold text-base shrink-0">
                {req.client.fullName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-sm text-[#171B28]">{req.client.fullName}</h3>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-xs text-[#8B8E98] mt-0.5" suppressHydrationWarning>
                  Requested on {new Date(req.createdAt).toLocaleDateString()} • {req.client.email}
                </p>
                {req.message && (
                  <p className="text-xs text-[#4A4D58] mt-2 bg-[#F5F4F5] p-2.5 rounded-lg border border-[#E1E1E4] flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-[#007A35] shrink-0 mt-0.5" />
                    <span>Goals: "{req.message}"</span>
                  </p>
                )}
              </div>
            </div>

            {req.status === "PENDING" ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleResponse(req.id, "ACCEPTED")}
                  disabled={loading}
                  className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <Check className="h-4 w-4" /> Accept Client
                </button>
                <button
                  onClick={() => handleResponse(req.id, "DECLINED")}
                  disabled={loading}
                  className="px-3.5 py-2 bg-[#FDE4E4] hover:bg-[#F8C4C4] text-[#D71920] text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" /> Decline
                </button>
              </div>
            ) : (
              <span className="text-xs text-[#8B8E98] font-semibold italic">
                Responded: {req.status}
              </span>
            )}
          </div>
        ))}

        {requests.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E1E1E4] p-12 text-center text-[#8B8E98] text-xs">
            No hire requests found.
          </div>
        )}
      </div>
    </div>
  )
}
