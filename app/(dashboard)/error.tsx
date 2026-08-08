"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-[#E1E1E4] shadow-sm my-6">
      <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-bold text-[#171B28]">Something went wrong!</h2>
      <p className="text-xs text-[#8B8E98] max-w-md mt-1 mb-6">
        {error.message || "An unexpected application error occurred. Please try reloading the view."}
      </p>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-4 py-2 bg-[#007A35] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#00632B] transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Try Again
      </button>
    </div>
  )
}
