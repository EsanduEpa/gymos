"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { createNotification } from "@/lib/notifications"
import { authorize, getEffectiveGymId } from "@/lib/authz"
import { resolveSessionFee, round2, trainerPayFor } from "@/lib/pricing"
import { Role, SessionStatus, SessionType, ShiftStatus, TrainerLevel } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { RevenueCategory } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type SessionActor = { id: string; role: string; gymId?: string | null }
type SessionForAuth = { gymId: string; trainerId: string; clientId: string }

// Every mutation on a PTSession must confirm the caller is actually a party
// to that session (or an owner/admin scoped to its gym) — this is the
// privacy boundary the direct-booking flow depends on.
//
// `effectiveGymId` is the gym the caller is acting within, which for a super
// admin means the gym they have selected. Comparing against it rather than
// waving super admins through keeps platform support inside the tenant they
// chose, so a mistaken click cannot land on another gym's session.
async function authorizeSessionActor(
  ptSession: SessionForAuth,
  user: SessionActor,
  allowed: { client?: boolean; trainer?: boolean; owner?: boolean }
) {
  if (allowed.owner && (user.role === "GYM_OWNER" || user.role === "SUPER_ADMIN")) {
    const effectiveGymId = await getEffectiveGymId(user.role as Role, user.gymId)
    if (effectiveGymId && effectiveGymId === ptSession.gymId) return true
  }
  if (allowed.trainer && user.role === "PERSONAL_TRAINER" && user.id === ptSession.trainerId) return true
  if (allowed.client && user.role === "GYM_MEMBER" && user.id === ptSession.clientId) return true
  return false
}

function intervalsOverlap(aStart: number, aDuration: number, bStart: number, bDuration: number) {
  const aEnd = aStart + aDuration * 60000
  const bEnd = bStart + bDuration * 60000
  return aStart < bEnd && bStart < aEnd
}

// BR-049: a trainer can only be in one confirmed (SCHEDULED/ACTIVE) session at
// a time. Compares against both sessions' durations, not just the new one's.
async function findTrainerCollision(
  client: Prisma.TransactionClient | typeof prisma,
  trainerId: string,
  scheduledAt: Date,
  duration: number,
  excludeSessionId?: string
) {
  const candidates = await client.pTSession.findMany({
    where: {
      trainerId,
      status: { in: ["SCHEDULED", "ACTIVE"] },
      ...(excludeSessionId ? { id: { not: excludeSessionId } } : {}),
    },
    select: { id: true, scheduledAt: true, duration: true },
  })

  return (
    candidates.find((c) =>
      intervalsOverlap(scheduledAt.getTime(), duration, c.scheduledAt.getTime(), c.duration)
    ) || null
  )
}

// Blocks a client from stacking multiple pending/confirmed requests with the
// same trainer for overlapping times.
async function findOverlappingClientTrainerRequest(
  clientId: string,
  trainerId: string,
  scheduledAt: Date,
  duration: number
) {
  const candidates = await prisma.pTSession.findMany({
    where: {
      clientId,
      trainerId,
      status: { in: ["PENDING_CONFIRMATION", "SCHEDULED", "ACTIVE"] },
    },
    select: { id: true, scheduledAt: true, duration: true },
  })

  return (
    candidates.find((c) =>
      intervalsOverlap(scheduledAt.getTime(), duration, c.scheduledAt.getTime(), c.duration)
    ) || null
  )
}

function revalidateSessionPaths() {
  revalidatePath("/owner/sessions")
  revalidatePath("/trainer/schedule")
  revalidatePath("/member/sessions")
}

function computeShiftStatus(time: string, shiftStart?: string | null, shiftEnd?: string | null): ShiftStatus {
  if (!shiftStart || !shiftEnd) return "IN_SHIFT"
  return time < shiftStart || time > shiftEnd ? "OFF_SHIFT" : "IN_SHIFT"
}

// Price is snapshotted onto the session at booking so later rate-card edits
// never re-price a booked session. See docs/revenue-model.md.
async function resolveFeeForBooking(
  gymId: string,
  opts: {
    type: SessionType
    trainerLevel: TrainerLevel | null
    pack: { price: number | null; totalSessions: number } | null
  }
) {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { defaultSessionFee: true, level2SessionFee: true, introSessionFee: true },
  })
  if (!gym) throw new Error("Gym not found while pricing session")
  return round2(resolveSessionFee(gym, opts))
}

/**
 * Consuming a pack credit and recognizing the revenue it was holding.
 *
 * Completion, no-show and late cancellation all land here: in every one the
 * member has spent the credit and the gym keeps the money. Doing the two
 * together in one transaction is what keeps `deferred + recognized` equal to
 * what the member paid — previously a no-show burned the credit and recorded
 * no revenue, so the money simply left the books.
 */
async function consumePackCredit(
  tx: Prisma.TransactionClient,
  ptSession: { id: string; gymId: string; clientId: string; fee: number },
  reason: string
) {
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
  }

  await tx.revenueRecord.create({
    data: {
      gymId: ptSession.gymId,
      amount: ptSession.fee,
      category: RevenueCategory.PT_SESSION,
      description: reason,
    },
  })

  return activePack
}

const bookSessionSchema = z.object({
  clientId: z.string().min(1, "Member is required"),
  trainerId: z.string().min(1, "Trainer is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  type: z.enum(["IN_PERSON", "VIRTUAL", "INTRODUCTORY"]),
  duration: z.coerce.number().default(60),
  notes: z.string().optional(),
})

// Staff-assisted booking (walk-ins/phone bookings). Owner-only, skips the
// confirmation dance and goes straight to SCHEDULED.
export async function bookSession(formData: FormData) {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const raw = {
    clientId: formData.get("clientId") as string,
    trainerId: formData.get("trainerId") as string,
    date: formData.get("date") as string,
    time: formData.get("time") as string,
    type: (formData.get("type") as SessionType | null) || "IN_PERSON",
    duration: formData.get("duration") || 60,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = bookSessionSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { clientId, trainerId, date, time, type, duration, notes } = validated.data
  const scheduledAt = new Date(`${date}T${time}:00`)

  const trainer = await prisma.user.findFirst({
    where: { id: trainerId, gymId, role: "PERSONAL_TRAINER" },
  })
  if (!trainer) return { error: "Trainer not found at your gym" }

  const client = await prisma.user.findFirst({
    where: { id: clientId, gymId, role: "GYM_MEMBER" },
  })
  if (!client) return { error: "Member not found at your gym" }

  // BR-018: Validate member session pack balance
  const activePack = await prisma.sessionPack.findFirst({
    where: { userId: clientId, status: "ACTIVE", remainingSessions: { gt: 0 } },
    orderBy: { expiryDate: "asc" },
  })
  if (!activePack) {
    return { error: "No sessions remaining - purchase a pack (BR-018)" }
  }

  const collision = await findTrainerCollision(prisma, trainerId, scheduledAt, duration)
  if (collision) {
    return { error: "Trainer is unavailable at this scheduled time (BR-049)" }
  }

  const shiftStatus = computeShiftStatus(time, trainer.shiftStart, trainer.shiftEnd)
  const fee = await resolveFeeForBooking(gymId, {
    type: type as SessionType,
    trainerLevel: trainer.trainerLevel,
    pack: activePack,
  })

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
        fee,
      },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "SESSION_CREATED",
      affectedRecordId: ptSession.id,
      details: { message: `Owner booked ${type} session on ${date} at ${time}` },
    })

    revalidateSessionPaths()
    return { success: true, sessionId: ptSession.id }
  } catch (err) {
    console.error("Book session error:", err)
    return { error: "Failed to book PT session" }
  }
}

const requestSessionSchema = z.object({
  trainerId: z.string().min(1, "Trainer is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  type: z.enum(["IN_PERSON", "VIRTUAL", "INTRODUCTORY"]),
  duration: z.coerce.number().default(60),
  notes: z.string().optional(),
})

// Member-initiated request. Creates a PENDING_CONFIRMATION session; the
// trainer must accept before it counts as booked. This IS the hire
// mechanism now — no separate step establishes the trainer-client link.
export async function requestSession(formData: FormData) {
  const auth = await authorize([Role.GYM_MEMBER])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const raw = {
    trainerId: formData.get("trainerId") as string,
    date: formData.get("date") as string,
    time: formData.get("time") as string,
    type: (formData.get("type") as SessionType | null) || "IN_PERSON",
    duration: formData.get("duration") || 60,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = requestSessionSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { trainerId, date, time, type, duration, notes } = validated.data
  // Never trust a client-supplied id for who the request is from.
  const clientId = auth.userId
  const scheduledAt = new Date(`${date}T${time}:00`)

  if (scheduledAt.getTime() < Date.now()) {
    return { error: "Cannot request a session in the past" }
  }

  const trainer = await prisma.user.findFirst({
    where: { id: trainerId, gymId, role: "PERSONAL_TRAINER", trainerStatus: "ACTIVE" },
  })
  if (!trainer) return { error: "Trainer not found at your gym" }

  // BR-018: Validate member session pack balance
  const activePack = await prisma.sessionPack.findFirst({
    where: { userId: clientId, status: "ACTIVE", remainingSessions: { gt: 0 } },
    orderBy: { expiryDate: "asc" },
  })
  if (!activePack) {
    return { error: "No sessions remaining - purchase a pack (BR-018)" }
  }

  const duplicateRequest = await findOverlappingClientTrainerRequest(clientId, trainerId, scheduledAt, duration)
  if (duplicateRequest) {
    return { error: "You already have a pending or scheduled session with this trainer at an overlapping time" }
  }

  // Early collision check to fail fast — re-checked again when the trainer accepts.
  const collision = await findTrainerCollision(prisma, trainerId, scheduledAt, duration)
  if (collision) {
    return { error: "Trainer is unavailable at this scheduled time (BR-049)" }
  }

  const shiftStatus = computeShiftStatus(time, trainer.shiftStart, trainer.shiftEnd)
  const fee = await resolveFeeForBooking(gymId, {
    type: type as SessionType,
    trainerLevel: trainer.trainerLevel,
    pack: activePack,
  })

  try {
    const ptSession = await prisma.pTSession.create({
      data: {
        gymId,
        clientId,
        trainerId,
        scheduledAt,
        duration,
        type: type as SessionType,
        status: SessionStatus.PENDING_CONFIRMATION,
        shiftStatus,
        notes,
        fee,
      },
    })

    await createNotification({
      recipientId: trainerId,
      type: "HIRE_REQUEST",
      title: "New Session Request",
      message: `${auth.fullName} requested a ${type.toLowerCase().replace("_", " ")} session on ${date} at ${time}`,
      linkUrl: "/trainer/schedule",
    })

    await logAudit({
      userId: clientId,
      gymId,
      actionType: "SESSION_CREATED",
      affectedRecordId: ptSession.id,
      details: { message: `${auth.fullName} requested a session with trainer ${trainer.fullName} on ${date} at ${time}` },
    })

    revalidateSessionPaths()
    return { success: true, sessionId: ptSession.id }
  } catch (err) {
    console.error("Request session error:", err)
    return { error: "Failed to submit session request" }
  }
}

// Trainer responds to a pending request. Accept re-runs the collision check
// inside a transaction (another request may have been confirmed meanwhile).
export async function respondToSessionRequest(sessionId: string, decision: "ACCEPT" | "DECLINE", reason?: string) {
  const session = await auth()
  if (!session || !session.user || session.user.role !== "PERSONAL_TRAINER") {
    return { error: "Unauthorized" }
  }

  const ptSession = await prisma.pTSession.findUnique({
    where: { id: sessionId },
    include: { client: true },
  })
  if (!ptSession) return { error: "Session request not found" }

  if (ptSession.trainerId !== session.user.id) {
    return { error: "This request is not addressed to you" }
  }

  if (ptSession.status !== "PENDING_CONFIRMATION") {
    return { error: `Cannot respond to a request with status ${ptSession.status}` }
  }

  if (decision === "DECLINE") {
    try {
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
        title: "Session Request Declined",
        message: `${session.user.fullName} declined your session request${reason ? `: ${reason}` : "."}`,
        linkUrl: "/member/sessions",
      })

      await logAudit({
        userId: session.user.id,
        gymId: ptSession.gymId,
        actionType: "HIRE_REQUEST_DECLINED",
        affectedRecordId: sessionId,
        details: { message: `Declined session request from ${ptSession.client.fullName}` },
      })

      revalidateSessionPaths()
      return { success: true }
    } catch (err) {
      console.error("Decline session request error:", err)
      return { error: "Failed to decline session request" }
    }
  }

  // ACCEPT — re-check collision and confirm atomically.
  try {
    const result = await prisma.$transaction(async (tx) => {
      const collision = await findTrainerCollision(
        tx,
        ptSession.trainerId,
        ptSession.scheduledAt,
        ptSession.duration,
        sessionId
      )
      if (collision) {
        return { error: "You now have a conflicting confirmed session at this time — decline this request or resolve the conflict first (BR-049)" }
      }

      await tx.pTSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.SCHEDULED },
      })

      return { success: true as const }
    })

    if ("error" in result) return result

    await createNotification({
      recipientId: ptSession.clientId,
      type: "SESSION_BOOKED",
      title: "Session Confirmed",
      message: `${session.user.fullName} accepted your session request for ${ptSession.scheduledAt.toLocaleString()}`,
      linkUrl: "/member/sessions",
    })

    await logAudit({
      userId: session.user.id,
      gymId: ptSession.gymId,
      actionType: "HIRE_REQUEST_ACCEPTED",
      affectedRecordId: sessionId,
      details: { message: `Accepted session request from ${ptSession.client.fullName}` },
    })

    revalidateSessionPaths()
    return { success: true }
  } catch (err) {
    console.error("Accept session request error:", err)
    return { error: "Failed to accept session request" }
  }
}

export async function startSession(sessionId: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  const ptSession = await prisma.pTSession.findUnique({ where: { id: sessionId } })
  if (!ptSession) return { error: "Session not found" }

  if (!(await authorizeSessionActor(ptSession, session.user, { trainer: true, owner: true }))) {
    return { error: "Not authorized to modify this session" }
  }

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

    revalidateSessionPaths()
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

  if (!(await authorizeSessionActor(ptSession, session.user, { trainer: true, owner: true }))) {
    return { error: "Not authorized to modify this session" }
  }

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

  const gym = ptSession.gym

  try {
    // Completing a session moves money in three places: the pack loses a
    // credit, revenue is recognized, and the trainer is owed. All of it in one
    // transaction — a partial failure used to leave a completed session with a
    // burned credit, no revenue and an unpaid trainer, with nothing to show it.
    const trainerPay = await prisma.$transaction(async (tx) => {
      await tx.pTSession.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.COMPLETED,
          endedAt: new Date(),
        },
      })

      // BR-011: consume a credit and recognize what it was holding.
      await consumePackCredit(
        tx,
        ptSession,
        `PT session completed — ${ptSession.client.fullName} with ${ptSession.trainer.fullName}`
      )

      // BR-041 to BR-048: trainer earns a share of the fee actually charged.
      const pay = trainerPayFor(ptSession.fee, {
        trainerLevel: ptSession.trainer.trainerLevel,
        offShift: ptSession.shiftStatus === "OFF_SHIFT",
        level1BaseRate: gym.level1BaseRate,
        level2BaseRate: gym.level2BaseRate,
        offShiftPremium: gym.offShiftPremium,
      })

      let openPeriod = await tx.payPeriod.findFirst({
        where: { gymId: ptSession.gymId, status: "OPEN" },
      })

      if (!openPeriod) {
        openPeriod = await tx.payPeriod.create({
          data: {
            gymId: ptSession.gymId,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 86400000),
            status: "OPEN",
          },
        })
      }

      await tx.payRecord.create({
        data: {
          trainerId: ptSession.trainerId,
          payPeriodId: openPeriod.id,
          sessionId: ptSession.id,
          amount: pay.amount,
          description: `PT session completion pay (${(pay.rate * 100).toFixed(0)}% of $${ptSession.fee.toFixed(2)})`,
        },
      })

      return pay
    })

    await logAudit({
      userId: session.user.id,
      gymId: ptSession.gymId,
      actionType: "SESSION_OVERRIDDEN",
      affectedRecordId: sessionId,
      details: {
        message: `Completed PT session ${sessionId}. Recognised $${ptSession.fee.toFixed(2)}, deducted 1 pack credit, paid trainer $${trainerPay.amount.toFixed(2)}`,
      },
    })

    revalidatePath("/owner/sessions")
    revalidatePath("/trainer/schedule")
    revalidatePath("/trainer/earnings")
    revalidatePath("/member/sessions")
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

  if (!(await authorizeSessionActor(ptSession, session.user, { trainer: true, owner: true }))) {
    return { error: "Not authorized to modify this session" }
  }

  try {
    // BR-013 & BR-046: MISSED, credit deducted, no trainer pay. The member
    // forfeits the session and the gym keeps the money, so the revenue is
    // earned — recognising it is what stops the burnt credit vanishing from
    // the books entirely.
    await prisma.$transaction(async (tx) => {
      await tx.pTSession.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.MISSED,
          noShow: true,
        },
      })

      await consumePackCredit(
        tx,
        ptSession,
        `PT session no-show — credit forfeited (session ${sessionId})`
      )
    })

    await logAudit({
      userId: session.user.id,
      gymId: ptSession.gymId,
      actionType: "SESSION_CANCELLED",
      affectedRecordId: sessionId,
      details: {
        message: `Marked session ${sessionId} as MISSED (no-show). Recognised $${ptSession.fee.toFixed(2)}, deducted 1 pack credit, $0 trainer pay.`,
      },
    })

    revalidateSessionPaths()
    return { success: true }
  } catch (err) {
    console.error("No-show error:", err)
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

  if (!(await authorizeSessionActor(ptSession, session.user, { client: true, trainer: true, owner: true }))) {
    return { error: "Not authorized to modify this session" }
  }

  if (ptSession.status !== "PENDING_CONFIRMATION" && ptSession.status !== "SCHEDULED") {
    return { error: `Cannot cancel a session with status ${ptSession.status}` }
  }

  // Only a previously-confirmed session is subject to the late-cancellation
  // pack deduction — withdrawing a still-pending request never costs a session.
  const wasConfirmed = ptSession.status === "SCHEDULED"
  const windowHours = ptSession.gym?.cancellationWindowHours || 24
  const hoursUntilSession = (ptSession.scheduledAt.getTime() - Date.now()) / (1000 * 3600)
  const isLateCancel = wasConfirmed && hoursUntilSession < windowHours

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pTSession.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.CANCELLED,
          notes: reason ? `${ptSession.notes || ""}\nCancelled: ${reason}` : ptSession.notes,
        },
      })

      // BR-012 & BR-047: a late cancellation costs the credit and earns the
      // gym the fee, with no trainer pay. An on-time one costs nothing, so
      // nothing is recognised.
      if (isLateCancel) {
        await consumePackCredit(
          tx,
          ptSession,
          `PT session cancelled late — credit forfeited (session ${sessionId})`
        )
      }
    })

    await logAudit({
      userId: session.user.id,
      gymId: ptSession.gymId,
      actionType: "SESSION_CANCELLED",
      affectedRecordId: sessionId,
      details: {
        message: isLateCancel
          ? `Cancelled session ${sessionId} late. Recognised $${ptSession.fee.toFixed(2)}, deducted 1 pack credit, $0 trainer pay.`
          : `Cancelled session ${sessionId} on time. No credit deducted.`,
      },
    })

    revalidateSessionPaths()
    return { success: true, isLateCancel }
  } catch (err) {
    return { error: "Failed to cancel session" }
  }
}

export async function overrideSessionStatus(sessionId: string, status: SessionStatus) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  const ptSession = await prisma.pTSession.findUnique({ where: { id: sessionId } })
  if (!ptSession) return { error: "Session not found" }

  if (!(await authorizeSessionActor(ptSession, session.user, { owner: true }))) {
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
    revalidateSessionPaths()
    return { success: true }
  } catch (err) {
    return { error: "Failed to override status" }
  }
}

export async function updateSessionNotes(sessionId: string, notes: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Unauthorized" }

  const ptSession = await prisma.pTSession.findUnique({ where: { id: sessionId } })
  if (!ptSession) return { error: "Session not found" }

  if (!(await authorizeSessionActor(ptSession, session.user, { trainer: true, owner: true }))) {
    return { error: "Not authorized to modify this session" }
  }

  try {
    await prisma.pTSession.update({
      where: { id: sessionId },
      data: { notes },
    })

    revalidateSessionPaths()
    return { success: true }
  } catch (err) {
    return { error: "Failed to update session notes" }
  }
}
