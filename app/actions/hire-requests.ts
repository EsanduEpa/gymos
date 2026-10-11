"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { createNotification } from "@/lib/notifications"
import { SessionStatus, RevenueCategory, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getTrainerHireRequests() {
  const session = await auth()
  if (!session || !session.user || session.user.role !== "PERSONAL_TRAINER") {
    return { error: "Unauthorized", requests: [] }
  }

  const trainerId = session.user.id

  try {
    const requests = await prisma.pTSession.findMany({
      where: {
        trainerId,
        status: SessionStatus.PENDING_CONFIRMATION,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            photo: true,
            sessionPacks: {
              where: { status: "ACTIVE", remainingSessions: { gt: 0 } },
              select: { id: true, remainingSessions: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    })

    return { requests }
  } catch (err) {
    console.error("Failed to fetch hire requests:", err)
    return { error: "Failed to fetch hire requests", requests: [] }
  }
}

export async function acceptHireRequest(sessionId: string, deductCredit: boolean = true) {
  const session = await auth()
  if (!session || !session.user || session.user.role !== "PERSONAL_TRAINER") {
    return { error: "Unauthorized" }
  }

  const trainerId = session.user.id

  try {
    const ptSession = await prisma.pTSession.findUnique({
      where: { id: sessionId },
      include: { client: true },
    })

    if (!ptSession) return { error: "Hire request not found" }
    if (ptSession.trainerId !== trainerId) return { error: "This request is not assigned to you" }
    if (ptSession.status !== SessionStatus.PENDING_CONFIRMATION) {
      return { error: `Cannot accept request with status ${ptSession.status}` }
    }

    // Atomically verify conflicts, deduct credit if applicable, and schedule
    const result = await prisma.$transaction(async (tx) => {
      // 1. Collision check
      const startMs = new Date(ptSession.scheduledAt).getTime()
      const endMs = startMs + ptSession.duration * 60000

      const candidateSessions = await tx.pTSession.findMany({
        where: {
          trainerId,
          status: { in: [SessionStatus.SCHEDULED, SessionStatus.ACTIVE] },
          id: { not: sessionId },
        },
        select: { id: true, scheduledAt: true, duration: true },
      })

      const hasCollision = candidateSessions.some((c) => {
        const cStart = new Date(c.scheduledAt).getTime()
        const cEnd = cStart + c.duration * 60000
        return startMs < cEnd && cStart < endMs
      })

      if (hasCollision) {
        return { error: "You already have a confirmed session scheduled during this time slot." }
      }

      // 2. Pack deduction (if active pack exists)
      if (deductCredit) {
        const activePack = await tx.sessionPack.findFirst({
          where: {
            userId: ptSession.clientId,
            status: "ACTIVE",
            remainingSessions: { gt: 0 },
          },
          orderBy: { expiryDate: "asc" },
        })

        if (activePack) {
          const newRemaining = activePack.remainingSessions - 1
          await tx.sessionPack.update({
            where: { id: activePack.id },
            data: {
              remainingSessions: newRemaining,
              status: newRemaining === 0 ? "EXHAUSTED" : "ACTIVE",
            },
          })

          await tx.revenueRecord.create({
            data: {
              gymId: ptSession.gymId,
              amount: ptSession.fee,
              category: RevenueCategory.PT_SESSION,
              description: `Session Pack deduction for accepted hire request (${ptSession.type})`,
            },
          })
        }
      }

      // 3. Mark session as SCHEDULED
      await tx.pTSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.SCHEDULED },
      })

      return { success: true as const }
    })

    if ("error" in result) return result

    // 4. Notifications & Audit
    await createNotification({
      recipientId: ptSession.clientId,
      type: "SESSION_BOOKED",
      title: "Hire Request Accepted!",
      message: `${session.user.fullName} accepted your request for ${new Date(ptSession.scheduledAt).toLocaleString()}`,
      linkUrl: "/member/sessions",
    })

    await logAudit({
      userId: session.user.id,
      gymId: ptSession.gymId,
      actionType: "HIRE_REQUEST_ACCEPTED",
      affectedRecordId: sessionId,
      details: { message: `Accepted hire request from ${ptSession.client.fullName}` },
    })

    revalidatePath("/trainer/hire-requests")
    revalidatePath("/trainer/schedule")
    revalidatePath("/member/sessions")
    revalidatePath("/member/dashboard")

    return { success: true }
  } catch (err) {
    console.error("Accept hire request error:", err)
    return { error: "Failed to accept hire request" }
  }
}

export async function declineHireRequest(sessionId: string, reason?: string) {
  const session = await auth()
  if (!session || !session.user || session.user.role !== "PERSONAL_TRAINER") {
    return { error: "Unauthorized" }
  }

  const trainerId = session.user.id

  try {
    const ptSession = await prisma.pTSession.findUnique({
      where: { id: sessionId },
      include: { client: true },
    })

    if (!ptSession) return { error: "Hire request not found" }
    if (ptSession.trainerId !== trainerId) return { error: "This request is not assigned to you" }
    if (ptSession.status !== SessionStatus.PENDING_CONFIRMATION) {
      return { error: `Cannot decline request with status ${ptSession.status}` }
    }

    await prisma.pTSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.DECLINED,
        notes: reason ? `${ptSession.notes || ""}\nDeclined: ${reason}`.trim() : ptSession.notes,
      },
    })

    await createNotification({
      recipientId: ptSession.clientId,
      type: "SESSION_DECLINED",
      title: "Hire Request Declined",
      message: `${session.user.fullName} was unable to accept your session request${reason ? `: ${reason}` : "."}`,
      linkUrl: "/member/sessions",
    })

    await logAudit({
      userId: session.user.id,
      gymId: ptSession.gymId,
      actionType: "HIRE_REQUEST_DECLINED",
      affectedRecordId: sessionId,
      details: { message: `Declined session request from ${ptSession.client.fullName}` },
    })

    revalidatePath("/trainer/hire-requests")
    revalidatePath("/trainer/schedule")
    revalidatePath("/member/sessions")

    return { success: true }
  } catch (err) {
    console.error("Decline hire request error:", err)
    return { error: "Failed to decline hire request" }
  }
}
