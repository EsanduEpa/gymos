import type { RecentSession } from "@/app/actions/member-dashboard"

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "text-green-700 bg-green-50",
  MISSED: "text-red-700 bg-red-50",
  CANCELLED: "text-gray-600 bg-gray-100",
}

const SESSION_TYPE_LABEL: Record<string, string> = {
  IN_PERSON: "In Person",
  VIRTUAL: "Virtual",
  INTRODUCTORY: "Intro Session",
}

function fmtDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function RecentSessionsCard({ sessions }: { sessions: RecentSession[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#171B28]">Recent Sessions</h2>
        <a href="/member/sessions" className="text-xs font-medium text-[#007A35] hover:underline">
          View all →
        </a>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-gray-500">No past sessions yet. Book your first session!</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {SESSION_TYPE_LABEL[s.sessionType] ?? s.sessionType} with {s.trainerName}
                </p>
                <p className="text-xs text-gray-500">{fmtDate(s.scheduledAt)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                {s.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

