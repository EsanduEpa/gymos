"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createHireRequest(trainerId: string, message?: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  try {
    const existing = await prisma.hireRequest.findFirst({
      where: {
        clientId: session.user.id,
        trainerId,
        status: "PENDING",
      },
    })

    if (existing) {
      return { error: "You already have a pending hire request with this trainer." }
    }

    const hireReq = await prisma.hireRequest.create({
      data: {
        clientId: session.user.id,
        trainerId,
        message: message || "Interested in personal training services.",
        status: "PENDING",
      },
    })

    revalidatePath("/trainer/hire-requests")
    return { success: true, requestId: hireReq.id }
  } catch (err) {
    return { error: "Failed to submit hire request" }
  }
}

export async function respondHireRequest(requestId: string, status: "ACCEPTED" | "DECLINED") {
  const session = await auth()
  if (!session || (session.user.role !== "PERSONAL_TRAINER" && session.user.role !== "GYM_OWNER")) {
    return { error: "Unauthorized access" }
  }

  try {
    const req = await prisma.hireRequest.update({
      where: { id: requestId },
      data: { status },
      include: { client: true },
    })

    await prisma.auditLog.create({
      data: {
        gymId: session.user.gymId,
        actorId: session.user.id,
        action: `HIRE_REQUEST_${status}`,
        resource: "HireRequest",
        details: `Trainer ${session.user.fullName} ${status.toLowerCase()} hire request from ${req.client.fullName}`,
      },
    })

    revalidatePath("/trainer/hire-requests")
    revalidatePath("/trainer/clients")
    return { success: true }
  } catch (err) {
    return { error: "Failed to process hire request response" }
  }
}
