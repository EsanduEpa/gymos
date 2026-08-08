import React from "react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: string
  trendPositive?: boolean
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendPositive = true,
}: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-extrabold text-[#171B28] mt-1">{value}</p>
        {trend && (
          <p
            className={`text-xs mt-1 font-medium ${
              trendPositive ? "text-[#007A35]" : "text-[#D71920]"
            }`}
          >
            {trend}
          </p>
        )}
      </div>
      {icon && (
        <div className="h-10 w-10 rounded-lg bg-[#007A35]/10 text-[#007A35] flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
    </div>
  )
}
