"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { authorize, findUserInGym } from "@/lib/authz"
import { Role, TrainerLevel } from "@prisma/client"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createTrainerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  trainerLevel: z.enum(["LEVEL_1", "LEVEL_2"]),
  specialisations: z.string().optional(),
  yearsExperience: z.coerce.number().optional(),
  shiftStart: z.string().optional(),
  shiftEnd: z.string().optional(),
  bio: z.string().optional(),
})

export async function createTrainer(formData: FormData) {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    trainerLevel: formData.get("trainerLevel") as "LEVEL_1" | "LEVEL_2",
    specialisations: (formData.get("specialisations") as string) || undefined,
    yearsExperience: formData.get("yearsExperience"),
    shiftStart: (formData.get("shiftStart") as string) || undefined,
    shiftEnd: (formData.get("shiftEnd") as string) || undefined,
    bio: (formData.get("bio") as string) || undefined,
  }

  const validated = createTrainerSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const existing = await prisma.user.findUnique({ where: { email: validated.data.email } })
  if (existing) {
    return { error: "A trainer or user with this email already exists." }
  }

  try {
    const passwordHash = await bcrypt.hash("password123", 10)

    const trainer = await prisma.user.create({
      data: {
        email: validated.data.email,
        password: passwordHash,
        fullName: validated.data.fullName,
        phone: validated.data.phone,
        role: Role.PERSONAL_TRAINER,
        gymId,
        trainerLevel: validated.data.trainerLevel as TrainerLevel,
        specialisations: validated.data.specialisations
          ? validated.data.specialisations.split(",").map((s) => s.trim())
          : [],
        yearsExperience: validated.data.yearsExperience,
        shiftStart: validated.data.shiftStart || "08:00",
        shiftEnd: validated.data.shiftEnd || "17:00",
        bio: validated.data.bio,
        trainerStatus: "ACTIVE",
      },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "TRAINER_CREATED",
      affectedRecordId: trainer.id,
      details: { message: `Created trainer account ${trainer.fullName} (${trainer.email}) as ${trainer.trainerLevel}` },
    })

    revalidatePath("/owner/trainers")
    return { success: true, trainerId: trainer.id }
  } catch (err) {
    console.error("Failed to create trainer:", err)
    return { error: "Failed to create trainer account." }
  }
}

export async function updateTrainerStatus(trainerId: string, status: "ACTIVE" | "DEACTIVATED") {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const existing = await findUserInGym(gymId, trainerId, Role.PERSONAL_TRAINER)
  if (!existing) return { error: "Trainer not found at your gym." }

  try {
    const trainer = await prisma.user.update({
      where: { id: existing.id },
      data: { trainerStatus: status },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: status === "DEACTIVATED" ? "TRAINER_DEACTIVATED" : "TRAINER_UPDATED",
      affectedRecordId: trainer.id,
      details: { message: `Changed status for trainer ${trainer.fullName} to ${status}` },
    })

    revalidatePath(`/owner/trainers/${trainerId}`)
    revalidatePath("/owner/trainers")
    return { success: true }
  } catch (err) {
    console.error("Update trainer status error:", err)
    return { error: "Failed to update trainer status" }
  }
}

export async function approveShiftHours(trainerId: string, shiftStart: string, shiftEnd: string) {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const existing = await findUserInGym(gymId, trainerId, Role.PERSONAL_TRAINER)
  if (!existing) return { error: "Trainer not found at your gym." }

  try {
    const trainer = await prisma.user.update({
      where: { id: existing.id },
      data: { shiftStart, shiftEnd },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "TRAINER_UPDATED",
      affectedRecordId: trainer.id,
      details: { message: `Approved shift hours for trainer ${trainer.fullName}: ${shiftStart} - ${shiftEnd}` },
    })

    revalidatePath(`/owner/trainers/${trainerId}`)
    revalidatePath("/owner/trainers")
    return { success: true }
  } catch (err) {
    console.error("Approve shift hours error:", err)
    return { error: "Failed to approve shift hours" }
  }
}
