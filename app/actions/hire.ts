"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function createHireRequest(trainerId: string, message?: string) {
  const session = await auth()
  if (!session || session.user.role !== "GYM_MEMBER") {
    return { error: "Only gym members can request to hire personal trainers" }
  }

  try {
    const existing = await prisma.hireRequest.findFirst({
      where: {
        clientId: session.user.id,
        trainerId,
        status: "PENDING",
      },
    })

    if (existing) {
      return { error: "You already have a pending hire request with this trainer" }
    }

    const request = await prisma.hireRequest.create({
      data: {
        clientId: session.user.id,
        trainerId,
        message,
        status: "PENDING",
      },
    })

    revalidatePath("/trainer/hire-requests")
    return { success: true, request }
  } catch (err) {
    console.error("Failed to create hire request:", err)
    return { error: "Failed to submit hire request" }
  }
}

export async function respondHireRequest(requestId: string, status: "ACCEPTED" | "DECLINED") {
  const session = await auth()
  if (!session || (session.user.role !== "PERSONAL_TRAINER" && session.user.role !== "GYM_OWNER")) {
    return { error: "Unauthorized access" }
  }

  const gymId = session.user.gymId || ""

  try {
    const req = await prisma.hireRequest.update({
      where: { id: requestId },
      data: { status },
      include: { client: true },
    })

    if (gymId) {
      await logAudit({
        userId: session.user.id,
        gymId,
        actionType: status === "ACCEPTED" ? "HIRE_REQUEST_ACCEPTED" : "HIRE_REQUEST_DECLINED",
        affectedRecordId: requestId,
        details: { message: `Trainer ${session.user.fullName} ${status.toLowerCase()} hire request from ${req.client.fullName}` },
      })
    }

    revalidatePath("/trainer/hire-requests")
    return { success: true }
  } catch (err) {
    console.error("Failed to respond to hire request:", err)
    return { error: "Failed to update hire request status" }
  }
}
