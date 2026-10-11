import type { SessionPackInfo } from "@/app/actions/member-dashboard"

function fmt(date: Date | null): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function SessionPackCard({ pack }: { pack: SessionPackInfo }) {
  const { packId, totalSessions, remainingSessions, purchaseDate, expiryDate, status } = pack
  const hasPack = packId !== null
  const sessionsUsed = totalSessions - remainingSessions
  const progressPct = hasPack && totalSessions > 0 ? Math.round((sessionsUsed / totalSessions) * 100) : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">PT Session Pack</p>
          <h2 className="mt-1 text-xl font-bold text-[#171B28]">
            {hasPack ? `${remainingSessions} Sessions Left` : "No Active Pack"}
          </h2>
        </div>
        {hasPack && (
          <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
            {status}
          </span>
        )}
      </div>

      {hasPack ? (
        <>
          {/* Progress bar */}
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>{sessionsUsed} used</span>
            <span>{remainingSessions} remaining</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#007A35] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Sessions</dt>
              <dd className="font-medium text-gray-900">{totalSessions}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Purchased</dt>
              <dd className="font-medium text-gray-900">{fmt(purchaseDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Pack Expires</dt>
              <dd className="font-medium text-gray-900">{fmt(expiryDate)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="text-sm text-gray-500">
          You don't have an active PT session pack. Book with a trainer to get started.
        </p>
      )}

      {(!hasPack || remainingSessions <= 2) && (
        <a
          href="/member/trainers"
          className="mt-5 block w-full rounded-lg bg-[#007A35] py-2 text-center text-sm font-semibold text-white hover:bg-[#006128] transition-colors"
        >
          {hasPack ? "Top Up Sessions" : "Find a Trainer"}
        </a>
      )}
    </div>
  )
}

