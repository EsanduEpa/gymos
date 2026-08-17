"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { createTrainer } from "@/app/actions/trainers"
import { TemporaryPasswordNotice } from "@/components/shared/temporary-password-notice"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface IssuedAccount {
  fullName: string
  email: string
  temporaryPassword: string
  profileHref: string
}

export function NewTrainerForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [issued, setIssued] = useState<IssuedAccount | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await createTrainer(formData)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else if (res.temporaryPassword) {
      // Hold on this screen — the temporary password exists only right now.
      setIssued({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        temporaryPassword: res.temporaryPassword,
        profileHref: `/owner/trainers/${res.trainerId}`,
      })
    }
  }

  if (issued) {
    return (
      <div>
        <PageHeader
          title="Trainer account created"
          description="Pass these sign-in details to the trainer."
        />
        <TemporaryPasswordNotice
          fullName={issued.fullName}
          email={issued.email}
          temporaryPassword={issued.temporaryPassword}
          continueHref={issued.profileHref}
          continueLabel="View trainer profile"
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/owner/trainers"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8E98] hover:text-[#171B28] font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Trainer Roster
        </Link>
      </div>

      <PageHeader
        title="Add New Personal Trainer"
        description="Create trainer account, assign pay level, and set shift schedule (FR-055 / SCR-24)."
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
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. David Miller"
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="david@fitgym.com"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                required
                placeholder="+94 77 987 6543"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Trainer Level *
              </label>
              <select
                name="trainerLevel"
                required
                defaultValue="LEVEL_1"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35] font-semibold text-[#171B28]"
              >
                <option value="LEVEL_1">Level 1 Trainer</option>
                <option value="LEVEL_2">Level 2 Senior Trainer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsExperience"
                placeholder="5"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Specialisations (comma separated)
            </label>
            <input
              type="text"
              name="specialisations"
              placeholder="e.g. Strength Training, Bodybuilding, CrossFit"
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Shift Start (HH:mm)
              </label>
              <input
                type="text"
                name="shiftStart"
                defaultValue="08:00"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Shift End (HH:mm)
              </label>
              <input
                type="text"
                name="shiftEnd"
                defaultValue="17:00"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Biography / Summary
            </label>
            <textarea
              name="bio"
              rows={3}
              placeholder="Brief professional bio for client visibility..."
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>

          <div className="pt-4 border-t border-[#E1E1E4] flex items-center justify-end gap-3">
            <Link
              href="/owner/trainers"
              className="px-4 py-2 text-xs font-semibold text-[#4A4D58] bg-[#F5F4F5] hover:bg-[#EAEAEA] rounded-lg cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              {loading ? "Creating Account..." : "Create Trainer Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
