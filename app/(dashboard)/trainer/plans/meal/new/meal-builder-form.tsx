"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { saveMealPlan } from "@/app/actions/plans"
import { ArrowLeft, Plus, Trash2, Utensils, AlertCircle } from "lucide-react"
import Link from "next/link"

interface MealInput {
  id: string
  dayOfWeek: number
  mealType: string
  foodItem: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

interface MealBuilderFormProps {
  clients: any[]
  initialClientId?: string
}

export function MealBuilderForm({ clients, initialClientId }: MealBuilderFormProps) {
  const router = useRouter()
  const [clientId, setClientId] = useState(initialClientId || "")
  const [planName, setPlanName] = useState("")
  const [meals, setMeals] = useState<MealInput[]>([
    { id: "1", dayOfWeek: 1, mealType: "Breakfast", foodItem: "4 Egg Whites + Oatmeal (80g) + Banana", calories: 450, protein: 32, carbs: 55, fats: 8 },
    { id: "2", dayOfWeek: 1, mealType: "Lunch", foodItem: "Grilled Chicken Breast (200g) + Brown Rice + Broccoli", calories: 550, protein: 48, carbs: 60, fats: 10 },
  ])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const addMeal = () => {
    setMeals([
      ...meals,
      { id: Date.now().toString(), dayOfWeek: 1, mealType: "Snack", foodItem: "", calories: 250, protein: 20, carbs: 25, fats: 5 },
    ])
  }

  const removeMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id))
  }

  const updateMeal = (id: string, field: keyof MealInput, val: any) => {
    setMeals(meals.map((m) => (m.id === id ? { ...m, [field]: val } : m)))
  }

  const totalCalories = meals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0)
  const totalProtein = meals.reduce((acc, m) => acc + (Number(m.protein) || 0), 0)
  const totalCarbs = meals.reduce((acc, m) => acc + (Number(m.carbs) || 0), 0)
  const totalFats = meals.reduce((acc, m) => acc + (Number(m.fats) || 0), 0)

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
    if (meals.length === 0) {
      setError("Please add at least one meal entry")
      return
    }

    setError(null)
    setLoading(true)

    const res = await saveMealPlan({
      clientId,
      name: planName,
      entries: meals.map((m) => ({
        dayOfWeek: Number(m.dayOfWeek),
        mealType: m.mealType,
        foodItem: m.foodItem,
        calories: Number(m.calories),
        protein: Number(m.protein),
        carbs: Number(m.carbs),
        fats: Number(m.fats),
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
        title="Meal Plan Builder"
        description="Construct tailored nutrition plans with auto-calculated daily calories and macros (FR-085)."
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
              Meal Plan Title *
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
              placeholder="e.g. 2,400 kcal High-Protein Lean Bulk Plan"
              className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
            />
          </div>
        </div>

        {/* Auto-calculated Nutrition Summary Bar */}
        <div className="p-4 bg-[#007A35]/10 border border-[#007A35]/20 rounded-xl grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#8B8E98]">Total Calories</p>
            <p className="text-base font-extrabold text-[#007A35]">{totalCalories} kcal</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[#8B8E98]">Protein</p>
            <p className="text-base font-extrabold text-[#171B28]">{totalProtein}g</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[#8B8E98]">Carbs</p>
            <p className="text-base font-extrabold text-[#171B28]">{totalCarbs}g</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[#8B8E98]">Fats</p>
            <p className="text-base font-extrabold text-[#171B28]">{totalFats}g</p>
          </div>
        </div>

        {/* Dynamic Meal List */}
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-[#8B8E98] tracking-wider flex items-center gap-2">
              <Utensils className="h-4 w-4 text-[#007A35]" /> Meal Entries
            </h2>
            <button
              type="button"
              onClick={addMeal}
              className="px-3 py-1.5 bg-[#DDF5E7] hover:bg-[#BBEBD0] text-[#007A35] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Meal
            </button>
          </div>

          <div className="space-y-3">
            {meals.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-[#F5F4F5] rounded-xl border border-[#E1E1E4] space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] uppercase font-bold text-[#8B8E98] mb-1">
                      Meal Type
                    </label>
                    <select
                      value={m.mealType}
                      onChange={(e) => updateMeal(m.id, "mealType", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                      <option value="Pre-Workout">Pre-Workout</option>
                      <option value="Post-Workout">Post-Workout</option>
                    </select>
                  </div>

                  <div className="sm:col-span-8">
                    <label className="block text-[10px] uppercase font-bold text-[#8B8E98] mb-1">
                      Food Item & Description
                    </label>
                    <input
                      type="text"
                      value={m.foodItem}
                      onChange={(e) => updateMeal(m.id, "foodItem", e.target.value)}
                      required
                      placeholder="e.g. 200g Salmon + 150g Quinoa"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeMeal(m.id)}
                      className="p-1.5 text-[#D71920] hover:bg-[#FDE4E4] rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-2 border-t border-[#E1E1E4]">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-[#8B8E98] mb-1">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={m.calories}
                      onChange={(e) => updateMeal(m.id, "calories", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-[#8B8E98] mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={m.protein}
                      onChange={(e) => updateMeal(m.id, "protein", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-[#8B8E98] mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={m.carbs}
                      onChange={(e) => updateMeal(m.id, "carbs", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-[#8B8E98] mb-1">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      value={m.fats}
                      onChange={(e) => updateMeal(m.id, "fats", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-[#E1E1E4] rounded-lg"
                    />
                  </div>
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
            {loading ? "Saving Plan..." : "Assign Meal Plan"}
          </button>
        </div>
      </form>
    </div>
  )
}
