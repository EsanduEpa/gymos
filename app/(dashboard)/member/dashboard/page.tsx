import { getMemberDashboardData } from "@/app/actions/member-dashboard"
import { MembershipCard } from "./_components/MembershipCard"
import { SessionPackCard } from "./_components/SessionPackCard"
import { UpcomingSessionsCard } from "./_components/UpcomingSessionsCard"
import { RecentSessionsCard } from "./_components/RecentSessionsCard"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function MemberDashboardPage() {
  const data = await getMemberDashboardData()
  if (!data) redirect("/login")

  const { fullName, membership, sessionPack, upcomingSessions, recentSessions } = data

  // Time-aware greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const firstName = fullName.split(" ")[0]

  const isExpiringSoon =
    membership.daysUntilExpiry !== null &&
    membership.daysUntilExpiry > 0 &&
    membership.daysUntilExpiry <= 30

  const isPackLow = sessionPack.packId !== null && sessionPack.remainingSessions <= 2

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171B28]">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here's your fitness overview.</p>
        </div>
        <a
          href="/member/trainers"
          className="shrink-0 rounded-lg bg-[#007A35] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#006128] transition-colors"
        >
          Book a Session
        </a>
      </div>

      {/* ── Alerts ───────────────────────────────────────────────────────── */}
      {isExpiringSoon && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="mt-0.5 shrink-0">⚠️</span>
          <p>
            Your <strong>{membership.planName}</strong> membership expires in{" "}
            <strong>{membership.daysUntilExpiry} day{membership.daysUntilExpiry !== 1 ? "s" : ""}</strong>. Renew to keep your access.
          </p>
        </div>
      )}

      {isPackLow && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <span className="mt-0.5 shrink-0">🔔</span>
          <p>
            Only <strong>{sessionPack.remainingSessions} PT session{sessionPack.remainingSessions !== 1 ? "s" : ""} remaining</strong> in your pack. Top up to continue training.
          </p>
        </div>
      )}

      {/* ── Primary Cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">
        <MembershipCard membership={membership} />
        <SessionPackCard pack={sessionPack} />
      </div>

      {/* ── Secondary Cards ───────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <UpcomingSessionsCard sessions={upcomingSessions} />
        <RecentSessionsCard sessions={recentSessions} />
      </div>
    </div>
  )
}

