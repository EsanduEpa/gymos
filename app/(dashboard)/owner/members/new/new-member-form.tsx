"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { createMember } from "@/app/actions/members"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface NewMemberFormProps {
  plans: any[]
}

export function NewMemberForm({ plans }: NewMemberFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await createMember(formData)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      router.push(`/owner/members/${res.memberId}`)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/owner/members"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8E98] hover:text-[#171B28] font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Member List
        </Link>
      </div>

      <PageHeader
        title="Register New Member"
        description="Enter personal details and assign an active membership plan (FR-001 / SCR-02)."
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
              placeholder="e.g. Johnathan Doe"
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
                placeholder="john@example.com"
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
                placeholder="+94 77 123 4567"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                required
                defaultValue="1998-01-01"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                placeholder="Name / Phone"
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Select Membership Plan *
            </label>
            <select
              name="membershipPlanId"
              required
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35] font-semibold text-[#171B28]"
            >
              <option value="">-- Choose a Plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${p.price.toFixed(2)} ({p.durationDays} days)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Health Notes / Allergies
            </label>
            <textarea
              name="healthNotes"
              rows={3}
              placeholder="Any existing medical conditions, injuries, or trainer notes..."
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>

          <div className="pt-4 border-t border-[#E1E1E4] flex items-center justify-end gap-3">
            <Link
              href="/owner/members"
              className="px-4 py-2 text-xs font-semibold text-[#4A4D58] bg-[#F5F4F5] hover:bg-[#EAEAEA] rounded-lg cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              {loading ? "Registering..." : "Complete Member Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
