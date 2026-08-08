import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Users, Dumbbell, Calendar, DollarSign } from "lucide-react"

export default async function OwnerDashboardPage() {
  const session = await auth()
  const gymId = session?.user?.gymId

  // Fetch basic counts for initial layout check
  const memberCount = gymId
    ? await prisma.user.count({ where: { gymId, role: "GYM_MEMBER" } })
    : 0
  const trainerCount = gymId
    ? await prisma.user.count({ where: { gymId, role: "PERSONAL_TRAINER" } })
    : 0
  const sessionCount = gymId
    ? await prisma.pTSession.count({ where: { gymId } })
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#171B28]">Gym Owner Dashboard</h1>
        <p className="text-xs text-[#8B8E98] mt-1">
          Welcome back, {session?.user?.fullName}. Here is your operational overview.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
              Total Members
            </p>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">{memberCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
              Trainers On Roster
            </p>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">{trainerCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Dumbbell className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
              Total PT Sessions
            </p>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">{sessionCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
              Today's Revenue
            </p>
            <p className="text-2xl font-extrabold text-[#007A35] mt-1">$0.00</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area Placeholder */}
      <div className="bg-white p-6 rounded-xl border border-[#E1E1E4] shadow-sm">
        <h2 className="text-sm font-bold text-[#171B28] mb-2">Part 1 Setup Complete</h2>
        <p className="text-xs text-[#8B8E98]">
          Database schema initialized, Auth.js configured, and UI dashboard shell rendered. Ready for Part 2 (Management & Configuration).
        </p>
      </div>
    </div>
  )
}
