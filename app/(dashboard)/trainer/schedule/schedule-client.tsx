"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { startSession, endSession, handleNoShow, updateSessionNotes } from "@/app/actions/sessions"
import { Calendar, Clock, Play, CheckCircle, AlertTriangle, Plus, FileText, User } from "lucide-react"

interface TrainerScheduleClientProps {
  sessions: any[]
}

export function TrainerScheduleClient({ sessions }: TrainerScheduleClientProps) {
  const [loading, setLoading] = useState(false)
  const [activeTimer, setActiveTimer] = useState<number>(0)
  const [selectedNotesSession, setSelectedNotesSession] = useState<any>(null)
  const [notesText, setNotesText] = useState("")

  const activeSession = sessions.find((s) => s.status === "ACTIVE")

  useEffect(() => {
    let interval: any = null
    if (activeSession && activeSession.startedAt) {
      const startTime = new Date(activeSession.startedAt).getTime()
      interval = setInterval(() => {
        const elapsedSecs = Math.floor((Date.now() - startTime) / 1000)
        setActiveTimer(elapsedSecs > 0 ? elapsedSecs : 0)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeSession])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleStart = async (sessionId: string) => {
    setLoading(true)
    await startSession(sessionId)
    setLoading(false)
  }

  const handleComplete = async (sessionId: string) => {
    setLoading(true)
    const res = await endSession(sessionId)
    setLoading(false)
    if (res.error) {
      alert(res.error)
    }
  }

  const handleNoShowAction = async (sessionId: string) => {
    setLoading(true)
    await handleNoShow(sessionId)
    setLoading(false)
  }

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNotesSession) return
    setLoading(true)
    await updateSessionNotes(selectedNotesSession.id, notesText)
    setLoading(false)
    setSelectedNotesSession(null)
  }

  return (
    <div>
      <PageHeader
        title="Trainer Daily Schedule"
        description="Manage your scheduled sessions, active training timer, and completion logs (FR-036 / SCR-16)."
        action={
          <Link
            href="/owner/sessions/book"
            className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Book Session
          </Link>
        }
      />

      {/* Active Session Live Timer Banner */}
      {activeSession && (
        <div className="mb-6 p-6 rounded-xl bg-[#007A35] text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white text-[#007A35] text-[10px] font-extrabold uppercase">
                  Session Live
                </span>
                <p className="font-bold text-base">{activeSession.client.fullName}</p>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Type: {activeSession.type} • Target: {activeSession.duration} mins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center font-mono text-3xl font-black tracking-wider">
              {formatTimer(activeTimer)}
            </div>
            <button
              onClick={() => handleComplete(activeSession.id)}
              disabled={loading}
              className="px-5 py-2.5 bg-white text-[#007A35] hover:bg-white/90 font-extrabold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              Complete Session (Manual Fallback)
            </button>
          </div>
        </div>
      )}

      {/* Sessions Grid / List */}
      <div className="space-y-4">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#007A35]/30 transition-colors"
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
                  <h3 className="font-bold text-sm text-[#171B28]">{s.client.fullName}</h3>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-xs text-[#8B8E98] mt-0.5">
                  {s.type} • {s.duration} mins • Shift: {s.shiftStatus || "IN_SHIFT"}
                </p>
                {s.notes && (
                  <p className="text-xs text-[#4A4D58] mt-1 bg-[#F5F4F5] p-2 rounded border border-[#E1E1E4] italic">
                    Notes: {s.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Action controls */}
            <div className="flex items-center gap-2 shrink-0">
              {s.status === "SCHEDULED" && (
                <>
                  <button
                    onClick={() => handleStart(s.id)}
                    disabled={loading}
                    className="px-3.5 py-1.5 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Start Session
                  </button>
                  <button
                    onClick={() => handleNoShowAction(s.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-[#FDE4E4] hover:bg-[#F8C4C4] text-[#D71920] text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    No-Show
                  </button>
                </>
              )}

              {s.status === "COMPLETED" && (
                <button
                  onClick={() => {
                    setSelectedNotesSession(s)
                    setNotesText(s.notes || "")
                  }}
                  className="px-3 py-1.5 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[#007A35]" />
                  {s.notes ? "Edit Notes" : "Add Notes"}
                </button>
              )}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E1E1E4] p-12 text-center text-[#8B8E98] text-xs">
            No personal training sessions scheduled for today.
          </div>
        )}
      </div>

      {/* Session Notes Modal (FR-038) */}
      {selectedNotesSession && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E1E1E4] max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#171B28]">Log Session Notes (FR-038)</h3>
            <p className="text-xs text-[#8B8E98]">
              Log workout performance, notes, or achievements for {selectedNotesSession.client.fullName}. Notes are visible to the member.
            </p>

            <form onSubmit={handleSaveNotes} className="space-y-4">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={4}
                required
                placeholder="Client completed 4 sets of squat (100kg), felt strong..."
                className="w-full px-3 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotesSession(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A4D58] bg-[#F5F4F5] hover:bg-[#EAEAEA] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#007A35] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
