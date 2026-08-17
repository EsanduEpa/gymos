"use client"

import { useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { updateTrainerStatus, approveShiftHours } from "@/app/actions/trainers"
import { ArrowLeft, Calendar, Dumbbell, Users, CheckCircle, Clock } from "lucide-react"

interface TrainerProfileClientProps {
  trainer: any
}

export function TrainerProfileClient({ trainer }: TrainerProfileClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [shiftStart, setShiftStart] = useState(trainer.shiftStart || "08:00")
  const [shiftEnd, setShiftEnd] = useState(trainer.shiftEnd || "17:00")
  const [shiftMsg, setShiftMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const completedSessions = trainer.sessionsTrainer.filter((s: any) => s.status === "COMPLETED").length
  const activeClientsCount = trainer.activeClientsCount

  const handleDeactivate = async () => {
    setLoading(true)
    await updateTrainerStatus(trainer.id, trainer.trainerStatus === "ACTIVE" ? "DEACTIVATED" : "ACTIVE")
    setLoading(false)
    setDialogOpen(false)
  }

  const handleApproveShift = async (e: React.FormEvent) => {
    e.preventDefault()
    setShiftMsg(null)
    setLoading(true)
    const res = await approveShiftHours(trainer.id, shiftStart, shiftEnd)
    setLoading(false)
    if (res.error) {
      setShiftMsg("Failed to approve shift hours")
    } else {
      setShiftMsg("Shift hours approved and updated!")
    }
  }

  let specs: string[] = []
  if (Array.isArray(trainer.specialisations)) {
    specs = trainer.specialisations
  } else if (typeof trainer.specialisations === "string") {
    try { specs = JSON.parse(trainer.specialisations) } catch (e) {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/owner/trainers"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8E98] hover:text-[#171B28] font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Trainer Roster
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#007A35]/10 border-2 border-[#007A35]/20 flex items-center justify-center text-[#007A35] font-extrabold text-xl shrink-0">
            {trainer.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#171B28]">{trainer.fullName}</h1>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  trainer.trainerLevel === "LEVEL_2"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {trainer.trainerLevel === "LEVEL_2" ? "Level 2 Senior Trainer" : "Level 1 Trainer"}
              </span>
              <StatusBadge status={trainer.trainerStatus || "ACTIVE"} />
            </div>
            <p className="text-xs text-[#8B8E98] mt-0.5">
              {trainer.email} • {trainer.phone || "No phone"} • {trainer.yearsExperience || 0} Years Experience
            </p>
          </div>
        </div>

        <button
          onClick={() => setDialogOpen(true)}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
            trainer.trainerStatus === "ACTIVE"
              ? "bg-[#FDE4E4] hover:bg-[#F8C4C4] text-[#D71920]"
              : "bg-[#DDF5E7] hover:bg-[#BBEBD0] text-[#007A35]"
          }`}
        >
          {trainer.trainerStatus === "ACTIVE" ? "Deactivate Trainer" : "Reactivate Trainer"}
        </button>
      </div>

      {/* Performance Stats Cards (FR-061) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sessions Completed"
          value={completedSessions}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Active Clients"
          value={activeClientsCount}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Years Experience"
          value={`${trainer.yearsExperience || 0} Yrs`}
          icon={<Dumbbell className="h-5 w-5" />}
        />
        <StatCard
          label="Trainer Rating"
          value={`${trainer.ratingAvg || "5.0"} ★`}
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shift Approval Form (FR-060) */}
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase text-[#8B8E98] tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#007A35]" /> Shift Hours & Approval
          </h2>

          {shiftMsg && (
            <p className="text-xs font-semibold text-[#007A35] bg-[#DDF5E7] p-2.5 rounded-lg border border-[#BBEBD0]">
              {shiftMsg}
            </p>
          )}

          <form onSubmit={handleApproveShift} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Shift Start</label>
                <input
                  type="text"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Shift End</label>
                <input
                  type="text"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#007A35] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Approve Shift Hours
            </button>
          </form>
        </div>

        {/* Bio & Specialisations */}
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase text-[#8B8E98] tracking-wider">
            Specialisations & Bio
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8B8E98] mb-1.5">Specialisations</p>
              <div className="flex flex-wrap gap-1.5">
                {specs.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-[#F5F4F5] border border-[#E1E1E4] text-[#171B28] rounded-md text-xs font-medium">
                    {s}
                  </span>
                ))}
                {specs.length === 0 && <span className="text-xs text-[#8B8E98]">None specified</span>}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] uppercase font-bold text-[#8B8E98] mb-1">Biography</p>
              <p className="text-xs text-[#4A4D58] leading-relaxed">{trainer.bio || "No biography provided."}</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDeactivate}
        loading={loading}
        title="Confirm Trainer Status Change"
        description={`Are you sure you want to change status for ${trainer.fullName}? Deactivating hides profile from active booking lists.`}
        confirmText="Confirm Status Change"
      />
    </div>
  )
}
