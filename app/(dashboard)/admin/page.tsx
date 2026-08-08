import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Shield } from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await auth()
  const gyms = await prisma.gym.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171B28]">SuperAdmin Control Panel</h1>
        <p className="text-xs text-[#8B8E98] mt-1">
          Logged in as {session?.user?.fullName} (SuperAdmin). Manage all platform tenants.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#E1E1E4] shadow-sm">
        <h2 className="text-sm font-bold text-[#171B28] mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#007A35]" />
          Platform Gym Tenants ({gyms.length})
        </h2>

        <div className="divide-y divide-[#E1E1E4]">
          {gyms.map((gym) => (
            <div key={gym.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#171B28]">{gym.name}</p>
                <p className="text-xs text-[#8B8E98]">
                  {gym.address || "No address set"} • Users: {gym._count.users}
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#DDF5E7] text-[#007A35]">
                Active Tenant
              </span>
            </div>
          ))}
          {gyms.length === 0 && (
            <p className="text-xs text-[#8B8E98] py-4">No gyms created yet. Run database seed to populate test gym.</p>
          )}
        </div>
      </div>
    </div>
  )
}
