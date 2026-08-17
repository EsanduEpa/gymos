"use server"

import { prisma } from "@/lib/prisma"
import { authorizeOrThrow } from "@/lib/authz"
import { Role } from "@prisma/client"

/** Working days in a 30-day window — five-day weeks, so roughly 22. */
const WORKING_DAYS_PER_MONTH = 22

/**
 * Hours in a trainer's daily shift, from the "HH:MM" strings on their record.
 * Falls back to eight hours when a shift has not been set, which is the same
 * default the trainer form applies.
 */
function shiftLengthHours(start: string | null, end: string | null) {
  if (!start || !end) return 8

  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 8

  const minutes = eh * 60 + em - (sh * 60 + sm)
  // A shift crossing midnight wraps into the next day.
  const spanned = minutes > 0 ? minutes : minutes + 24 * 60
  return spanned / 60
}

export async function getAnalyticsData() {
  const { gymId } = await authorizeOrThrow([Role.GYM_OWNER, Role.SUPER_ADMIN])

  const now = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // 1. Trainer Utilisation
  const trainers = await prisma.user.findMany({
    where: { gymId, role: "PERSONAL_TRAINER" },
    include: {
      sessionsTrainer: {
        where: {
          scheduledAt: { gte: thirtyDaysAgo },
        },
      },
    },
  })

  const trainerUtilisationData = trainers.map((t) => {
    const totalHoursScheduled = t.sessionsTrainer.reduce((sum, s) => sum + s.duration / 60, 0)

    // Capacity comes from the trainer's own shift, not a blanket assumption.
    // Every trainer was previously measured against a hardcoded 160 hours,
    // which made a part-timer look permanently idle and a full-timer's
    // utilisation meaningless.
    const shiftHours = shiftLengthHours(t.shiftStart, t.shiftEnd)
    const availableHours = shiftHours * WORKING_DAYS_PER_MONTH
    const idleHours = Math.max(0, availableHours - totalHoursScheduled)

    return {
      name: t.fullName.split(" ")[0],
      scheduled: Math.round(totalHoursScheduled),
      idle: Math.round(idleHours),
      availableHours: Math.round(availableHours),
      utilisation:
        availableHours > 0
          ? Math.min(100, Math.round((totalHoursScheduled / availableHours) * 100))
          : 0,
    }
  })

  // 2. Member Attendance Report (Peak Hours)
  const pastSessions = await prisma.pTSession.findMany({
    where: {
      gymId,
      scheduledAt: { gte: thirtyDaysAgo },
    },
  })

  const hourCounts: Record<number, number> = {}
  for (let h = 6; h <= 20; h++) {
    hourCounts[h] = 0
  }

  pastSessions.forEach((s) => {
    const h = new Date(s.scheduledAt).getHours()
    if (hourCounts[h] !== undefined) {
      hourCounts[h] += 1
    }
  })

  const peakHoursData = Object.entries(hourCounts).map(([hourStr, count]) => {
    const h = parseInt(hourStr)
    const label = h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`
    return {
      hour: label,
      avgSessions: Math.round((count / 30) * 10) / 10 || count,
    }
  })

  // 3. New Member Growth (Last 6 Months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const members = await prisma.user.findMany({
    where: {
      gymId,
      role: "GYM_MEMBER",
      createdAt: { gte: sixMonthsAgo },
    },
  })

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthCounts: Record<string, number> = {}

  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`
    monthCounts[key] = 0
  }

  members.forEach((m) => {
    const d = new Date(m.createdAt)
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`
    if (monthCounts[key] !== undefined) {
      monthCounts[key] += 1
    }
  })

  const memberGrowthData = Object.entries(monthCounts).map(([month, count]) => ({
    month,
    newMembers: count,
  }))

  return {
    trainerUtilisationData,
    peakHoursData,
    memberGrowthData,
  }
}
