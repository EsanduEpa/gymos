"use client"

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface AnalyticsClientProps {
  data: {
    trainerUtilisationData: any[]
    peakHoursData: any[]
    memberGrowthData: any[]
  }
}

export default function AnalyticsClient({ data }: AnalyticsClientProps) {
  const { trainerUtilisationData, peakHoursData, memberGrowthData } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171B28]">Operational Analytics</h1>
        <p className="text-xs text-[#8B8E98] mt-1">Insights on trainer utilisation, member peak hours, and signup growth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Trainer Utilisation Report */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm">
          <h2 className="text-sm font-bold text-[#171B28] mb-1">Trainer Utilisation (Hours)</h2>
          <p className="text-xs text-[#8B8E98] mb-4">Scheduled PT hours vs. Idle shift hours over the last 30 days.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainerUtilisationData}>
                <XAxis dataKey="name" stroke="#8B8E98" fontSize={11} tickLine={false} />
                <YAxis stroke="#8B8E98" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="scheduled" name="Scheduled Hours" fill="#007A35" radius={[4, 4, 0, 0]} />
                <Bar dataKey="idle" name="Idle Hours" fill="#E1E1E4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Member Attendance Peak Hours */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm">
          <h2 className="text-sm font-bold text-[#171B28] mb-1">Member Peak Attendance Hours</h2>
          <p className="text-xs text-[#8B8E98] mb-4">Average session bookings by hour over the last 30 days.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <XAxis dataKey="hour" stroke="#8B8E98" fontSize={11} tickLine={false} />
                <YAxis stroke="#8B8E98" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="avgSessions" name="Avg Sessions" fill="#007A35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. New Member Growth */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm">
        <h2 className="text-sm font-bold text-[#171B28] mb-1">New Member Signups Trend</h2>
        <p className="text-xs text-[#8B8E98] mb-4">Monthly growth in new member registrations over the last 6 months.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={memberGrowthData}>
              <XAxis dataKey="month" stroke="#8B8E98" fontSize={11} tickLine={false} />
              <YAxis stroke="#8B8E98" fontSize={11} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="newMembers" name="New Members" stroke="#007A35" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
