interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toUpperCase()

  let style = "bg-gray-100 text-gray-700 border-gray-200"
  if (normalized === "ACTIVE") {
    style = "bg-[#DDF5E7] text-[#007A35] border-[#BBEBD0]"
  } else if (normalized === "EXPIRED") {
    style = "bg-[#FDE4E4] text-[#D71920] border-[#F8B4B4]"
  } else if (normalized === "SUSPENDED" || normalized === "INACTIVE") {
    style = "bg-[#FFF0E0] text-[#F97316] border-[#FFD8B3]"
  } else if (normalized === "PENDING") {
    style = "bg-blue-50 text-blue-700 border-blue-200"
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      {normalized}
    </span>
  )
}
