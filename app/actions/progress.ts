"use server"

import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getMemberProgress() {
  const auth = await authorize([Role.GYM_MEMBER])
  if (!auth.ok) return { error: auth.error, metrics: [], photos: [] }

  try {
    const [metrics, photos] = await Promise.all([
      prisma.bodyMetric.findMany({
        where: { userId: auth.userId },
        orderBy: { dateRecorded: "desc" },
      }),
      prisma.progressPhoto.findMany({
        where: { userId: auth.userId },
        orderBy: { dateTaken: "desc" },
      }),
    ])

    return { metrics, photos }
  } catch (err) {
    console.error("Get member progress error:", err)
    return { error: "Failed to load progress data", metrics: [], photos: [] }
  }
}

export async function logBodyMetric(data: {
  weight?: number
  bodyFat?: number
  muscleMass?: number
  notes?: string
}) {
  const auth = await authorize([Role.GYM_MEMBER])
  if (!auth.ok) return { error: auth.error }

  if (!data.weight && !data.bodyFat && !data.muscleMass) {
    return { error: "Please enter at least one measurement (weight, body fat, or muscle mass)." }
  }

  try {
    const record = await prisma.bodyMetric.create({
      data: {
        userId: auth.userId,
        weight: data.weight ? Number(data.weight) : null,
        bodyFat: data.bodyFat ? Number(data.bodyFat) : null,
        muscleMass: data.muscleMass ? Number(data.muscleMass) : null,
        notes: data.notes?.trim() || null,
      },
    })

    revalidatePath("/member/progress")
    revalidatePath("/member/dashboard")
    return { success: true, metricId: record.id }
  } catch (err) {
    console.error("Log body metric error:", err)
    return { error: "Failed to record metric entry" }
  }
}

export async function logProgressPhoto(data: {
  url: string
  notes?: string
}) {
  const auth = await authorize([Role.GYM_MEMBER])
  if (!auth.ok) return { error: auth.error }

  if (!data.url?.trim()) {
    return { error: "Photo URL is required." }
  }

  try {
    const photo = await prisma.progressPhoto.create({
      data: {
        userId: auth.userId,
        url: data.url.trim(),
        notes: data.notes?.trim() || null,
      },
    })

    revalidatePath("/member/progress")
    return { success: true, photoId: photo.id }
  } catch (err) {
    console.error("Log progress photo error:", err)
    return { error: "Failed to save progress photo" }
  }
}

export async function deleteBodyMetric(id: string) {
  const auth = await authorize([Role.GYM_MEMBER])
  if (!auth.ok) return { error: auth.error }

  try {
    await prisma.bodyMetric.deleteMany({
      where: { id, userId: auth.userId },
    })

    revalidatePath("/member/progress")
    return { success: true }
  } catch (err) {
    console.error("Delete body metric error:", err)
    return { error: "Failed to delete metric" }
  }
}

export async function deleteProgressPhoto(id: string) {
  const auth = await authorize([Role.GYM_MEMBER])
  if (!auth.ok) return { error: auth.error }

  try {
    await prisma.progressPhoto.deleteMany({
      where: { id, userId: auth.userId },
    })

    revalidatePath("/member/progress")
    return { success: true }
  } catch (err) {
    console.error("Delete progress photo error:", err)
    return { error: "Failed to delete photo" }
  }
}

