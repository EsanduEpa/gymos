"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { logBodyMetric, logProgressPhoto, deleteBodyMetric, deleteProgressPhoto } from "@/app/actions/progress"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import {
  Activity,
  Plus,
  TrendingDown,
  TrendingUp,
  Camera,
  Trash2,
  Calendar,
  X,
  AlertCircle,
  LineChart as LineChartIcon,
} from "lucide-react"

interface BodyMetric {
  id: string
  dateRecorded: string | Date
  weight: number | null
  bodyFat: number | null
  muscleMass: number | null
  notes: string | null
}

interface ProgressPhoto {
  id: string
  url: string
  dateTaken: string | Date
  notes: string | null
}

interface MemberProgressClientProps {
  metrics: BodyMetric[]
  photos: ProgressPhoto[]
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatShortDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

export function MemberProgressClient({ metrics: initialMetrics, photos: initialPhotos }: MemberProgressClientProps) {
  const [metrics, setMetrics] = useState<BodyMetric[]>(initialMetrics)
  const [photos, setPhotos] = useState<ProgressPhoto[]>(initialPhotos)

  // Chart view metric
  const [chartMetric, setChartMetric] = useState<"weight" | "bodyFat" | "muscleMass">("weight")

  // Forms modal state
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

  // Metric form inputs
  const [weight, setWeight] = useState("")
  const [bodyFat, setBodyFat] = useState("")
  const [muscleMass, setMuscleMass] = useState("")
  const [notes, setNotes] = useState("")
  const [metricError, setMetricError] = useState<string | null>(null)
  const [metricLoading, setMetricLoading] = useState(false)

  // Photo form inputs
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoNotes, setPhotoNotes] = useState("")
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)

  // Active view tab
  const [activeTab, setActiveTab] = useState<"charts" | "history" | "photos">("charts")

  // Calculated Stats
  const latestMetric = metrics[0] || null
  const previousMetric = metrics[1] || null

  const weightDiff =
    latestMetric?.weight && previousMetric?.weight
      ? Number((latestMetric.weight - previousMetric.weight).toFixed(1))
      : null

  const bodyFatDiff =
    latestMetric?.bodyFat && previousMetric?.bodyFat
      ? Number((latestMetric.bodyFat - previousMetric.bodyFat).toFixed(1))
      : null

  // Chart data: chronological (oldest to newest)
  const chartData = useMemo(() => {
    return [...metrics]
      .filter((m) => m[chartMetric] !== null)
      .reverse()
      .map((m) => ({
        date: formatShortDate(m.dateRecorded),
        fullDate: formatDate(m.dateRecorded),
        val: m[chartMetric],
      }))
  }, [metrics, chartMetric])

  const handleMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMetricError(null)
    setMetricLoading(true)

    const res = await logBodyMetric({
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
      notes,
    })

    setMetricLoading(false)
    if (res.error) {
      setMetricError(res.error)
      return
    }

    if (res.metricId) {
      setMetrics([
        {
          id: res.metricId,
          dateRecorded: new Date(),
          weight: weight ? parseFloat(weight) : null,
          bodyFat: bodyFat ? parseFloat(bodyFat) : null,
          muscleMass: muscleMass ? parseFloat(muscleMass) : null,
          notes: notes || null,
        },
        ...metrics,
      ])
      setWeight("")
      setBodyFat("")
      setMuscleMass("")
      setNotes("")
      setIsMetricModalOpen(false)
    }
  }

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhotoError(null)
    setPhotoLoading(true)

    const res = await logProgressPhoto({
      url: photoUrl,
      notes: photoNotes,
    })

    setPhotoLoading(false)
    if (res.error) {
      setPhotoError(res.error)
      return
    }

    if (res.photoId) {
      setPhotos([
        {
          id: res.photoId,
          url: photoUrl,
          dateTaken: new Date(),
          notes: photoNotes || null,
        },
        ...photos,
      ])
      setPhotoUrl("")
      setPhotoNotes("")
      setIsPhotoModalOpen(false)
    }
  }

  const handleDeleteMetric = async (id: string) => {
    if (!confirm("Are you sure you want to delete this metric entry?")) return
    await deleteBodyMetric(id)
    setMetrics(metrics.filter((m) => m.id !== id))
  }

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return
    await deleteProgressPhoto(id)
    setPhotos(photos.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Body Progress & Metrics"
        description="Record and visualize your physical transformation with body metrics and milestone photos."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-3.5 py-2 bg-white border border-[#E1E1E4] hover:bg-gray-50 text-[#171B28] text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Camera className="h-4 w-4" />
              Add Photo
            </button>
            <button
              onClick={() => setIsMetricModalOpen(true)}
              className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Log Metrics
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-[#8B8E98]">
            <span>Current Weight</span>
            {weightDiff !== null && (
              <span
                className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                  weightDiff < 0 ? "text-green-600" : "text-amber-600"
                }`}
              >
                {weightDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {Math.abs(weightDiff)} kg
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold text-[#171B28]">
            {latestMetric?.weight ? `${latestMetric.weight} kg` : "—"}
          </div>
          <p className="text-[11px] text-[#8B8E98] mt-1">
            {latestMetric?.dateRecorded ? `Logged ${formatDate(latestMetric.dateRecorded)}` : "No entries yet"}
          </p>
        </div>

        {/* Body Fat */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-[#8B8E98]">
            <span>Body Fat</span>
            {bodyFatDiff !== null && (
              <span
                className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                  bodyFatDiff < 0 ? "text-green-600" : "text-amber-600"
                }`}
              >
                {bodyFatDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {Math.abs(bodyFatDiff)}%
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold text-[#171B28]">
            {latestMetric?.bodyFat ? `${latestMetric.bodyFat}%` : "—"}
          </div>
          <p className="text-[11px] text-[#8B8E98] mt-1">
            {previousMetric?.bodyFat ? `Prev: ${previousMetric.bodyFat}%` : "Track reduction over time"}
          </p>
        </div>

        {/* Muscle Mass */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-xs">
          <div className="text-xs font-medium text-[#8B8E98]">Muscle Mass</div>
          <div className="mt-2 text-2xl font-bold text-[#007A35]">
            {latestMetric?.muscleMass ? `${latestMetric.muscleMass} kg` : "—"}
          </div>
          <p className="text-[11px] text-[#8B8E98] mt-1">Lean tissue estimate</p>
        </div>

        {/* Photos Count */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E1E4] shadow-xs">
          <div className="text-xs font-medium text-[#8B8E98]">Progress Photos</div>
          <div className="mt-2 text-2xl font-bold text-[#171B28]">{photos.length}</div>
          <p className="text-[11px] text-[#8B8E98] mt-1">Visual milestones saved</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E1E1E4] gap-6">
        <button
          onClick={() => setActiveTab("charts")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors relative ${
            activeTab === "charts"
              ? "text-[#007A35] border-b-2 border-[#007A35]"
              : "text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <LineChartIcon className="h-4 w-4" />
          <span>Progress Chart</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors relative ${
            activeTab === "history"
              ? "text-[#007A35] border-b-2 border-[#007A35]"
              : "text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Metric History ({metrics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("photos")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors relative ${
            activeTab === "photos"
              ? "text-[#007A35] border-b-2 border-[#007A35]"
              : "text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Photo Gallery ({photos.length})</span>
        </button>
      </div>

      {/* RECHARTS CHART TAB */}
      {activeTab === "charts" && (
        <div className="bg-white p-6 rounded-xl border border-[#E1E1E4] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#171B28]">
                {chartMetric === "weight" && "Body Weight History"}
                {chartMetric === "bodyFat" && "Body Fat % Trend"}
                {chartMetric === "muscleMass" && "Muscle Mass Progression"}
              </h3>
              <p className="text-xs text-[#8B8E98] mt-0.5">
                Visual trend tracked across your recorded milestones.
              </p>
            </div>

            {/* Metric Selector Pills */}
            <div className="flex items-center gap-1.5 bg-[#F4F5F7] p-1 rounded-lg">
              <button
                onClick={() => setChartMetric("weight")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  chartMetric === "weight"
                    ? "bg-white text-[#171B28] shadow-xs"
                    : "text-[#8B8E98] hover:text-[#171B28]"
                }`}
              >
                Weight (kg)
              </button>
              <button
                onClick={() => setChartMetric("bodyFat")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  chartMetric === "bodyFat"
                    ? "bg-white text-[#171B28] shadow-xs"
                    : "text-[#8B8E98] hover:text-[#171B28]"
                }`}
              >
                Body Fat %
              </button>
              <button
                onClick={() => setChartMetric("muscleMass")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  chartMetric === "muscleMass"
                    ? "bg-white text-[#171B28] shadow-xs"
                    : "text-[#8B8E98] hover:text-[#171B28]"
                }`}
              >
                Muscle Mass (kg)
              </button>
            </div>
          </div>

          {chartData.length < 2 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <LineChartIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-[#171B28]">Need more entries to display chart</p>
              <p className="text-xs text-[#8B8E98] mt-1 max-w-sm">
                Log at least 2 entries of {chartMetric} to generate your visual progress curve over time.
              </p>
              <button
                onClick={() => setIsMetricModalOpen(true)}
                className="mt-3 px-3.5 py-1.5 bg-[#007A35] text-white text-xs font-semibold rounded-lg hover:bg-[#00622A] transition-colors"
              >
                Log Metrics Now
              </button>
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007A35" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#007A35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F2" />
                  <XAxis
                    dataKey="date"
                    stroke="#8B8E98"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#E1E1E4" }}
                  />
                  <YAxis
                    stroke="#8B8E98"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#E1E1E4" }}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-[#171B28] text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                            <p className="text-[#8B8E98] font-medium">{data.fullDate}</p>
                            <p className="font-bold text-sm text-[#45B472]">
                              {data.val} {chartMetric === "bodyFat" ? "%" : "kg"}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#007A35"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#metricGradient)"
                    dot={{ r: 4, fill: "#007A35", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#007A35" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* METRIC HISTORY TAB */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] overflow-hidden shadow-xs">
          {metrics.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-500">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#171B28]">No Metric Logs Yet</h3>
              <p className="text-xs text-[#8B8E98] max-w-sm mx-auto">
                Log your body weight and metrics periodically to track your health progress and achieve your fitness targets.
              </p>
              <button
                onClick={() => setIsMetricModalOpen(true)}
                className="mt-2 px-4 py-2 bg-[#007A35] text-white text-xs font-semibold rounded-lg hover:bg-[#00622A] transition-colors"
              >
                Log First Metric
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#171B28]">
                <thead className="bg-[#F8F9FA] text-[11px] font-bold text-[#8B8E98] uppercase tracking-wider border-b border-[#E1E1E4]">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Weight (kg)</th>
                    <th className="px-5 py-3.5">Body Fat (%)</th>
                    <th className="px-5 py-3.5">Muscle Mass (kg)</th>
                    <th className="px-5 py-3.5">Notes</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E1E4]">
                  {metrics.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-[#8B8E98]" />
                          <span>{formatDate(m.dateRecorded)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {m.weight ? `${m.weight} kg` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {m.bodyFat ? `${m.bodyFat}%` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {m.muscleMass ? `${m.muscleMass} kg` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#8B8E98] max-w-xs truncate">
                        {m.notes || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteMetric(m.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete metric entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PHOTOS TAB */}
      {activeTab === "photos" && (
        <div>
          {photos.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E1E1E4] p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-500">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#171B28]">No Progress Photos Uploaded</h3>
              <p className="text-xs text-[#8B8E98] max-w-sm mx-auto">
                Save side-by-side transformation photos to visually observe muscle gain and physique improvements.
              </p>
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="mt-2 px-4 py-2 bg-[#007A35] text-white text-xs font-semibold rounded-lg hover:bg-[#00622A] transition-colors"
              >
                Add Your First Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-xl border border-[#E1E1E4] overflow-hidden shadow-xs group">
                  <div className="aspect-4/3 relative bg-gray-100 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.notes || "Progress Photo"}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center justify-between text-xs text-[#8B8E98]">
                      <span>{formatDate(photo.dateTaken)}</span>
                    </div>
                    {photo.notes && (
                      <p className="text-xs text-[#171B28] font-medium mt-1 truncate">{photo.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOG METRIC MODAL */}
      {isMetricModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E1E4]">
              <h3 className="font-bold text-base text-[#171B28]">Log Body Metrics</h3>
              <button
                onClick={() => setIsMetricModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {metricError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{metricError}</span>
              </div>
            )}

            <form onSubmit={handleMetricSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171B28] mb-1">
                  Body Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 74.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E1E1E4] focus:outline-none focus:border-[#007A35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171B28] mb-1">
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 18.2"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E1E1E4] focus:outline-none focus:border-[#007A35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171B28] mb-1">
                    Muscle Mass (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 35.0"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E1E1E4] focus:outline-none focus:border-[#007A35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171B28] mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning fasting weigh-in"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E1E1E4] focus:outline-none focus:border-[#007A35]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMetricModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={metricLoading}
                  className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  {metricLoading ? "Saving..." : "Save Metrics"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E1E4]">
              <h3 className="font-bold text-base text-[#171B28]">Add Progress Photo</h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {photoError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171B28] mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E1E1E4] focus:outline-none focus:border-[#007A35]"
                />
                <p className="text-[10px] text-[#8B8E98] mt-1">
                  Paste an image link or cloud storage URL.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171B28] mb-1">
                  Milestone Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Month 2 front double-biceps check-in"
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E1E1E4] focus:outline-none focus:border-[#007A35]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={photoLoading}
                  className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  {photoLoading ? "Saving..." : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

