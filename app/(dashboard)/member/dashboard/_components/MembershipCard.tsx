import type { MembershipInfo } from "@/app/actions/member-dashboard"

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-yellow-100 text-yellow-800",
  INACTIVE: "bg-gray-100 text-gray-600",
  NONE: "bg-gray-100 text-gray-500",
}

function fmt(date: Date | null): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function MembershipCard({ membership }: { membership: MembershipInfo }) {
  const { planName, startDate, endDate, status, daysUntilExpiry } = membership
  const statusStr = status as string

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Membership</p>
          <h2 className="mt-1 text-xl font-bold text-[#171B28]">{planName}</h2>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[statusStr] ?? "bg-gray-100 text-gray-600"}`}>
          {statusStr}
        </span>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Start Date</dt>
          <dd className="font-medium text-gray-900">{fmt(startDate)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Expiry Date</dt>
          <dd className="font-medium text-gray-900">{fmt(endDate)}</dd>
        </div>
        {daysUntilExpiry !== null && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Days Remaining</dt>
            <dd className={`font-semibold ${
              daysUntilExpiry <= 0 ? "text-red-600" : daysUntilExpiry <= 7 ? "text-red-500" : daysUntilExpiry <= 30 ? "text-amber-600" : "text-green-600"
            }`}>
              {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : "Expired"}
            </dd>
          </div>
        )}
      </dl>

      {(statusStr === "EXPIRED" || statusStr === "NONE" || statusStr === "INACTIVE") && (
        <a
          href="/member/trainers"
          className="mt-5 block w-full rounded-lg bg-[#007A35] py-2 text-center text-sm font-semibold text-white hover:bg-[#006128] transition-colors"
        >
          Renew Membership
        </a>
      )}
    </div>
  )
}

