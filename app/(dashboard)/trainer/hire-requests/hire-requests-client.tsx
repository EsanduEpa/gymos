"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { acceptHireRequest, declineHireRequest } from "@/app/actions/hire-requests"
import {
  Calendar,
  Clock,
  User,
  Check,
  X,
  AlertCircle,
  Inbox,
  CreditCard,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"

interface HireRequest {
  id: string
  scheduledAt: string | Date
  duration: number
  type: string
  status: string
  notes: string | null
  fee: number
  client: {
    id: string
    fullName: string
    email: string
    phone: string | null
    photo: string | null
    sessionPacks: { id: string; remainingSessions: number }[]
  }
}

interface HireRequestsClientProps {
  requests: HireRequest[]
}

const SESSION_TYPE_LABEL: Record<string, string> = {
  IN_PERSON: "In Person",
  VIRTUAL: "Virtual",
  INTRODUCTORY: "Introductory Assessment",
}

function fmtDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function HireRequestsClient({ requests: initialRequests }: HireRequestsClientProps) {
  const [requests, setRequests] = useState<HireRequest[]>(initialRequests)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Decline dialog state
  const [declineTarget, setDeclineTarget] = useState<HireRequest | null>(null)
  const [declineReason, setDeclineReason] = useState("")

  const handleAccept = async (requestId: string) => {
    setLoadingId(requestId)
    setErrorMessage(null)
    setSuccessMessage(null)

    const res = await acceptHireRequest(requestId, true)
    setLoadingId(null)

    if (res.error) {
      setErrorMessage(res.error)
      return
    }

    setSuccessMessage("Hire request accepted and scheduled!")
    setRequests(requests.filter((r) => r.id !== requestId))
  }

  const handleDeclineConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!declineTarget) return

    setLoadingId(declineTarget.id)
    setErrorMessage(null)
    setSuccessMessage(null)

    const res = await declineHireRequest(declineTarget.id, declineReason)
    setLoadingId(null)

    if (res.error) {
      setErrorMessage(res.error)
      return
    }

    setSuccessMessage("Session request declined.")
    setRequests(requests.filter((r) => r.id !== declineTarget.id))
    setDeclineTarget(null)
    setDeclineReason("")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Hire Requests"
        description="Review incoming 1-on-1 personal training requests from gym members. Accepting deducts pack credits and books the session into your calendar."
      />

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-green-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B8E98]">
            Pending Requests
          </span>
          <p className="text-2xl font-bold text-[#171B28] mt-1">{requests.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B8E98]">
            Pre-paid With Pack Credit
          </span>
          <p className="text-2xl font-bold text-[#007A35] mt-1">
            {requests.filter((r) => (r.client.sessionPacks[0]?.remainingSessions ?? 0) > 0).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B8E98]">
            Direct Session Billing
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {requests.filter((r) => (r.client.sessionPacks[0]?.remainingSessions ?? 0) === 0).length}
          </p>
        </div>
      </div>

      {/* Main Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#171B28]">No Pending Hire Requests</h3>
          <p className="text-xs text-[#8B8E98] max-w-sm mx-auto">
            You're all caught up! New onboarding or session requests submitted by gym members will appear here for your confirmation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const activePack = req.client.sessionPacks[0]
            const hasPackCredit = (activePack?.remainingSessions ?? 0) > 0

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-gray-300 transition-colors"
              >
                {/* Client info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0 text-base">
                    {req.client.photo ? (
                      <img
                        src={req.client.photo}
                        alt={req.client.fullName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      req.client.fullName.charAt(0)
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-[#171B28]">{req.client.fullName}</h4>
                      <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                        Pending Confirmation
                      </span>
                    </div>

                    <p className="text-xs text-[#8B8E98]">{req.client.email} {req.client.phone && `• ${req.client.phone}`}</p>

                    {/* Pack badge */}
                    <div className="pt-1 flex items-center gap-2">
                      {hasPackCredit ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                          <CreditCard className="h-3 w-3" />
                          {activePack.remainingSessions} Sessions Available in Pack
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <CreditCard className="h-3 w-3" />
                          Direct Session Fee: ${req.fee.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session scheduling details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-[#E1E1E4] pt-4 lg:pt-0 lg:pl-6 text-xs text-gray-600">
                  <div>
                    <span className="text-[#8B8E98] block text-[10px] uppercase font-bold">Requested Time</span>
                    <div className="font-semibold text-sm text-[#171B28] mt-0.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#007A35]" />
                      <span>{fmtDateTime(req.scheduledAt)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#8B8E98] block text-[10px] uppercase font-bold">Duration & Type</span>
                    <div className="font-semibold text-sm text-[#171B28] mt-0.5 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span>{req.duration} min • {SESSION_TYPE_LABEL[req.type] ?? req.type}</span>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[#8B8E98] block text-[10px] uppercase font-bold">Member Goal / Note</span>
                      <p className="text-xs text-gray-700 italic mt-0.5 max-w-xs truncate">
                        "{req.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E1E1E4]">
                  <button
                    onClick={() => setDeclineTarget(req)}
                    disabled={loadingId === req.id}
                    className="px-3.5 py-2 border border-[#E1E1E4] hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Decline
                  </button>

                  <button
                    onClick={() => handleAccept(req.id)}
                    disabled={loadingId === req.id}
                    className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {loadingId === req.id ? "Confirming..." : "Accept Request"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E1E4]">
              <h3 className="font-bold text-base text-[#171B28]">Decline Session Request</h3>
              <button
                onClick={() => setDeclineTarget(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#8B8E98]">
              Decline the session request from <strong>{declineTarget.client.fullName}</strong>. The client will be notified.
            </p>

            <form onSubmit={handleDeclineConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171B28] mb-1">
                  Reason for declining (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Fully booked during this time, please request a slot on Thursday afternoon."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E1E1E4] focus:outline-none focus:border-[#007A35]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeclineTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === declineTarget.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  {loadingId === declineTarget.id ? "Declining..." : "Decline Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
