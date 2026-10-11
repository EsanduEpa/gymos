import type { UpcomingSession } from "@/app/actions/member-dashboard"

const STATUS_DOT: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  PENDING_CONFIRMATION: "bg-amber-400",
  ACTIVE: "bg-green-500",
}

const SESSION_TYPE_LABEL: Record<string, string> = {
  IN_PERSON: "In Person",
  VIRTUAL: "Virtual",
  INTRODUCTORY: "Intro Session",
}

function fmtDateTime(date: Date): string {
  return new Date(date).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function UpcomingSessionsCard({ sessions }: { sessions: UpcomingSession[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#171B28]">Upcoming Sessions</h2>
        <a href="/member/sessions" className="text-xs font-medium text-[#007A35] hover:underline">
          View all →
        </a>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming sessions scheduled.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[s.status] ?? "bg-gray-400"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {SESSION_TYPE_LABEL[s.sessionType] ?? s.sessionType} with {s.trainerName}
                </p>
                <p className="text-xs text-gray-500">{fmtDateTime(s.scheduledAt)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                {s.status.replace(/_/g, " ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

