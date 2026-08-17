"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { authorize, trainerClientWhere } from "@/lib/authz"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Plans are written with the caller as trainer-of-record, so only a trainer can
// create one — an owner doing so would invent a trainer↔client relationship
// that no session backs. The plan builder already lives under /trainer.
const PLAN_AUTHORS = [Role.PERSONAL_TRAINER]

/** Resolves a client the calling trainer is actually allowed to write plans for. */
async function resolveClient(gymId: string, trainerId: string, clientId: string) {
  if (!clientId) return null
  return prisma.user.findFirst({
    where: { id: clientId, ...trainerClientWhere(gymId, trainerId) },
    select: { id: true, fullName: true },
  })
}

export async function saveWorkoutPlan(data: {
  clientId: string
  name: string
  description?: string
  exercises: {
    name: string
    sets: number
    reps?: number
    weight?: number
    duration?: number
    notes?: string
  }[]
}) {
  const auth = await authorize(PLAN_AUTHORS)
  if (!auth.ok) return { error: auth.error }

  const client = await resolveClient(auth.gymId, auth.userId, data.clientId)
  if (!client) return { error: "That client is not assigned to you." }

  try {
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        trainerId: auth.userId,
        clientId: client.id,
        name: data.name,
        description: data.description,
        exercises: {
          create: data.exercises.map((e) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            duration: e.duration,
            notes: e.notes,
          })),
        },
      },
    })

    await logAudit({
      userId: auth.userId,
      gymId: auth.gymId,
      actionType: "PLAN_ASSIGNED",
      affectedRecordId: workoutPlan.id,
      details: { message: `Created Workout Plan "${data.name}" for ${client.fullName}` },
    })

    revalidatePath(`/trainer/clients/${data.clientId}`)
    return { success: true, planId: workoutPlan.id }
  } catch (err) {
    console.error("Save workout plan error:", err)
    return { error: "Failed to save workout plan" }
  }
}

export async function saveMealPlan(data: {
  clientId: string
  name: string
  entries: {
    dayOfWeek: number
    mealType: string
    foodItem: string
    calories?: number
    protein?: number
    carbs?: number
    fats?: number
  }[]
}) {
  const auth = await authorize(PLAN_AUTHORS)
  if (!auth.ok) return { error: auth.error }

  const client = await resolveClient(auth.gymId, auth.userId, data.clientId)
  if (!client) return { error: "That client is not assigned to you." }

  try {
    const mealPlan = await prisma.mealPlan.create({
      data: {
        trainerId: auth.userId,
        clientId: client.id,
        name: data.name,
        entries: {
          create: data.entries.map((e) => ({
            dayOfWeek: e.dayOfWeek,
            mealType: e.mealType,
            foodItem: e.foodItem,
            calories: e.calories,
            protein: e.protein,
            carbs: e.carbs,
            fats: e.fats,
          })),
        },
      },
    })

    await logAudit({
      userId: auth.userId,
      gymId: auth.gymId,
      actionType: "PLAN_ASSIGNED",
      affectedRecordId: mealPlan.id,
      details: { message: `Created Meal Plan "${data.name}" for ${client.fullName}` },
    })

    revalidatePath(`/trainer/clients/${data.clientId}`)
    return { success: true, planId: mealPlan.id }
  } catch (err) {
    console.error("Save meal plan error:", err)
    return { error: "Failed to save meal plan" }
  }
}
