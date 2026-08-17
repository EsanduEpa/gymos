"use server"

import { prisma } from "@/lib/prisma"
import { authorizeOrThrow } from "@/lib/authz"
import { Role } from "@prisma/client"

export async function getOwnerDashboardData() {
  const { gymId } = await authorizeOrThrow([Role.GYM_OWNER, Role.SUPER_ADMIN])

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  // 1. Live Stats
  const membersInGymCount = await prisma.pTSession.count({
    where: {
      gymId,
      scheduledAt: { gte: startOfToday, lte: endOfToday },
      status: "ACTIVE",
    },
  })

  const activeSessionsCount = await prisma.pTSession.count({
    where: {
      gymId,
      status: "ACTIVE",
    },
  })

  const todayRevenues = await prisma.revenueRecord.aggregate({
    where: {
      gymId,
      createdAt: { gte: startOfToday, lte: endOfToday },
    },
    _sum: { amount: true },
  })
  const todayRevenue = todayRevenues._sum.amount || 0

  const trainersScheduledToday = await prisma.pTSession.findMany({
    where: {
      gymId,
      scheduledAt: { gte: startOfToday, lte: endOfToday },
    },
    select: { trainerId: true },
    distinct: ["trainerId"],
  })
  const trainersOnFloorCount = trainersScheduledToday.length

  // 2. Today's Sessions Panel
  const todaySessions = await prisma.pTSession.findMany({
    where: {
      gymId,
      scheduledAt: { gte: startOfToday, lte: endOfToday },
    },
    include: {
      client: { select: { fullName: true, photo: true } },
      trainer: { select: { fullName: true } },
    },
    orderBy: { scheduledAt: "asc" },
  })

  // 3. Hourly Revenue Today Area Chart
  const todayRevenueRecords = await prisma.revenueRecord.findMany({
    where: {
      gymId,
      createdAt: { gte: startOfToday, lte: endOfToday },
    },
    orderBy: { createdAt: "asc" },
  })

  const hourlyMap: Record<number, number> = {}
  for (let i = 6; i <= 22; i += 2) {
    hourlyMap[i] = 0
  }

  let runningTotal = 0
  todayRevenueRecords.forEach((rec) => {
    const hour = new Date(rec.createdAt).getHours()
    const bucket = Math.floor(hour / 2) * 2
    if (hourlyMap[bucket] !== undefined) {
      hourlyMap[bucket] += rec.amount
    }
  })

  const hourlyRevenueData = Object.entries(hourlyMap).map(([hourStr, amount]) => {
    const h = parseInt(hourStr)
    const label = h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`
    runningTotal += amount
    return {
      time: label,
      revenue: runningTotal,
    }
  })

  // 4. Alerts Panel
  // Pack Expiry: <= 2 sessions remaining
  const lowPacks = await prisma.sessionPack.findMany({
    where: {
      status: "ACTIVE",
      remainingSessions: { lte: 2 },
      user: { gymId },
    },
    include: {
      user: { select: { fullName: true } },
    },
    take: 5,
  })

  const noShowsToday = await prisma.pTSession.findMany({
    where: {
      gymId,
      scheduledAt: { gte: startOfToday, lte: endOfToday },
      status: "MISSED",
    },
    include: {
      client: { select: { fullName: true } },
      trainer: { select: { fullName: true } },
    },
  })

  // 5. Trainer Performance Cards
  const trainers = await prisma.user.findMany({
    where: {
      gymId,
      role: "PERSONAL_TRAINER",
    },
    include: {
      sessionsTrainer: {
        where: {
          scheduledAt: { gte: startOfWeek },
        },
      },
    },
  })

  const trainerPerformance = trainers.map((t) => {
    const sessionsToday = t.sessionsTrainer.filter(
      (s) => new Date(s.scheduledAt) >= startOfToday && new Date(s.scheduledAt) <= endOfToday
    ).length

    const sessionsWeek = t.sessionsTrainer.length
    const revenueWeek = t.sessionsTrainer
      .filter((s) => s.status === "COMPLETED")
      .reduce((sum, s) => sum + s.fee, 0)

    const hasActiveSessionNow = t.sessionsTrainer.some((s) => s.status === "ACTIVE")

    return {
      id: t.id,
      fullName: t.fullName,
      trainerLevel: t.trainerLevel,
      sessionsToday,
      sessionsWeek,
      revenueWeek,
      status: hasActiveSessionNow ? "In session" : sessionsToday > 0 ? "On floor" : "Off duty",
    }
  })

  return {
    stats: {
      membersInGymCount,
      activeSessionsCount,
      todayRevenue,
      trainersOnFloorCount,
    },
    todaySessions,
    hourlyRevenueData,
    alerts: {
      lowPacks,
      noShowsToday,
    },
    trainerPerformance,
  }
}
