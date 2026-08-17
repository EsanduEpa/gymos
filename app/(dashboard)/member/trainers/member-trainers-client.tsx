"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { Search, Clock, Star, CalendarPlus } from "lucide-react"

interface MemberTrainer {
  id: string
  fullName: string
  trainerLevel: string | null
  specialisations: string[] | string | null
  bio: string | null
  yearsExperience: number | null
  shiftStart: string | null
  shiftEnd: string | null
  ratingAvg: number | null
}

interface MemberTrainersClientProps {
  trainers: MemberTrainer[]
}

export function MemberTrainersClient({ trainers }: MemberTrainersClientProps) {
  const [search, setSearch] = useState("")

  const filteredTrainers = trainers.filter((t) =>
    t.fullName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Find a Personal Trainer"
        description="Browse trainers at your gym and request a session directly — they'll confirm before it's booked."
      />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
          <input
            type="text"
            placeholder="Search trainers by name..."
            aria-label="Search trainers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrainers.map((t) => {
          let specs: string[] = []
          if (Array.isArray(t.specialisations)) {
            specs = t.specialisations
          } else if (typeof t.specialisations === "string") {
            try {
              specs = JSON.parse(t.specialisations)
            } catch {}
          }

          return (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm flex flex-col gap-3 hover:border-[#007A35]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#007A35]/10 border border-[#007A35]/20 flex items-center justify-center text-[#007A35] font-extrabold text-base shrink-0">
                  {t.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#171B28] truncate">{t.fullName}</h3>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.trainerLevel === "LEVEL_2"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t.trainerLevel === "LEVEL_2" ? "Level 2 Senior Trainer" : "Level 1 Trainer"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-[#8B8E98]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {t.shiftStart || "08:00"} - {t.shiftEnd || "17:00"}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-[#F97316]" /> {t.ratingAvg || "5.0"} rating
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {specs.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#F5F4F5] text-[#4A4D58] rounded text-[10px] font-medium">
                    {s}
                  </span>
                ))}
                {specs.length === 0 && <span className="text-[10px] text-[#8B8E98]">No specialisations listed</span>}
              </div>

              <p className="text-xs text-[#4A4D58] leading-relaxed line-clamp-3">
                {t.bio || "No biography provided."}
              </p>

              <Link
                href={`/member/trainers/${t.id}/book`}
                className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> Request Session
              </Link>
            </div>
          )
        })}

        {filteredTrainers.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-[#E1E1E4] p-12 text-center text-[#8B8E98] text-xs">
            No trainers found.
          </div>
        )}
      </div>
    </div>
  )
}
