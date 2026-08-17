"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Gym configuration is owner territory. SUPER_ADMIN is included so platform
// support can correct a gym's setup while impersonating it — the other three
// config actions previously locked them out for no stated reason.
const CONFIG_ROLES = [Role.GYM_OWNER, Role.SUPER_ADMIN]

const gymProfileSchema = z.object({
  name: z.string().min(1, "Gym name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  payPeriod: z.enum(["WEEKLY", "MONTHLY"]).default("MONTHLY"),
})

export async function updateGymProfile(formData: FormData) {
  const auth = await authorize(CONFIG_ROLES)
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const raw = {
    name: formData.get("name") as string,
    address: (formData.get("address") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    payPeriod: (formData.get("payPeriod") as "WEEKLY" | "MONTHLY") || "MONTHLY",
  }

  const validated = gymProfileSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  try {
    await prisma.gym.update({
      where: { id: gymId },
      data: validated.data,
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "GYM_CONFIG_UPDATED",
      affectedRecordId: gymId,
      details: { message: `Updated gym profile details for ${validated.data.name}` },
    })

    revalidatePath("/owner/gym-config")
    return { success: true }
  } catch (err) {
    console.error("Failed to update gym profile:", err)
    return { error: "Failed to save gym profile settings" }
  }
}

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  durationDays: z.coerce.number().min(1, "Duration must be at least 1 day"),
})

export async function createMembershipPlan(formData: FormData) {
  const auth = await authorize(CONFIG_ROLES)
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("price"),
    durationDays: formData.get("durationDays"),
  }

  const validated = planSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  try {
    const plan = await prisma.membershipPlan.create({
      data: {
        gymId,
        ...validated.data,
      },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "GYM_CONFIG_UPDATED",
      affectedRecordId: plan.id,
      details: { message: `Created plan ${plan.name} ($${plan.price}/${plan.durationDays} days)` },
    })

    revalidatePath("/owner/gym-config")
    return { success: true }
  } catch (err) {
    console.error("Failed to create membership plan:", err)
    return { error: "Failed to create membership plan" }
  }
}

export async function updateTrainerPayRates(formData: FormData) {
  const auth = await authorize(CONFIG_ROLES)
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const level1BaseRate = parseFloat(formData.get("level1BaseRate") as string) / 100
  const level2BaseRate = parseFloat(formData.get("level2BaseRate") as string) / 100
  const offShiftPremium = parseFloat(formData.get("offShiftPremium") as string) / 100

  if (isNaN(level1BaseRate) || isNaN(level2BaseRate) || isNaN(offShiftPremium)) {
    return { error: "Invalid rate percentages" }
  }

  try {
    await prisma.gym.update({
      where: { id: gymId },
      data: {
        level1BaseRate,
        level2BaseRate,
        offShiftPremium,
      },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "PAY_RATES_UPDATED",
      affectedRecordId: gymId,
      details: { message: `Updated trainer pay rates: L1=${level1BaseRate*100}%, L2=${level2BaseRate*100}%, Off-shift=${offShiftPremium*100}%` },
    })

    revalidatePath("/owner/gym-config")
    return { success: true }
  } catch (err) {
    return { error: "Failed to update pay rates" }
  }
}

export async function updateCancellationPolicy(formData: FormData) {
  const auth = await authorize(CONFIG_ROLES)
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const cancellationWindowHours = parseInt(formData.get("cancellationWindowHours") as string, 10)
  const minSessionDuration = parseInt(formData.get("minSessionDuration") as string, 10)
  const noShowDeduction = formData.get("noShowDeduction") === "on" || formData.get("noShowDeduction") === "true"
  const lateCancelDeduction = formData.get("lateCancelDeduction") === "on" || formData.get("lateCancelDeduction") === "true"

  try {
    await prisma.gym.update({
      where: { id: gymId },
      data: {
        cancellationWindowHours: isNaN(cancellationWindowHours) ? 24 : cancellationWindowHours,
        minSessionDuration: isNaN(minSessionDuration) ? 20 : minSessionDuration,
        noShowDeduction,
        lateCancelDeduction,
      },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "POLICY_UPDATED",
      affectedRecordId: gymId,
      details: { message: `Updated cancellation policy: window=${cancellationWindowHours}h, minDuration=${minSessionDuration}m` },
    })

    revalidatePath("/owner/gym-config")
    return { success: true }
  } catch (err) {
    return { error: "Failed to update cancellation policy" }
  }
}
