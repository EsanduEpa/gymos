"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SessionStatus, SessionType, ShiftStatus, RevenueCategory } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const bookSessionSchema = z.object({
  clientId: z.string().min(1, "Member is required"),
  trainerId: z.string().min(1, "Trainer is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  type: z.enum(["IN_PERSON", "VIRTUAL", "INTRODUCTORY"]),
  duration: z.coerce.number().default(60),
  notes: z.string().optional(),
})

export async function bookSession(formData: FormData) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  const gymId = session.user.gymId
  if (!gymId) return { error: "No gym assigned" }

  const raw = {
    clientId: formData.get("clientId") as string,
    trainerId: formData.get("trainerId") as string,
    date: formData.get("date") as string,
    time: formData.get("time") as string,
    type: (formData.get("type") as any) || "IN_PERSON",
    duration: formData.get("duration") || 60,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = bookSessionSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { clientId, trainerId, date, time, type, duration, notes } = validated.data
  const scheduledAt = new Date(`${date}T${time}:00`)

  // BR-018: Validate member session pack balance
  const activePack = await prisma.sessionPack.findFirst({
    where: {
      userId: clientId,
      status: "ACTIVE",
      remainingSessions: { gt: 0 },
    },
  })

  if (!activePack) {
    return { error: "No sessions remaining - purchase a pack (BR-018)" }
  }

  // BR-049: Validate trainer availability (no double booking within duration)
  const existingCollision = await prisma.pTSession.findFirst({
    where: {
      trainerId,
      scheduledAt: {
        gte: new Date(scheduledAt.getTime() - duration * 60000),
        lte: new Date(scheduledAt.getTime() + duration * 60000),
      },
      status: { in: ["SCHEDULED", "ACTIVE"] },
    },
  })

  if (existingCollision) {
    return { error: "Trainer is unavailable at this scheduled time (BR-049)" }
  }

  // Determine ShiftStatus (In-shift vs Off-shift)
  const trainer = await prisma.user.findUnique({ where: { id: trainerId } })
  let shiftStatus: ShiftStatus = "IN_SHIFT"
  if (trainer && trainer.shiftStart && trainer.shiftEnd) {
    const sessionHourStr = time.split(":")[0] + ":" + time.split(":")[1]
    if (sessionHourStr < trainer.shiftStart || sessionHourStr > trainer.shiftEnd) {
      shiftStatus = "OFF_SHIFT"
    }
  }

  try {
    const ptSession = await prisma.pTSession.create({
      data: {
        gymId,
        clientId,
        trainerId,
        scheduledAt,
        duration,
        type: type as SessionType,
        status: SessionStatus.SCHEDULED,
        shiftStatus,
        notes,
        fee: 50.0,
      },
    })

    await prisma.auditLog.create({
      data: {
        gymId,
        actorId: session.user.id,
        action: "BOOK_PT_SESSION",
        resource: "PTSession",
        details: `Booked ${type} session on ${date} at ${time}`,
      },
    })

    revalidatePath("/owner/sessions")
    revalidatePath("/trainer/schedule")
    return { success: true, sessionId: ptSession.id }
  } catch (err) {
    console.error("Book session error:", err)
    return { error: "Failed to book PT session" }
  }
}

export async function startSession(sessionId: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  const ptSession = await prisma.pTSession.findUnique({ where: { id: sessionId } })
  if (!ptSession) return { error: "Session not found" }

  if (ptSession.status !== "SCHEDULED") {
    return { error: `Cannot start session with status ${ptSession.status}` }
  }

  try {
    await prisma.pTSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.ACTIVE,
        startedAt: new Date(),
      },
    })

    revalidatePath("/owner/sessions")
    revalidatePath("/trainer/schedule")
    return { success: true }
  } catch (err) {
    return { error: "Failed to start session" }
  }
}

export async function endSession(sessionId: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  const ptSession = await prisma.pTSession.findUnique({
    where: { id: sessionId },
    include: { trainer: true, client: true, gym: true },
  })
  if (!ptSession) return { error: "Session not found" }

  if (ptSession.status !== "ACTIVE" && ptSession.status !== "SCHEDULED") {
    return { error: "Session is not active" }
  }

  // BR-010: Minimum session duration (default 20 mins)
  const minDuration = ptSession.gym?.minSessionDuration || 20
  const startedTime = ptSession.startedAt ? ptSession.startedAt.getTime() : Date.now() - 30 * 60000
  const elapsedMins = Math.round((Date.now() - startedTime) / 60000)

  if (elapsedMins < minDuration && ptSession.status === "ACTIVE") {
    return { error: `Minimum session duration (${minDuration} mins) not reached (BR-010)` }
  }

  try {
    // 1. Mark COMPLETED
    await prisma.pTSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        endedAt: new Date(),
      },
    })

    // 2. BR-011: Deduct 1 session from Member Session Pack
    const activePack = await prisma.sessionPack.findFirst({
      where: {
        userId: ptSession.clientId,
        status: "ACTIVE",
        remainingSessions: { gt: 0 },
      },
    })

    if (activePack) {
      const newRemaining = activePack.remainingSessions - 1
      await prisma.sessionPack.update({
        where: { id: activePack.id },
        data: {
          remainingSessions: newRemaining,
          status: newRemaining === 0 ? "EXHAUSTED" : "ACTIVE",
        },
      })
    }

    // 3. Create Revenue Record
    await prisma.revenueRecord.create({
      data: {
        gymId: ptSession.gymId,
        amount: ptSession.fee,
        category: RevenueCategory.PT_SESSION,
        description: `PT Session fee for client ${ptSession.client.fullName}`,
      },
    })

    // 4. BR-041 to BR-048: Calculate Trainer Pay
    const gym = ptSession.gym
    const trainerLevel = ptSession.trainer.trainerLevel
    const isLevel2 = trainerLevel === "LEVEL_2"
    const baseRate = isLevel2 ? gym.level2BaseRate : gym.level1BaseRate
    const offShiftBonus = ptSession.shiftStatus === "OFF_SHIFT" ? gym.offShiftPremium : 0
    const totalPayRate = baseRate + offShiftBonus
    const trainerPayAmount = ptSession.fee * totalPayRate

    // Get open PayPeriod
    let openPeriod = await prisma.payPeriod.findFirst({
      where: { gymId: ptSession.gymId, status: "OPEN" },
    })

    if (!openPeriod) {
      openPeriod = await prisma.payPeriod.create({
        data: {
          gymId: ptSession.gymId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 86400000),
          status: "OPEN",
        },
      })
    }

    await prisma.payRecord.create({
      data: {
        trainerId: ptSession.trainerId,
        payPeriodId: openPeriod.id,
        sessionId: ptSession.id,
        amount: trainerPayAmount,
        description: `PT Session completion pay (${(totalPayRate * 100).toFixed(0)}% rate)`,
      },
    })

    await prisma.auditLog.create({
      data: {
        gymId: ptSession.gymId,
        actorId: session.user.id,
        action: "COMPLETE_PT_SESSION",
        resource: "PTSession",
        details: `Completed PT Session ${sessionId}, deducted 1 pack session, paid trainer $${trainerPayAmount.toFixed(2)}`,
      },
    })

    revalidatePath("/owner/sessions")
    revalidatePath("/trainer/schedule")
    revalidatePath("/trainer/earnings")
    return { success: true }
  } catch (err) {
    console.error("End session error:", err)
    return { error: "Failed to complete PT session" }
  }
}

export async function handleNoShow(sessionId: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  const ptSession = await prisma.pTSession.findUnique({ where: { id: sessionId } })
  if (!ptSession) return { error: "Session not found" }

  try {
    // BR-013 & BR-046: Set MISSED, noShow=true, deduct pack session, 0 trainer pay
    await prisma.pTSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.MISSED,
        noShow: true,
      },
    })

    const activePack = await prisma.sessionPack.findFirst({
      where: {
        userId: ptSession.clientId,
        status: "ACTIVE",
        remainingSessions: { gt: 0 },
      },
    })

    if (activePack) {
      const newRemaining = activePack.remainingSessions - 1
      await prisma.sessionPack.update({
        where: { id: activePack.id },
        data: {
          remainingSessions: newRemaining,
          status: newRemaining === 0 ? "EXHAUSTED" : "ACTIVE",
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        gymId: ptSession.gymId,
        actorId: session.user.id,
        action: "NO_SHOW_SESSION",
        resource: "PTSession",
        details: `Marked session ${sessionId} as MISSED (No-Show). Deducted 1 pack session with $0 trainer pay.`,
      },
    })

    revalidatePath("/owner/sessions")
    revalidatePath("/trainer/schedule")
    return { success: true }
  } catch (err) {
    return { error: "Failed to log no-show session" }
  }
}

export async function cancelSession(sessionId: string, reason?: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  const ptSession = await prisma.pTSession.findUnique({
    where: { id: sessionId },
    include: { gym: true },
  })
  if (!ptSession) return { error: "Session not found" }

  // Check cancellation window
  const windowHours = ptSession.gym?.cancellationWindowHours || 24
  const hoursUntilSession = (ptSession.scheduledAt.getTime() - Date.now()) / (1000 * 3600)
  const isLateCancel = hoursUntilSession < windowHours

  try {
    await prisma.pTSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.CANCELLED,
        notes: reason ? `${ptSession.notes || ""}\nCancelled: ${reason}` : ptSession.notes,
      },
    })

    // BR-012 & BR-047: If late cancellation, deduct 1 session from pack with NO trainer pay
    if (isLateCancel) {
      const activePack = await prisma.sessionPack.findFirst({
        where: {
          userId: ptSession.clientId,
          status: "ACTIVE",
          remainingSessions: { gt: 0 },
        },
      })

      if (activePack) {
        const newRemaining = activePack.remainingSessions - 1
        await prisma.sessionPack.update({
          where: { id: activePack.id },
          data: {
            remainingSessions: newRemaining,
            status: newRemaining === 0 ? "EXHAUSTED" : "ACTIVE",
          },
        })
      }
    }

    await prisma.auditLog.create({
      data: {
        gymId: ptSession.gymId,
        actorId: session.user.id,
        action: "CANCEL_PT_SESSION",
        resource: "PTSession",
        details: `Cancelled session ${sessionId} (${isLateCancel ? "Late Cancellation - Deducted Pack" : "On-Time Cancellation"})`,
      },
    })

    revalidatePath("/owner/sessions")
    revalidatePath("/trainer/schedule")
    return { success: true, isLateCancel }
  } catch (err) {
    return { error: "Failed to cancel session" }
  }
}

export async function overrideSessionStatus(sessionId: string, status: SessionStatus) {
  const session = await auth()
  if (!session || session.user.role !== "GYM_OWNER") {
    return { error: "Unauthorized owner override" }
  }

  if (status === "COMPLETED") {
    return await endSession(sessionId)
  } else if (status === "MISSED") {
    return await handleNoShow(sessionId)
  } else if (status === "CANCELLED") {
    return await cancelSession(sessionId, "Owner Manual Override")
  }

  try {
    await prisma.pTSession.update({
      where: { id: sessionId },
      data: { status },
    })
    revalidatePath("/owner/sessions")
    return { success: true }
  } catch (err) {
    return { error: "Failed to override status" }
  }
}

export async function updateSessionNotes(sessionId: string, notes: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  try {
    await prisma.pTSession.update({
      where: { id: sessionId },
      data: { notes },
    })

    revalidatePath("/owner/sessions")
    revalidatePath("/trainer/schedule")
    return { success: true }
  } catch (err) {
    return { error: "Failed to update session notes" }
  }
}
