"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { toggleLeaderboardOptIn, recordCheckInDemo } from "@/app/actions/gamification"
import {
  Trophy,
  Flame,
  Award,
  Crown,
  Medal,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  QrCode,
  ShieldCheck,
} from "lucide-react"

interface BadgeShowcaseItem {
  type: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt: string | Date | null
}

interface LeaderboardParticipant {
  id: string
  rank: number
  fullName: string
  photo: string | null
  currentStreak: number
  longestStreak: number
  totalVisits: number
  badgeCount: number
  badges: { id: string; icon: string; name: string }[]
}

interface CurrentMemberInfo {
  id: string
  fullName: string
  photo: string | null
  leaderboardOptIn: boolean
  rank: number | null
  currentStreak: number
  longestStreak: number
  totalVisits: number
  badgeCount: number
  allBadgesShowcase: BadgeShowcaseItem[]
}

interface CommunityClientProps {
  leaderboard: LeaderboardParticipant[]
  currentMember: CurrentMemberInfo
}

export function CommunityClient({ leaderboard, currentMember }: CommunityClientProps) {
  const [optIn, setOptIn] = useState(currentMember.leaderboardOptIn)
  const [optInLoading, setOptInLoading] = useState(false)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleToggleOptIn = async () => {
    setOptInLoading(true)
    const res = await toggleLeaderboardOptIn()
    setOptInLoading(false)
    if (res.success && res.optIn !== undefined) {
      setOptIn(res.optIn)
      setToastMessage(res.optIn ? "You are now visible on the leaderboard!" : "You have been hidden from the public leaderboard.")
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  const handleDemoCheckIn = async () => {
    setCheckInLoading(true)
    const res = await recordCheckInDemo()
    setCheckInLoading(false)
    if (res.success && res.result) {
      const newBadgesCount = res.result.newlyAwardedBadges.length
      if (newBadgesCount > 0) {
        setToastMessage(`Check-in recorded! 🎉 Unlocked ${newBadgesCount} new milestone badge(s)!`)
      } else {
        setToastMessage(`Check-in recorded! Current streak: ${res.result.currentStreak} day(s) 🔥`)
      }
      setTimeout(() => setToastMessage(null), 5000)
    }
  }

  const top3 = leaderboard.slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community & Streaks"
        description="Celebrate attendance streaks, unlock milestone achievements, and compete with fellow gym members."
        action={
          <button
            onClick={handleDemoCheckIn}
            disabled={checkInLoading}
            className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            <QrCode className="h-4 w-4" />
            {checkInLoading ? "Recording Scan..." : "Simulate Check-in"}
          </button>
        }
      />

      {toastMessage && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-sm flex items-center gap-2 shadow-xs transition-all">
          <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Current Member Stats Card */}
      <div className="bg-gradient-to-r from-[#171B28] to-[#252C3F] text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8B8E98]">
              Your Gamification Profile
            </span>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>{currentMember.fullName}</span>
              {currentMember.rank && (
                <span className="text-xs bg-[#007A35] text-white px-2.5 py-0.5 rounded-full font-bold">
                  Rank #{currentMember.rank}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-300">
              Keep checking in consistently to protect your streak and rise on the leaderboard.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleOptIn}
              disabled={optInLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors ${
                optIn
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  : "bg-red-500/20 text-red-200 border-red-500/30 hover:bg-red-500/30"
              }`}
            >
              {optIn ? <Eye className="h-3.5 w-3.5 text-green-400" /> : <EyeOff className="h-3.5 w-3.5 text-red-400" />}
              <span>{optIn ? "Leaderboard: Public" : "Leaderboard: Hidden"}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <span className="text-xs text-gray-400 block">Current Streak</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1 flex items-center gap-1">
              <Flame className="h-5 w-5 fill-amber-400" />
              <span>{currentMember.currentStreak} <span className="text-sm font-normal text-gray-300">days</span></span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-400 block">Longest Record</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {currentMember.longestStreak} <span className="text-sm font-normal text-gray-300">days</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-400 block">Total Check-ins</span>
            <div className="text-2xl font-extrabold text-[#45B472] mt-1">
              {currentMember.totalVisits} <span className="text-sm font-normal text-gray-300">visits</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-400 block">Badges Unlocked</span>
            <div className="text-2xl font-extrabold text-indigo-300 mt-1 flex items-center gap-1">
              <Award className="h-5 w-5" />
              <span>{currentMember.badgeCount} / {currentMember.allBadgesShowcase.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (if at least 2 participants) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map((participant, idx) => {
            const isFirst = idx === 0
            const isSecond = idx === 1
            const isThird = idx === 2

            return (
              <div
                key={participant.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm text-center relative overflow-hidden flex flex-col justify-between ${
                  isFirst
                    ? "border-amber-300 bg-gradient-to-b from-amber-50/40 to-white"
                    : isSecond
                    ? "border-gray-300"
                    : "border-orange-200"
                }`}
              >
                {/* Crown/Medal banner */}
                <div className="flex justify-center mb-3">
                  {isFirst && (
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
                      <Crown className="h-5 w-5" />
                    </div>
                  )}
                  {isSecond && (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-xs">
                      <Medal className="h-5 w-5" />
                    </div>
                  )}
                  {isThird && (
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 shadow-xs">
                      <Trophy className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="font-extrabold text-base text-[#171B28]">
                  {participant.fullName}
                  {participant.id === currentMember.id && (
                    <span className="ml-1 text-xs text-[#007A35] font-semibold">(You)</span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                  <span className="flex items-center gap-1 font-bold text-amber-600">
                    <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {participant.currentStreak}d Streak
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 font-medium">
                    {participant.badgeCount} Badges
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] font-semibold text-gray-500 uppercase">
                  Rank #{participant.rank}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E1E1E4] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#171B28]">Gym Attendance Leaderboard</h3>
            <p className="text-xs text-[#8B8E98] mt-0.5">
              Rankings updated with every biometric check-in.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {leaderboard.length} Active Competitors
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#8B8E98]">
            No members currently opted into the leaderboard. Check in to claim the #1 spot!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#171B28]">
              <thead className="bg-[#F8F9FA] text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider border-b border-[#E1E1E4]">
                <tr>
                  <th className="px-5 py-3.5 w-16">Rank</th>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Current Streak</th>
                  <th className="px-5 py-3.5">Best Streak</th>
                  <th className="px-5 py-3.5">Total Visits</th>
                  <th className="px-5 py-3.5">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E1E4]">
                {leaderboard.map((m) => {
                  const isCurrent = m.id === currentMember.id

                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors ${
                        isCurrent ? "bg-[#F4F9F5] font-semibold" : "hover:bg-gray-50/70"
                      }`}
                    >
                      <td className="px-5 py-4 font-bold">
                        {m.rank === 1 && <span className="text-amber-500">🥇 1</span>}
                        {m.rank === 2 && <span className="text-slate-400">🥈 2</span>}
                        {m.rank === 3 && <span className="text-amber-700">🥉 3</span>}
                        {m.rank > 3 && <span className="text-gray-500">#{m.rank}</span>}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs shrink-0">
                            {m.fullName.charAt(0)}
                          </div>
                          <div>
                            <span>{m.fullName}</span>
                            {isCurrent && (
                              <span className="ml-2 text-[10px] bg-[#007A35] text-white px-2 py-0.5 rounded-full font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs">
                          <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {m.currentStreak} days
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {m.longestStreak} days
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {m.totalVisits} visits
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {m.badges.slice(0, 3).map((b) => (
                            <span key={b.id} title={b.name} className="text-base cursor-default">
                              {b.icon}
                            </span>
                          ))}
                          {m.badgeCount > 3 && (
                            <span className="text-xs text-gray-400 font-medium">+{m.badgeCount - 3}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Milestone Badges Showcase */}
      <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-[#171B28]">Milestone Badges</h3>
          <p className="text-xs text-[#8B8E98] mt-0.5">
            Earn permanent achievement badges as you hit attendance records and maintain your routine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {currentMember.allBadgesShowcase.map((badge) => (
            <div
              key={badge.type}
              className={`p-4 rounded-xl border transition-all ${
                badge.earned
                  ? "bg-[#FDFEFE] border-green-200 shadow-xs"
                  : "bg-gray-50/70 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{badge.icon}</span>
                {badge.earned ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-[#171B28] mt-3">{badge.name}</h4>
              <p className="text-xs text-[#8B8E98] mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
