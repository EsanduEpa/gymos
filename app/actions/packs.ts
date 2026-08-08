"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const issuePackSchema = z.object({
  userId: z.string().min(1, "Member is required"),
  totalSessions: z.coerce.number().min(1, "Must issue at least 1 session"),
  price: z.coerce.number().min(0, "Price must be positive"),
  durationDays: z.coerce.number().default(90),
})

export async function issueSessionPack(formData: FormData) {
  const session = await auth()
  if (!session || (session.user.role !== "GYM_OWNER" && session.user.role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized access" }
  }

  const gymId = session.user.gymId
  if (!gymId) return { error: "No gym assigned" }

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

  try {
    const pack = await prisma.sessionPack.create({
      data: {
        userId,
        totalSessions,
        remainingSessions: totalSessions,
        price,
        expiryDate,
        status: "ACTIVE",
      },
    })

    // BR-064: Deferred revenue tracking log in AuditLog
    await prisma.auditLog.create({
      data: {
        gymId,
        actorId: session.user.id,
        action: "ISSUE_SESSION_PACK",
        resource: "SessionPack",
        details: `Issued ${totalSessions} PT Session Pack for $${price.toFixed(2)} to member ${userId}. Expiry: ${expiryDate.toISOString().split("T")[0]}`,
      },
    })

    revalidatePath(`/owner/members/${userId}`)
    return { success: true, packId: pack.id }
  } catch (err) {
    console.error("Issue pack error:", err)
    return { error: "Failed to issue session pack" }
  }
}
