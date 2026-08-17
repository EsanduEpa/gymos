"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { requestSession } from "@/app/actions/sessions"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface RequestSessionFormProps {
  trainer: { id: string; fullName: string; trainerLevel: string | null; shiftStart: string | null; shiftEnd: string | null }
  remainingSessions: number
}

export function RequestSessionForm({ trainer, remainingSessions }: RequestSessionFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("trainerId", trainer.id)
    const res = await requestSession(formData)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      router.push("/member/sessions")
    }
  }

  const todayStr = new Date().toISOString().split("T")[0]

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/member/trainers"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8E98] hover:text-[#171B28] font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Trainer Directory
        </Link>
      </div>

      <PageHeader
        title={`Request a Session with ${trainer.fullName}`}
        description="Your trainer will need to confirm this request before it's booked (BR-049 availability applies)."
      />

      {remainingSessions === 0 && (
        <div className="mb-6 p-4 rounded-xl bg-[#FDE4E4] border border-[#F8B4B4] text-[#D71920] text-xs flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>You have no sessions remaining on your pack (BR-018). Ask the front desk to issue a new pack before requesting a session.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#FDE4E4] border border-[#F8B4B4] text-[#D71920] text-xs flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#F5F4F5] rounded-lg border border-[#E1E1E4] text-xs text-[#4A4D58]">
            <span className="font-semibold">{trainer.fullName}</span>
            {" "}• Shift: {trainer.shiftStart || "08:00"} - {trainer.shiftEnd || "17:00"}
            {" "}• Sessions remaining on your pack: <span className="font-bold text-[#007A35]">{remainingSessions}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Date *</label>
              <input
                type="date"
                name="date"
                required
                min={todayStr}
                defaultValue={todayStr}
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Time (HH:mm) *</label>
              <input
                type="time"
                name="time"
                required
                defaultValue="10:00"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Session Type *</label>
              <select
                name="type"
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
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                defaultValue={60}
                min={20}
                step={5}
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Goals / Notes for Your Trainer
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="What would you like to focus on? Any injuries or special requests..."
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>

          <div className="pt-4 border-t border-[#E1E1E4] flex items-center justify-end gap-3">
            <Link
              href="/member/trainers"
              className="px-4 py-2 text-xs font-semibold text-[#4A4D58] bg-[#F5F4F5] hover:bg-[#EAEAEA] rounded-lg cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || remainingSessions === 0}
              className="px-5 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Sending Request..." : "Send Session Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
