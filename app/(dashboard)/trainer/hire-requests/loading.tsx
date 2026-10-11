export default function HireRequestsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2 mb-6">
        <div className="h-7 w-56 rounded-md bg-gray-200" />
        <div className="h-4 w-96 rounded-md bg-gray-200" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="h-3 w-28 rounded bg-gray-200" />
            <div className="h-7 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
              <div className="space-y-2 w-48">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
