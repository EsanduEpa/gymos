"use client"

import { useState } from "react"
import Link from "next/link"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { ArrowLeft, Dumbbell, Utensils, Calendar, Plus, Activity, User } from "lucide-react"

interface Client360ClientProps {
  client: any
}

export function Client360Client({ client }: Client360ClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "workouts" | "meals" | "history">("overview")

  const activePack = client.sessionPacks[0]
  const latestWorkout = client.workoutPlansClient[0]
  const latestMeal = client.mealPlansClient[0]
  // Body metrics are a mobile-app feature; the web dashboard cannot record
  // them, so this profile reports on what it does know — the session history.
  const completedSessions = client.sessionsClient.filter(
    (s: any) => s.status === "COMPLETED"
  ).length
  const lastCompleted = client.sessionsClient.find((s: any) => s.status === "COMPLETED")
  const lastSessionLabel = lastCompleted
    ? `Last on ${new Date(lastCompleted.scheduledAt).toLocaleDateString()}`
    : "No sessions yet"

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/trainer/clients"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8E98] hover:text-[#171B28] font-semibold mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Client Roster
        </Link>

        {/* Client Banner */}
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#007A35]/10 border-2 border-[#007A35]/20 flex items-center justify-center text-[#007A35] font-extrabold text-xl shrink-0">
              {client.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#171B28]">{client.fullName}</h1>
                <StatusBadge status={client.memberStatus || "ACTIVE"} />
              </div>
              <p className="text-xs text-[#8B8E98] mt-0.5">
                {client.email} • {client.phone || "No phone"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href={`/trainer/plans/workout/new?clientId=${client.id}`}
              className="px-3.5 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create Workout Plan
            </Link>
            <Link
              href={`/trainer/plans/meal/new?clientId=${client.id}`}
              className="px-3.5 py-2 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Utensils className="h-4 w-4 text-[#007A35]" /> Create Meal Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Sessions Remaining"
          value={activePack?.remainingSessions || 0}
          trend={activePack?.remainingSessions === 0 ? "Exhausted" : "Active Pack"}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Sessions Completed"
          value={completedSessions}
          trend={lastSessionLabel}
          icon={<Activity className="h-5 w-5 text-[#007A35]" />}
        />
        <StatCard
          label="Active Workout Plan"
          value={latestWorkout?.name || "None Assigned"}
          icon={<Dumbbell className="h-5 w-5 text-[#007A35]" />}
        />
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-[#E1E1E4] gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "overview"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab("workouts")}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "workouts"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          Workout Plans
        </button>
        <button
          onClick={() => setActiveTab("meals")}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "meals"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          Meal Plans
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "history"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          Session History
        </button>
      </div>

      {/* Tab 1: Overview & Metrics */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E1E1E4] p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase text-[#8B8E98] tracking-wider">
              Health & Emergency Details
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                <span className="text-[#8B8E98]">Date of Birth:</span>
                <span className="font-medium text-[#171B28]" suppressHydrationWarning>
                  {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F5F4F5]">
                <span className="text-[#8B8E98]">Emergency Contact:</span>
                <span className="font-medium text-[#171B28]">{client.emergencyContact || "—"}</span>
              </div>
              <div>
                <p className="text-[#8B8E98] mb-1">Health Notes / Medical Conditions:</p>
                <p className="p-3 bg-[#F5F4F5] rounded-lg text-[#4A4D58] border border-[#E1E1E4]">
                  {client.healthNotes || "No medical notes logged."}
                </p>
              </div>
            </div>
          </div>

          {/* Body metrics and progress photos are deferred to the mobile app —
              nothing in the web dashboard can record them, so this panel only
              ever showed an empty state promising a feature that doesn't exist.
              The BodyMetric model stays in the schema for that later build. */}
        </div>
      )}

      {/* Tab 2: Workout Plans */}
      {activeTab === "workouts" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-[#8B8E98]">Assigned Workout Plans</h2>
            <Link
              href={`/trainer/plans/workout/new?clientId=${client.id}`}
              className="px-3 py-1.5 bg-[#007A35] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              + Build New Workout Plan
            </Link>
          </div>

          <div className="space-y-4">
            {client.workoutPlansClient.map((wp: any) => (
              <div key={wp.id} className="p-4 bg-[#F5F4F5] rounded-xl border border-[#E1E1E4] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#171B28]">{wp.name}</h3>
                  <span className="text-[10px] text-[#8B8E98]" suppressHydrationWarning>
                    Created {new Date(wp.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="divide-y divide-[#E1E1E4] border-t border-[#E1E1E4] pt-2">
                  {wp.exercises.map((ex: any) => (
                    <div key={ex.id} className="py-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#171B28]">{ex.name}</span>
                      <span className="text-[#4A4D58]">
                        {ex.sets} Sets × {ex.reps || "—"} Reps {ex.weight ? `(${ex.weight}kg)` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {client.workoutPlansClient.length === 0 && (
              <p className="text-xs text-[#8B8E98]">No workout plans assigned yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Meal Plans */}
      {activeTab === "meals" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-[#8B8E98]">Assigned Meal Plans</h2>
            <Link
              href={`/trainer/plans/meal/new?clientId=${client.id}`}
              className="px-3 py-1.5 bg-[#007A35] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              + Build New Meal Plan
            </Link>
          </div>

          <div className="space-y-4">
            {client.mealPlansClient.map((mp: any) => (
              <div key={mp.id} className="p-4 bg-[#F5F4F5] rounded-xl border border-[#E1E1E4] space-y-3">
                <h3 className="font-bold text-sm text-[#171B28]">{mp.name}</h3>
                <div className="divide-y divide-[#E1E1E4] border-t border-[#E1E1E4] pt-2">
                  {mp.entries.map((entry: any) => (
                    <div key={entry.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#171B28] mr-2">[{entry.mealType}]</span>
                        <span className="text-[#4A4D58]">{entry.foodItem}</span>
                      </div>
                      <span className="text-[#007A35] font-semibold">{entry.calories || 0} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {client.mealPlansClient.length === 0 && (
              <p className="text-xs text-[#8B8E98]">No meal plans assigned yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Session History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase text-[#8B8E98] mb-4">Past PT Sessions</h2>
          <div className="divide-y divide-[#E1E1E4]">
            {client.sessionsClient.map((s: any) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#171B28]" suppressHydrationWarning>
                    {new Date(s.scheduledAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#8B8E98]">Type: {s.type} • {s.duration} mins</p>
                  {s.notes && <p className="text-xs text-[#4A4D58] italic mt-0.5">"{s.notes}"</p>}
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
            {client.sessionsClient.length === 0 && (
              <p className="text-xs text-[#8B8E98] py-4">No past sessions with this client.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
