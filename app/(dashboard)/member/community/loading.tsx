export default function MemberCommunityLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2 mb-6">
        <div className="h-7 w-60 rounded-md bg-gray-200" />
        <div className="h-4 w-96 rounded-md bg-gray-200" />
      </div>

      {/* Gamification Profile Banner */}
      <div className="h-48 w-full rounded-2xl bg-gray-200" />

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-gray-200" />
            <div className="h-4 w-28 mx-auto rounded bg-gray-200" />
            <div className="h-3 w-36 mx-auto rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="h-5 w-44 rounded bg-gray-200" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-full rounded bg-gray-100" />
        ))}
      </div>
    </div>
  )
}
