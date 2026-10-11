"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { Dumbbell, Utensils, Calendar, User, ChevronRight, Clock, Award, ArrowRight } from "lucide-react"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number | null
  weight: number | null
  duration: number | null
  notes: string | null
}

interface WorkoutPlan {
  id: string
  name: string
  description: string | null
  createdAt: Date | string
  trainer: { fullName: string }
  exercises: Exercise[]
}

interface MealEntry {
  id: string
  dayOfWeek: number
  mealType: string
  foodItem: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fats: number | null
}

interface MealPlan {
  id: string
  name: string
  createdAt: Date | string
  trainer: { fullName: string }
  entries: MealEntry[]
}

interface MemberPlansClientProps {
  workoutPlans: WorkoutPlan[]
  mealPlans: MealPlan[]
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function MemberPlansClient({ workoutPlans, mealPlans }: MemberPlansClientProps) {
  const [activeTab, setActiveTab] = useState<"workout" | "meal">("workout")
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(
    workoutPlans[0]?.id || ""
  )
  const [selectedMealId, setSelectedMealId] = useState<string>(
    mealPlans[0]?.id || ""
  )
  const [selectedDay, setSelectedDay] = useState<number>(1) // Monday by default

  const currentWorkout = workoutPlans.find((p) => p.id === selectedWorkoutId) || workoutPlans[0]
  const currentMealPlan = mealPlans.find((p) => p.id === selectedMealId) || mealPlans[0]

  const dayMeals = currentMealPlan?.entries.filter((e) => e.dayOfWeek === selectedDay) || []

  // Daily macro totals
  const totalCalories = dayMeals.reduce((acc, m) => acc + (m.calories || 0), 0)
  const totalProtein = dayMeals.reduce((acc, m) => acc + (m.protein || 0), 0)
  const totalCarbs = dayMeals.reduce((acc, m) => acc + (m.carbs || 0), 0)
  const totalFats = dayMeals.reduce((acc, m) => acc + (m.fats || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Nutrition Plans"
        description="View your customized workout routines and dietary plans assigned by your personal trainers."
        action={
          <Link
            href="/member/trainers"
            className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Dumbbell className="h-4 w-4" />
            Find a Trainer
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-[#E1E1E4] gap-6">
        <button
          onClick={() => setActiveTab("workout")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors relative ${
            activeTab === "workout"
              ? "text-[#007A35] border-b-2 border-[#007A35]"
              : "text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Workout Plans ({workoutPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("meal")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors relative ${
            activeTab === "meal"
              ? "text-[#007A35] border-b-2 border-[#007A35]"
              : "text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>Meal Plans ({mealPlans.length})</span>
        </button>
      </div>

      {/* WORKOUT PLANS TAB */}
      {activeTab === "workout" && (
        <>
          {workoutPlans.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E1E1E4] p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-500">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#171B28]">No Workout Plans Assigned</h3>
              <p className="text-xs text-[#8B8E98] max-w-md mx-auto">
                Your personal trainer has not assigned a workout plan yet. Connect with your trainer or book a session to get a personalized program.
              </p>
              <Link
                href="/member/trainers"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#007A35] hover:underline pt-2"
              >
                Browse Available Trainers <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Plan selector column */}
              <div className="lg:col-span-1 space-y-2">
                <h4 className="text-xs font-bold text-[#8B8E98] uppercase tracking-wider mb-2">Select Plan</h4>
                {workoutPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedWorkoutId(plan.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      currentWorkout?.id === plan.id
                        ? "bg-[#F4F9F5] border-[#007A35] text-[#007A35] shadow-xs"
                        : "bg-white border-[#E1E1E4] text-[#171B28] hover:border-gray-400"
                    }`}
                  >
                    <div className="font-semibold text-sm">{plan.name}</div>
                    <div className="text-xs text-[#8B8E98] mt-1 flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      <span>{plan.trainer.fullName}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Workout Details column */}
              <div className="lg:col-span-3 space-y-4">
                {currentWorkout && (
                  <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E1E4] pb-4 mb-5">
                      <div>
                        <h2 className="text-xl font-bold text-[#171B28]">{currentWorkout.name}</h2>
                        {currentWorkout.description && (
                          <p className="text-sm text-[#8B8E98] mt-1">{currentWorkout.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#8B8E98]">Created by</span>
                        <div className="text-sm font-semibold text-[#171B28]">
                          {currentWorkout.trainer.fullName}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#8B8E98] uppercase tracking-wider">
                        Exercise Routine ({currentWorkout.exercises.length} Exercises)
                      </h4>

                      <div className="divide-y divide-[#E1E1E4]">
                        {currentWorkout.exercises.map((exercise, idx) => (
                          <div key={exercise.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-700 flex items-center justify-center mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-semibold text-sm text-[#171B28]">{exercise.name}</p>
                                {exercise.notes && (
                                  <p className="text-xs text-[#8B8E98] mt-0.5 italic">{exercise.notes}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4 pl-9 sm:pl-0 text-xs font-medium text-gray-600">
                              <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                                <strong className="text-gray-900">{exercise.sets}</strong> sets
                              </span>
                              {exercise.reps && (
                                <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                                  <strong className="text-gray-900">{exercise.reps}</strong> reps
                                </span>
                              )}
                              {exercise.weight && (
                                <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                                  <strong className="text-gray-900">{exercise.weight}</strong> kg
                                </span>
                              )}
                              {exercise.duration && (
                                <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <strong className="text-gray-900">{exercise.duration}</strong> min
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MEAL PLANS TAB */}
      {activeTab === "meal" && (
        <>
          {mealPlans.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E1E1E4] p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-500">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#171B28]">No Meal Plans Assigned</h3>
              <p className="text-xs text-[#8B8E98] max-w-md mx-auto">
                No nutrition guide has been created for your account yet. Speak with your personal trainer to prepare a customized diet routine.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Day filter pills */}
              <div className="flex flex-wrap gap-2">
                {DAYS.map((dayName, idx) => (
                  <button
                    key={dayName}
                    onClick={() => setSelectedDay(idx)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedDay === idx
                        ? "bg-[#171B28] text-white shadow-xs"
                        : "bg-white border border-[#E1E1E4] text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {dayName}
                  </button>
                ))}
              </div>

              {/* Day Macro Summary */}
              {dayMeals.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#8B8E98]">Total Calories</span>
                    <p className="text-lg font-bold text-[#171B28] mt-0.5">{totalCalories} <span className="text-xs font-normal text-gray-500">kcal</span></p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#8B8E98]">Protein</span>
                    <p className="text-lg font-bold text-[#007A35] mt-0.5">{totalProtein.toFixed(1)} <span className="text-xs font-normal text-gray-500">g</span></p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#8B8E98]">Carbs</span>
                    <p className="text-lg font-bold text-amber-600 mt-0.5">{totalCarbs.toFixed(1)} <span className="text-xs font-normal text-gray-500">g</span></p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E1E1E4] shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#8B8E98]">Fats</span>
                    <p className="text-lg font-bold text-red-500 mt-0.5">{totalFats.toFixed(1)} <span className="text-xs font-normal text-gray-500">g</span></p>
                  </div>
                </div>
              )}

              {/* Meals list */}
              {dayMeals.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E1E1E4] p-8 text-center text-sm text-[#8B8E98]">
                  No meals specifically scheduled for {DAYS[selectedDay]}. Enjoy a healthy balanced routine!
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#E1E1E4] divide-y divide-[#E1E1E4] overflow-hidden shadow-sm">
                  {dayMeals.map((meal) => (
                    <div key={meal.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                          {meal.mealType}
                        </span>
                        <h4 className="font-semibold text-sm text-[#171B28]">{meal.foodItem}</h4>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600 font-medium">
                        {meal.calories && <span><strong>{meal.calories}</strong> kcal</span>}
                        {meal.protein && <span className="text-green-700"><strong>{meal.protein}g</strong> Protein</span>}
                        {meal.carbs && <span className="text-amber-700"><strong>{meal.carbs}g</strong> Carbs</span>}
                        {meal.fats && <span className="text-red-700"><strong>{meal.fats}g</strong> Fats</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

