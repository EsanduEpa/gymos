export default function MemberProgressLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-7 w-60 rounded-md bg-gray-200" />
          <div className="h-4 w-80 rounded-md bg-gray-200" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-lg bg-gray-200" />
          <div className="h-9 w-28 rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-7 w-28 rounded bg-gray-200" />
            <div className="h-3 w-32 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
        <div className="h-5 w-44 rounded bg-gray-200" />
        <div className="h-64 w-full rounded-lg bg-gray-100" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="h-5 w-36 rounded bg-gray-200" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-full rounded bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

