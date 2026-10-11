export default function MemberDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded-md bg-gray-200" />
          <div className="h-4 w-40 rounded-md bg-gray-200" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-gray-200" />
      </div>

      {/* Primary cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-6 w-44 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <div className="h-5 w-36 rounded bg-gray-200" />
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-12 w-full rounded-md bg-gray-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

