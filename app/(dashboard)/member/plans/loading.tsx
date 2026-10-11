export default function MemberPlansLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded-md bg-gray-200" />
          <div className="h-4 w-96 rounded-md bg-gray-200" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-gray-200" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E1E1E4] gap-6 pb-2">
        <div className="h-6 w-36 rounded bg-gray-200" />
        <div className="h-6 w-32 rounded bg-gray-200" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl border border-gray-200 bg-white p-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-100" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-gray-200 pb-4 space-y-2">
              <div className="h-6 w-48 rounded bg-gray-200" />
              <div className="h-4 w-72 rounded bg-gray-100" />
            </div>

            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

