"use client"

import { useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { updateMemberStatus } from "@/app/actions/members"
import { issueSessionPack } from "@/app/actions/packs"
import { ArrowLeft, Calendar, User, ShieldAlert, CheckCircle, Clock, Plus, Dumbbell } from "lucide-react"

import { RecordDeskPaymentDialog } from "../../financials/components/financial-modals"

interface MemberProfileClientProps {
  member: any
}

export function MemberProfileClient({ member }: MemberProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "payments" | "progress">("overview")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [packModalOpen, setPackModalOpen] = useState(false)
  const [deskPaymentModalOpen, setDeskPaymentModalOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<"SUSPENDED" | "INACTIVE" | "ACTIVE">("SUSPENDED")
  const [loading, setLoading] = useState(false)
  const [packMsg, setPackMsg] = useState<string | null>(null)

  const activeMembership = member.memberships[0]
  const activePack = member.sessionPacks[0]

  const handleStatusChange = async () => {
    setLoading(true)
    await updateMemberStatus(member.id, targetStatus as any)
    setLoading(false)
    setDialogOpen(false)
  }

  const handleIssuePackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setPackMsg(null)
    const formData = new FormData(e.currentTarget)
    formData.append("userId", member.id)
    const res = await issueSessionPack(formData)
    setLoading(false)

    if (res.error) {
      setPackMsg(res.error)
    } else {
      setPackModalOpen(false)
    }
  }

  const triggerDialog = (status: "SUSPENDED" | "INACTIVE" | "ACTIVE") => {
    setTargetStatus(status)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/owner/members"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8E98] hover:text-[#171B28] font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Member Roster
        </Link>
      </div>

      {/* Member Header Banner */}
      <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#007A35]/10 border-2 border-[#007A35]/20 flex items-center justify-center text-[#007A35] font-extrabold text-xl shrink-0">
            {member.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#171B28]">{member.fullName}</h1>
              <StatusBadge status={member.memberStatus || "INACTIVE"} />
            </div>
            <p className="text-xs text-[#8B8E98] mt-0.5">
              {member.email} • {member.phone || "No phone"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {member.memberStatus === "ACTIVE" ? (
            <>
              <button
                onClick={() => triggerDialog("SUSPENDED")}
                className="px-3.5 py-2 bg-[#FFF0E0] hover:bg-[#FFE3C7] text-[#F97316] text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Suspend Member
              </button>
              <button
                onClick={() => triggerDialog("INACTIVE")}
                className="px-3.5 py-2 bg-[#FDE4E4] hover:bg-[#F8C4C4] text-[#D71920] text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Deactivate
              </button>
            </>
          ) : (
            <button
              onClick={() => triggerDialog("ACTIVE")}
              className="px-3.5 py-2 bg-[#DDF5E7] hover:bg-[#BBEBD0] text-[#007A35] text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Reactivate Member
            </button>
          )}
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-[#E1E1E4] gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "overview"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "attendance"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          Attendance History
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "payments"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          Billing History
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Membership Info Card */}
          <div className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase text-[#8B8E98] tracking-wider">
              Membership & Billing Details
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                <span className="text-[#8B8E98]">Current Plan:</span>
                <span className="font-bold text-[#171B28]">{activeMembership?.plan?.name || "None"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                <span className="text-[#8B8E98]">Plan Price:</span>
                <span className="font-bold text-[#007A35]">${activeMembership?.plan?.price?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                <span className="text-[#8B8E98]">Start Date:</span>
                <span className="font-medium text-[#4A4D58]" suppressHydrationWarning>
                  {activeMembership?.startDate ? new Date(activeMembership.startDate).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                <span className="text-[#8B8E98]">Expiry Date:</span>
                <span className="font-medium text-[#4A4D58]" suppressHydrationWarning>
                  {activeMembership?.endDate ? new Date(activeMembership.endDate).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Session Pack Card */}
          <div className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase text-[#8B8E98] tracking-wider">
                PT Session Pack Balance
              </h2>
              <button
                onClick={() => setPackModalOpen(true)}
                className="px-2.5 py-1 bg-[#DDF5E7] hover:bg-[#BBEBD0] text-[#007A35] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Issue New Pack
              </button>
            </div>

            {activePack ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                  <span className="text-[#8B8E98]">Total Sessions Purchased:</span>
                  <span className="font-bold text-[#171B28]">{activePack.totalSessions}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                  <span className="text-[#8B8E98]">Sessions Remaining:</span>
                  <span className="font-extrabold text-[#007A35] text-sm">{activePack.remainingSessions}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                  <span className="text-[#8B8E98]">Pack Status:</span>
                  <StatusBadge status={activePack.status} />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8B8E98]">No active PT session pack found for this member.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase text-[#8B8E98] mb-4">Recent Sessions History</h2>
          <div className="divide-y divide-[#E1E1E4]">
            {member.sessionsClient.map((session: any) => (
              <div key={session.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#171B28]">
                    {new Date(session.scheduledAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#8B8E98]">
                    Trainer: {session.trainer.fullName} • {session.duration} mins
                  </p>
                </div>
                <StatusBadge status={session.status} />
              </div>
            ))}
            {member.sessionsClient.length === 0 && (
              <p className="text-xs text-[#8B8E98] py-4">No PT sessions logged for this member yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Payments */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase text-[#8B8E98]">Billing Transactions & Receipts</h2>
              <p className="text-xs text-[#4A4D58]">Payment history for memberships and PT packs</p>
            </div>
            <button
              onClick={() => setDeskPaymentModalOpen(true)}
              className="bg-[#007A35] hover:bg-[#005c28] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
            >
              Record Desk Payment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[#8B8E98] uppercase">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Item / Description</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeMembership && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 text-[#4A4D58]">
                      {new Date(activeMembership.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-[#171B28]">
                      Membership: {activeMembership.plan.name}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        PAID
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#171B28]">
                      ${activeMembership.plan.price.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => alert(`Receipt #${activeMembership.id.slice(-6)}: Paid $${activeMembership.plan.price.toFixed(2)} via GymOS Desk Billing`)}
                        className="text-[#007A35] hover:underline text-[11px] font-medium"
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                )}

                {member.sessionPacks.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 text-[#4A4D58]">
                      {new Date(p.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-[#171B28]">
                      PT Pack: {p.totalSessions} Sessions ({p.status})
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        PAID
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#171B28]">
                      ${(p.price || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => alert(`Receipt #${p.id.slice(-6)}: Paid $${(p.price || 0).toFixed(2)} for ${p.totalSessions} PT Sessions`)}
                        className="text-[#007A35] hover:underline text-[11px] font-medium"
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <RecordDeskPaymentDialog
            isOpen={deskPaymentModalOpen}
            onClose={() => setDeskPaymentModalOpen(false)}
            members={[{ id: member.id, fullName: member.fullName }]}
          />
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleStatusChange}
        loading={loading}
        title={`Confirm Member Status Change`}
        description={`Are you sure you want to change ${member.fullName}'s status to ${targetStatus}? This will immediately affect their gym access.`}
        confirmText={`Change Status to ${targetStatus}`}
        isDestructive={targetStatus !== "ACTIVE"}
      />

      {/* Issue Session Pack Modal (FR-064 / Deferred Revenue) */}
      {packModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E1E1E4] max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#171B28]">Issue PT Session Pack</h3>
            <p className="text-xs text-[#8B8E98]">
              Issue a personal training session pack. Upfront revenue will be tracked as Deferred Revenue (BR-064).
            </p>

            {packMsg && (
              <p className="text-xs text-[#D71920] bg-[#FDE4E4] p-2.5 rounded-lg border border-[#F8B4B4]">
                {packMsg}
              </p>
            )}

            <form onSubmit={handleIssuePackSubmit} className="space-y-4">
              <div>
                <label htmlFor="totalSessions" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                  Total Sessions *
                </label>
                <input
                  type="number"
                  id="totalSessions" name="totalSessions"
                  required
                  defaultValue={10}
                  className="w-full px-3 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                  Pack Total Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="price" name="price"
                  required
                  defaultValue={450.00}
                  className="w-full px-3 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>

              <div>
                <label htmlFor="durationDays" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                  Validity Duration (Days)
                </label>
                <input
                  type="number"
                  id="durationDays" name="durationDays"
                  defaultValue={90}
                  className="w-full px-3 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>

              <div className="pt-3 border-t border-[#E1E1E4] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPackModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A4D58] bg-[#F5F4F5] hover:bg-[#EAEAEA] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#007A35] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  {loading ? "Issuing Pack..." : "Confirm & Issue Pack"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
