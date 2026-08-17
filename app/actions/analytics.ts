"use server"

import { prisma } from "@/lib/prisma"
import { authorizeOrThrow } from "@/lib/authz"
import { Role } from "@prisma/client"

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
    // Assume 20 working days in 30 days * 8 hours = 160 available hours
    const availableHours = 160
    const idleHours = Math.max(0, availableHours - totalHoursScheduled)

    return {
      name: t.fullName.split(" ")[0],
      scheduled: Math.round(totalHoursScheduled),
      idle: Math.round(idleHours),
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
