"use client"

import { useState } from "react"
import { Shield, Eye, CheckCircle } from "lucide-react"
import { setImpersonatedGym } from "@/app/actions/admin"
import { useRouter } from "next/navigation"

interface AdminClientProps {
  initialData: {
    gyms: any[]
    activeImpersonatedGymId: string | null
  }
}

export default function AdminClient({ initialData }: AdminClientProps) {
  const router = useRouter()
  const [selectedGymId, setSelectedGymId] = useState(initialData.activeImpersonatedGymId || "")
  const [loading, setLoading] = useState(false)

  const handleGymSwitch = async (gymId: string) => {
    setSelectedGymId(gymId)
    setLoading(true)
    try {
      await setImpersonatedGym(gymId || null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171B28]">SuperAdmin Control Panel</h1>
          <p className="text-xs text-[#8B8E98] mt-1">Manage tenant gyms, subscriptions, and switch tenant view (impersonation).</p>
        </div>

        {/* Gym Switcher (Impersonation) */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E1E1E4] shadow-sm">
          <Eye className="h-4 w-4 text-[#007A35] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#171B28]">Impersonate Gym:</span>
          <select
            value={selectedGymId}
            onChange={(e) => handleGymSwitch(e.target.value)}
            disabled={loading}
            className="px-3 py-1 bg-[#F8F9FA] border border-[#E1E1E4] rounded-lg text-xs font-medium text-[#171B28] focus:outline-none focus:border-[#007A35]"
          >
            <option value="">Default (None)</option>
            {initialData.gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E1E1E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#007A35]" />
            <h2 className="text-sm font-bold text-[#171B28]">Registered Gym Tenants ({initialData.gyms.length})</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171B28]">
            <thead className="bg-[#F8F9FA] border-b border-[#E1E1E4] font-semibold text-[#8B8E98] uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Gym Name</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E1E4]">
              {initialData.gyms.map((gym) => {
                const isImpersonated = initialData.activeImpersonatedGymId === gym.id

                return (
                  <tr key={gym.id} className={isImpersonated ? "bg-emerald-50/60 font-semibold" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#171B28]">{gym.name}</p>
                      <p className="text-[10px] text-[#8B8E98]">{gym.address || "No address"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{gym.ownerName}</p>
                      <p className="text-[10px] text-[#8B8E98]">{gym.ownerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {gym.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{gym.totalMembers}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#007A35]">
                        {gym.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleGymSwitch(isImpersonated ? "" : gym.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          isImpersonated
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-[#007A35] text-white hover:bg-[#00632B]"
                        }`}
                      >
                        {isImpersonated ? "Stop Impersonating" : "View Dashboard"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
