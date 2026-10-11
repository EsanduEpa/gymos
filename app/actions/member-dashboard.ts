"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MemberStatus } from "@prisma/client"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type MembershipInfo = {
  planName: string
  startDate: Date | null
  endDate: Date | null
  status: MemberStatus | "NONE"
  daysUntilExpiry: number | null
}

export type SessionPackInfo = {
  packId: string | null
  totalSessions: number
  remainingSessions: number
  purchaseDate: Date | null
  expiryDate: Date | null
  status: string | null
}

export type UpcomingSession = {
  id: string
  scheduledAt: Date
  trainerName: string
  sessionType: string
  status: string
}

export type RecentSession = {
  id: string
  scheduledAt: Date
  trainerName: string
  sessionType: string
  status: string
}

export type MemberDashboardData = {
  userId: string
  fullName: string
  photo: string | null
  membership: MembershipInfo
  sessionPack: SessionPackInfo
  upcomingSessions: UpcomingSession[]
  recentSessions: RecentSession[]
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function daysUntil(date: Date | null): number | null {
  if (!date) return null
  const diffMs = date.getTime() - Date.now()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// ─────────────────────────────────────────────
// Main Fetcher
// ─────────────────────────────────────────────

export async function getMemberDashboardData(): Promise<MemberDashboardData | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = session.user.id

  // Single DB query — all data via relations
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      photo: true,
      // Latest membership (most recently started)
      memberships: {
        orderBy: { startDate: "desc" },
        take: 1,
        select: {
          startDate: true,
          endDate: true,
          status: true,
          plan: { select: { name: true } },
        },
      },
      // Active session pack (oldest first so the one being consumed shows)
      sessionPacks: {
        where: { status: "ACTIVE" },
        orderBy: { purchaseDate: "asc" },
        take: 1,
        select: {
          id: true,
          totalSessions: true,
          remainingSessions: true,
          purchaseDate: true,
          expiryDate: true,
          status: true,
        },
      },
      // Upcoming sessions
      sessionsClient: {
        where: {
          status: { in: ["SCHEDULED", "PENDING_CONFIRMATION"] },
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
        select: {
          id: true,
          scheduledAt: true,
          type: true,
          status: true,
          trainer: { select: { fullName: true } },
        },
      },
    },
  })

  if (!user) return null

  // ── Membership ───────────────────────────────
  const rawMem = user.memberships[0] ?? null
  const membership: MembershipInfo = rawMem
    ? {
        planName: rawMem.plan.name,
        startDate: rawMem.startDate,
        endDate: rawMem.endDate,
        status: rawMem.status,
        daysUntilExpiry: daysUntil(rawMem.endDate),
      }
    : { planName: "No Active Plan", startDate: null, endDate: null, status: "NONE", daysUntilExpiry: null }

  // ── Session Pack ─────────────────────────────
  const rawPack = user.sessionPacks[0] ?? null
  const sessionPack: SessionPackInfo = rawPack
    ? {
        packId: rawPack.id,
        totalSessions: rawPack.totalSessions,
        remainingSessions: rawPack.remainingSessions,
        purchaseDate: rawPack.purchaseDate,
        expiryDate: rawPack.expiryDate,
        status: rawPack.status,
      }
    : {
        packId: null,
        totalSessions: 0,
        remainingSessions: 0,
        purchaseDate: null,
        expiryDate: null,
        status: null,
      }

  // ── Upcoming & Recent Sessions ───────────────
  const upcomingSessions: UpcomingSession[] = user.sessionsClient.map((s) => ({
    id: s.id,
    scheduledAt: s.scheduledAt,
    trainerName: s.trainer?.fullName ?? "Trainer",
    sessionType: s.type,
    status: s.status,
  }))

  // Also grab last 3 completed/missed for context
  const pastRaw = await prisma.pTSession.findMany({
    where: {
      clientId: userId,
      status: { in: ["COMPLETED", "MISSED", "CANCELLED"] },
    },
    orderBy: { scheduledAt: "desc" },
    take: 3,
    select: {
      id: true,
      scheduledAt: true,
      type: true,
      status: true,
      trainer: { select: { fullName: true } },
    },
  })

  const recentSessions: RecentSession[] = pastRaw.map((s) => ({
    id: s.id,
    scheduledAt: s.scheduledAt,
    trainerName: s.trainer?.fullName ?? "Trainer",
    sessionType: s.type,
    status: s.status,
  }))

  return {
    userId: user.id,
    fullName: user.fullName,
    photo: user.photo,
    membership,
    sessionPack,
    upcomingSessions,
    recentSessions,
  }
}

