"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { authorize, findUserInGym } from "@/lib/authz"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const issuePackSchema = z.object({
  userId: z.string().min(1, "Member is required"),
  totalSessions: z.coerce.number().min(1, "Must issue at least 1 session"),
  price: z.coerce.number().min(0, "Price must be positive"),
  durationDays: z.coerce.number().default(90),
})

export async function issueSessionPack(formData: FormData) {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const raw = {
    userId: formData.get("userId") as string,
    totalSessions: formData.get("totalSessions"),
    price: formData.get("price"),
    durationDays: formData.get("durationDays") || 90,
  }

  const validated = issuePackSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { userId, totalSessions, price, durationDays } = validated.data
  const expiryDate = new Date(Date.now() + durationDays * 86400000)

  // SessionPack carries no gymId of its own, so the member is the only thing
  // tying a pack to a tenant — check them before issuing anything.
  const member = await findUserInGym(gymId, userId, Role.GYM_MEMBER)
  if (!member) return { error: "Member not found at your gym." }

  try {
    const pack = await prisma.sessionPack.create({
      data: {
        userId: member.id,
        totalSessions,
        remainingSessions: totalSessions,
        price,
        expiryDate,
        status: "ACTIVE",
      },
    })

    // BR-064: Deferred revenue tracking log in AuditLog
    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "MEMBER_UPDATED",
      affectedRecordId: pack.id,
      details: { message: `Issued ${totalSessions} PT Session Pack for $${price.toFixed(2)} to ${member.fullName}. Expiry: ${expiryDate.toISOString().split("T")[0]}` },
    })

    revalidatePath(`/owner/members/${userId}`)
    return { success: true, packId: pack.id }
  } catch (err) {
    console.error("Issue pack error:", err)
    return { error: "Failed to issue session pack" }
  }
}
