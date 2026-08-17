"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { bookSession } from "@/app/actions/sessions"
import { AlertCircle, ArrowLeft, Calendar, Clock } from "lucide-react"
import Link from "next/link"

interface BookSessionFormProps {
  members: any[]
  trainers: any[]
}

export function BookSessionForm({ members, trainers }: BookSessionFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await bookSession(formData)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      router.push("/owner/sessions")
    }
  }

  const todayStr = new Date().toISOString().split("T")[0]

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/owner/sessions"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8E98] hover:text-[#171B28] font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Session Oversight
        </Link>
      </div>

      <PageHeader
        title="Book Personal Training Session"
        description="Schedule a PT session with pack balance validation (BR-018) and trainer collision checking (BR-049)."
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#FDE4E4] border border-[#F8B4B4] text-[#D71920] text-xs flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientId" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Select Member (Eligible Pack Balance &gt; 0) *
            </label>
            {members.length === 0 ? (
              <p className="text-xs text-[#D71920] bg-[#FDE4E4] p-2.5 rounded-lg border border-[#F8B4B4]">
                No members found with an active session pack balance. Issue a session pack in Member Profile first.
              </p>
            ) : (
              <select
                id="clientId" name="clientId"
                required
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35] font-semibold text-[#171B28]"
              >
                <option value="">-- Select Member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.sessionPacks[0]?.remainingSessions || 0} sessions remaining)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="trainerId" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Select Personal Trainer *
            </label>
            <select
              id="trainerId" name="trainerId"
              required
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35] font-semibold text-[#171B28]"
            >
              <option value="">-- Select Trainer --</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} (Shift: {t.shiftStart || "08:00"} - {t.shiftEnd || "17:00"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date" name="date"
                required
                defaultValue={todayStr}
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Time (HH:mm) *
              </label>
              <input
                type="time"
                id="time" name="time"
                required
                defaultValue="10:00"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Session Type *
              </label>
              <select
                id="type" name="type"
                required
                defaultValue="IN_PERSON"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35] font-semibold text-[#171B28]"
              >
                <option value="IN_PERSON">In-Person Training</option>
                <option value="VIRTUAL">Virtual Online Session</option>
                <option value="INTRODUCTORY">Introductory Session</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration" name="duration"
                defaultValue={60}
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Session Notes / Instructions
            </label>
            <textarea
              id="notes" name="notes"
              rows={3}
              placeholder="Focus areas (e.g. Legs & Core), injuries, or special client requests..."
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>

          <div className="pt-4 border-t border-[#E1E1E4] flex items-center justify-end gap-3">
            <Link
              href="/owner/sessions"
              className="px-4 py-2 text-xs font-semibold text-[#4A4D58] bg-[#F5F4F5] hover:bg-[#EAEAEA] rounded-lg cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || members.length === 0}
              className="px-5 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Booking Session..." : "Confirm & Book Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
