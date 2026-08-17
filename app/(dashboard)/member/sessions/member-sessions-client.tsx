"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { cancelSession } from "@/app/actions/sessions"
import { CalendarPlus, X } from "lucide-react"

interface MemberSession {
  id: string
  scheduledAt: string | Date
  duration: number
  type: string
  status: string
  notes: string | null
  trainer: { fullName: string }
}

interface MemberSessionsClientProps {
  sessions: MemberSession[]
}

const CANCELLABLE = ["PENDING_CONFIRMATION", "SCHEDULED"]

export function MemberSessionsClient({ sessions }: MemberSessionsClientProps) {
  const [target, setTarget] = useState<MemberSession | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConfirmCancel = async () => {
    if (!target) return
    setLoading(true)
    await cancelSession(target.id)
    setLoading(false)
    setTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="My PT Sessions"
        description="Track your session requests from submission through confirmation, completion, or decline."
        action={
          <Link
            href="/member/trainers"
            className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <CalendarPlus className="h-4 w-4" />
            Request a Session
          </Link>
        }
      />

      <div className="space-y-4">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#F5F4F5] border border-[#E1E1E4] flex flex-col items-center justify-center shrink-0">
                <p className="text-xs font-bold text-[#171B28]" suppressHydrationWarning>
                  {new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-[9px] text-[#8B8E98] uppercase" suppressHydrationWarning>
                  {new Date(s.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-sm text-[#171B28]">{s.trainer.fullName}</h3>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-xs text-[#8B8E98] mt-0.5">
                  {s.type} • {s.duration} mins
                </p>
                {s.notes && (
                  <p className="text-xs text-[#4A4D58] mt-1 bg-[#F5F4F5] p-2 rounded border border-[#E1E1E4] italic max-w-md">
                    {s.notes}
                  </p>
                )}
              </div>
            </div>

            {CANCELLABLE.includes(s.status) && (
              <button
                onClick={() => setTarget(s)}
                className="px-3 py-1.5 bg-[#FDE4E4] hover:bg-[#F8C4C4] text-[#D71920] text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                {s.status === "PENDING_CONFIRMATION" ? "Withdraw Request" : "Cancel Session"}
              </button>
            )}
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E1E1E4] p-12 text-center text-[#8B8E98] text-xs">
            You haven&apos;t requested any PT sessions yet.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={handleConfirmCancel}
        loading={loading}
        title={target?.status === "PENDING_CONFIRMATION" ? "Withdraw Session Request" : "Cancel Confirmed Session"}
        description={
          target?.status === "PENDING_CONFIRMATION"
            ? "This will withdraw your request. No sessions will be deducted from your pack."
            : "Cancelling within your gym's cancellation window may deduct a session from your pack."
        }
        confirmText="Confirm"
      />
    </div>
  )
}
