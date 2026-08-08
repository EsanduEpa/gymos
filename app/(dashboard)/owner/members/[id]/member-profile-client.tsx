"use client"

import { useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { updateMemberStatus } from "@/app/actions/members"
import { ArrowLeft, Calendar, User, ShieldAlert, CheckCircle, Clock } from "lucide-react"

interface MemberProfileClientProps {
  member: any
}

export function MemberProfileClient({ member }: MemberProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "payments" | "progress">("overview")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<"SUSPENDED" | "INACTIVE" | "ACTIVE">("SUSPENDED")
  const [loading, setLoading] = useState(false)

  const activeMembership = member.memberships[0]
  const activePack = member.sessionPacks[0]

  const handleStatusChange = async () => {
    setLoading(true)
    await updateMemberStatus(member.id, targetStatus as any)
    setLoading(false)
    setDialogOpen(false)
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
                <span className="font-medium text-[#4A4D58]">
                  {activeMembership?.startDate ? new Date(activeMembership.startDate).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                <span className="text-[#8B8E98]">Expiry Date:</span>
                <span className="font-medium text-[#4A4D58]">
                  {activeMembership?.endDate ? new Date(activeMembership.endDate).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Session Pack Card */}
          <div className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase text-[#8B8E98] tracking-wider">
              PT Session Pack Balance
            </h2>

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
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase text-[#8B8E98] mb-4">Billing Transactions</h2>
          <p className="text-xs text-[#8B8E98]">
            Membership purchase on {new Date(member.createdAt).toLocaleDateString()} — ${activeMembership?.plan?.price?.toFixed(2) || "0.00"}
          </p>
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
    </div>
  )
}
