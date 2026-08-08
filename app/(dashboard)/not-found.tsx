import Link from "next/link"
import { FileQuestion, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-[#E1E1E4] shadow-sm my-6">
      <div className="h-12 w-12 rounded-full bg-emerald-100 text-[#007A35] flex items-center justify-center mb-4">
        <FileQuestion className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-bold text-[#171B28]">Page Not Found</h2>
      <p className="text-xs text-[#8B8E98] max-w-md mt-1 mb-6">
        The requested resource or page could not be located in GymOS.
      </p>

      <Link
        href="/owner"
        className="flex items-center gap-2 px-4 py-2 bg-[#007A35] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#00632B] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Return to Dashboard
      </Link>
    </div>
  )
}
