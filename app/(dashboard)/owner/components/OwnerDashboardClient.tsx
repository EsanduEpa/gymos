"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Dumbbell, Calendar, DollarSign, AlertTriangle, RefreshCw, UserCheck } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface OwnerDashboardClientProps {
  initialData: any
}

export default function OwnerDashboardClient({ initialData }: OwnerDashboardClientProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30000)
    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const { stats, todaySessions, hourlyRevenueData, alerts, trainerPerformance } = data

  return (
    <div className="space-y-6">
      {/* Header with Manual Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171B28]">Live Gym Operations</h1>
          <p className="text-xs text-[#8B8E98] mt-1">Real-time status of members, sessions, and daily revenue.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E1E1E4] text-xs font-semibold text-[#171B28] rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#8B8E98] ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Live Status
        </button>
      </div>

      {/* 1. Live Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">Members in Gym</p>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">{stats.membersInGymCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">Active Sessions</p>
              {stats.activeSessionsCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007A35] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007A35]"></span>
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">{stats.activeSessionsCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">Today's Revenue</p>
            <p className="text-2xl font-extrabold text-[#007A35] mt-1">${stats.todayRevenue.toFixed(2)}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">Trainers On Floor</p>
            <p className="text-2xl font-extrabold text-[#171B28] mt-1">{stats.trainersOnFloorCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center">
            <Dumbbell className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Area Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Today Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm">
          <h2 className="text-sm font-bold text-[#171B28] mb-1">Today's Revenue Stream</h2>
          <p className="text-xs text-[#8B8E98] mb-4">Accumulated hourly earnings throughout the day.</p>

          <div className="h-64 w-full">
            {hourlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007A35" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#007A35" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#8B8E98" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8B8E98" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Accumulated Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#007A35" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8B8E98]">No revenue transactions recorded today.</div>
            )}
          </div>
        </div>

        {/* Operational Alerts (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-[#171B28]">Action Needed & Alerts</h2>
            </div>

            <div className="space-y-3">
              {alerts.lowPacks.length === 0 && alerts.noShowsToday.length === 0 ? (
                <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                  All systems normal. No low session packs or no-shows today!
                </div>
              ) : (
                <>
                  {alerts.lowPacks.map((pack: any) => (
                    <div key={pack.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                      <p className="font-semibold text-amber-900">{pack.user?.fullName}</p>
                      <p className="text-amber-700 mt-0.5">Only {pack.remainingSessions} sessions left in active pack.</p>
                    </div>
                  ))}

                  {alerts.noShowsToday.map((sess: any) => (
                    <div key={sess.id} className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs">
                      <p className="font-semibold text-red-900">No-Show Marked</p>
                      <p className="text-red-700 mt-0.5">
                        {sess.client?.fullName} missed session with {sess.trainer?.fullName}.
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Sessions Table */}
      <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E1E1E4]">
          <h2 className="text-sm font-bold text-[#171B28]">Today's Scheduled PT Sessions</h2>
          <p className="text-xs text-[#8B8E98] mt-0.5">All sessions assigned across gym trainers for today.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171B28]">
            <thead className="bg-[#F8F9FA] border-b border-[#E1E1E4] font-semibold text-[#8B8E98] uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Trainer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E1E4]">
              {todaySessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8B8E98]">
                    No PT sessions scheduled for today.
                  </td>
                </tr>
              ) : (
                todaySessions.map((session: any) => {
                  const isActive = session.status === "ACTIVE"
                  const formattedTime = new Date(session.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

                  return (
                    <tr key={session.id} className={isActive ? "bg-emerald-50/50 border-l-4 border-l-[#007A35]" : "hover:bg-gray-50"}>
                      <td className="px-4 py-3 font-semibold">{formattedTime}</td>
                      <td className="px-4 py-3 font-medium">{session.client?.fullName}</td>
                      <td className="px-4 py-3 text-[#8B8E98]">{session.trainer?.fullName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? "bg-[#007A35]/15 text-[#007A35]"
                              : session.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : session.status === "MISSED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">${session.fee.toFixed(2)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainer Performance Cards */}
      <div>
        <h2 className="text-sm font-bold text-[#171B28] mb-3">Trainer Floor Status & Roster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainerPerformance.map((trainer: any) => (
            <div key={trainer.id} className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-[#007A35] font-bold flex items-center justify-center text-xs">
                      {trainer.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171B28]">{trainer.fullName}</p>
                      <span className="text-[10px] text-[#8B8E98]">{trainer.trainerLevel || "LEVEL_1"}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      trainer.status === "In session"
                        ? "bg-[#007A35] text-white animate-pulse"
                        : trainer.status === "On floor"
                        ? "bg-emerald-100 text-[#007A35]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {trainer.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#E1E1E4] text-center">
                  <div>
                    <p className="text-[10px] text-[#8B8E98]">Today</p>
                    <p className="text-xs font-bold text-[#171B28]">{trainer.sessionsToday}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B8E98]">This Week</p>
                    <p className="text-xs font-bold text-[#171B28]">{trainer.sessionsWeek}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B8E98]">Est. Rev</p>
                    <p className="text-xs font-bold text-[#007A35]">${trainer.revenueWeek.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
