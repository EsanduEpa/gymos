import { auth } from "@/lib/auth"
import { Calendar, Users, ClipboardList, Wallet } from "lucide-react"

export default async function TrainerDashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171B28]">Personal Trainer Portal</h1>
        <p className="text-xs text-[#8B8E98] mt-1">
          Welcome back, {session?.user?.fullName}. Here is your schedule and client overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
              Today's Sessions
            </p>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">0</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
              Active Clients
            </p>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">0</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
              Active Plans
            </p>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">0</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
              Month Earnings
            </p>
            <p className="text-2xl font-extrabold text-[#007A35] mt-1">$0.00</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
