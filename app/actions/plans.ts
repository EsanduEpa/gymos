"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
  const session = await auth()
  if (!session || (session.user.role !== "PERSONAL_TRAINER" && session.user.role !== "GYM_OWNER")) {
    return { error: "Unauthorized access" }
  }

  try {
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        trainerId: session.user.id,
        clientId: data.clientId,
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

    await prisma.auditLog.create({
      data: {
        gymId: session.user.gymId,
        actorId: session.user.id,
        action: "CREATE_WORKOUT_PLAN",
        resource: "WorkoutPlan",
        details: `Created Workout Plan "${data.name}" for client ${data.clientId}`,
      },
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
  const session = await auth()
  if (!session || (session.user.role !== "PERSONAL_TRAINER" && session.user.role !== "GYM_OWNER")) {
    return { error: "Unauthorized access" }
  }

  try {
    const mealPlan = await prisma.mealPlan.create({
      data: {
        trainerId: session.user.id,
        clientId: data.clientId,
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

    await prisma.auditLog.create({
      data: {
        gymId: session.user.gymId,
        actorId: session.user.id,
        action: "CREATE_MEAL_PLAN",
        resource: "MealPlan",
        details: `Created Meal Plan "${data.name}" for client ${data.clientId}`,
      },
    })

    revalidatePath(`/trainer/clients/${data.clientId}`)
    return { success: true, planId: mealPlan.id }
  } catch (err) {
    console.error("Save meal plan error:", err)
    return { error: "Failed to save meal plan" }
  }
}
