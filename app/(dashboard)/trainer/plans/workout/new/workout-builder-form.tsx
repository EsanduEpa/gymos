"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { saveWorkoutPlan } from "@/app/actions/plans"
import { ArrowLeft, Plus, Trash2, Dumbbell, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ExerciseInput {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
  notes?: string
}

interface WorkoutBuilderFormProps {
  clients: any[]
  initialClientId?: string
}

export function WorkoutBuilderForm({ clients, initialClientId }: WorkoutBuilderFormProps) {
  const router = useRouter()
  const [clientId, setClientId] = useState(initialClientId || "")
  const [planName, setPlanName] = useState("")
  const [description, setDescription] = useState("")
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { id: "1", name: "Barbell Bench Press", sets: 4, reps: 10, weight: 60 },
    { id: "2", name: "Incline Dumbbell Flyes", sets: 3, reps: 12, weight: 16 },
  ])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: "", sets: 3, reps: 10 },
    ])
  }

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id))
  }

  const updateExercise = (id: string, field: keyof ExerciseInput, val: any) => {
    setExercises(
      exercises.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      setError("Please select a client")
      return
    }
    if (!planName) {
      setError("Please enter a plan name")
      return
    }
    if (exercises.length === 0) {
      setError("Please add at least one exercise")
      return
    }

    setError(null)
    setLoading(true)

    const res = await saveWorkoutPlan({
      clientId,
      name: planName,
      description,
      exercises: exercises.map((e) => ({
        name: e.name,
        sets: Number(e.sets),
        reps: Number(e.reps),
        weight: e.weight ? Number(e.weight) : undefined,
        notes: e.notes,
      })),
    })

    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      router.push(`/trainer/clients/${clientId}`)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/trainer/clients"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8E98] hover:text-[#171B28] font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Client Roster
        </Link>
      </div>

      <PageHeader
        title="Workout Plan Builder"
        description="Design custom exercise regimens for your assigned clients with sets, reps, and target weights (FR-084 / SCR-19)."
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#FDE4E4] border border-[#F8B4B4] text-[#D71920] text-xs flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Assign to Client *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35] font-semibold text-[#171B28]"
            >
              <option value="">-- Choose Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Plan Title *
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
              placeholder="e.g. 4-Week Hypertrophy Chest & Arms Routine"
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
              Routine Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="High intensity chest and triceps focus..."
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>
        </div>

        {/* Dynamic Exercise List */}
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-[#8B8E98] tracking-wider flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-[#007A35]" /> Exercise Breakdown
            </h2>
            <button
              type="button"
              onClick={addExercise}
              className="px-3 py-1.5 bg-[#DDF5E7] hover:bg-[#BBEBD0] text-[#007A35] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Exercise
            </button>
          </div>

          <div className="space-y-3">
            {exercises.map((ex, index) => (
              <div
                key={ex.id}
                className="p-4 bg-[#F5F4F5] rounded-xl border border-[#E1E1E4] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-4">
                  <label className="block text-[10px] uppercase font-bold text-[#8B8E98] mb-1">
                    Exercise {index + 1} Name
                  </label>
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, "name", e.target.value)}
                    required
                    placeholder="e.g. Squats"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[#8B8E98] mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.id, "sets", e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[#8B8E98] mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    value={ex.reps}
                    onChange={(e) => updateExercise(ex.id, "reps", e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-[#8B8E98] mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={ex.weight || ""}
                    onChange={(e) => updateExercise(ex.id, "weight", e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.id)}
                    className="p-1.5 text-[#D71920] hover:bg-[#FDE4E4] rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/trainer/clients"
            className="px-4 py-2 text-xs font-semibold text-[#4A4D58] bg-[#F5F4F5] hover:bg-[#EAEAEA] rounded-lg cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            {loading ? "Saving Plan..." : "Assign Workout Plan"}
          </button>
        </div>
      </form>
    </div>
  )
}
