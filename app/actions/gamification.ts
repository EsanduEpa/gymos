"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { processCheckInGamification, BADGE_DEFINITIONS } from "@/lib/gamification"

export async function getCommunityLeaderboardData() {
  const authRes = await authorize([Role.GYM_MEMBER])
  if (!authRes.ok) return { error: authRes.error, leaderboard: [], currentMember: null }

  const currentUserId = authRes.userId
  const gymId = authRes.gymId

  try {
    // 1. Fetch all opted-in gym members in this tenant gym
    const members = await prisma.user.findMany({
      where: {
        gymId,
        role: Role.GYM_MEMBER,
        leaderboardOptIn: true,
      },
      select: {
        id: true,
        fullName: true,
        photo: true,
        attendanceStreak: {
          select: {
            currentStreak: true,
            longestStreak: true,
            totalVisits: true,
            lastCheckInDate: true,
          },
        },
        milestoneBadges: {
          select: {
            id: true,
            badgeType: true,
            name: true,
            description: true,
            icon: true,
            awardedAt: true,
          },
          orderBy: { awardedAt: "desc" },
        },
      },
    })

    // 2. Fetch current member's own account (even if opted out)
    const currentMemberUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        fullName: true,
        photo: true,
        leaderboardOptIn: true,
        attendanceStreak: {
          select: {
            currentStreak: true,
            longestStreak: true,
            totalVisits: true,
            lastCheckInDate: true,
          },
        },
        milestoneBadges: {
          select: {
            id: true,
            badgeType: true,
            name: true,
            description: true,
            icon: true,
            awardedAt: true,
          },
          orderBy: { awardedAt: "desc" },
        },
      },
    })

    // 3. Rank participants: Current Streak DESC, Badges Count DESC, Total Visits DESC
    const sortedMembers = members
      .map((m) => ({
        id: m.id,
        fullName: m.fullName,
        photo: m.photo,
        currentStreak: m.attendanceStreak?.currentStreak ?? 0,
        longestStreak: m.attendanceStreak?.longestStreak ?? 0,
        totalVisits: m.attendanceStreak?.totalVisits ?? 0,
        badgeCount: m.milestoneBadges.length,
        badges: m.milestoneBadges,
      }))
      .sort((a, b) => {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak
        }
        if (b.badgeCount !== a.badgeCount) {
          return b.badgeCount - a.badgeCount
        }
        return b.totalVisits - a.totalVisits
      })

    const leaderboard = sortedMembers.map((m, index) => ({
      ...m,
      rank: index + 1,
    }))

    // Calculate current user's rank
    const userRankIndex = leaderboard.findIndex((m) => m.id === currentUserId)
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null

    // All available badges in the system with earned status for current member
    const earnedBadgeTypes = new Set(
      currentMemberUser?.milestoneBadges.map((b) => b.badgeType) || []
    )

    const allBadgesShowcase = Object.values(BADGE_DEFINITIONS).map((def) => ({
      ...def,
      earned: earnedBadgeTypes.has(def.type),
      earnedAt: currentMemberUser?.milestoneBadges.find((b) => b.badgeType === def.type)?.awardedAt || null,
    }))

    return {
      leaderboard,
      currentMember: {
        id: currentUserId,
        fullName: currentMemberUser?.fullName || "Member",
        photo: currentMemberUser?.photo || null,
        leaderboardOptIn: currentMemberUser?.leaderboardOptIn ?? true,
        rank: userRank,
        currentStreak: currentMemberUser?.attendanceStreak?.currentStreak ?? 0,
        longestStreak: currentMemberUser?.attendanceStreak?.longestStreak ?? 0,
        totalVisits: currentMemberUser?.attendanceStreak?.totalVisits ?? 0,
        badgeCount: currentMemberUser?.milestoneBadges.length ?? 0,
        earnedBadges: currentMemberUser?.milestoneBadges || [],
        allBadgesShowcase,
      },
    }
  } catch (err) {
    console.error("Get leaderboard data error:", err)
    return { error: "Failed to load leaderboard", leaderboard: [], currentMember: null }
  }
}

export async function toggleLeaderboardOptIn() {
  const authRes = await authorize([Role.GYM_MEMBER])
  if (!authRes.ok) return { error: authRes.error }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authRes.userId },
      select: { leaderboardOptIn: true },
    })

    const nextVal = !(user?.leaderboardOptIn ?? true)

    await prisma.user.update({
      where: { id: authRes.userId },
      data: { leaderboardOptIn: nextVal },
    })

    revalidatePath("/member/community")
    return { success: true, optIn: nextVal }
  } catch (err) {
    console.error("Toggle leaderboard opt-in error:", err)
    return { error: "Failed to update preference" }
  }
}

export async function recordCheckInDemo() {
  const authRes = await authorize([Role.GYM_MEMBER])
  if (!authRes.ok) return { error: authRes.error }

  try {
    const res = await processCheckInGamification(authRes.userId, "DEMO_SCAN")
    revalidatePath("/member/community")
    revalidatePath("/member/dashboard")
    return { success: true, result: res }
  } catch (err) {
    console.error("Record check-in error:", err)
    return { error: "Failed to record check-in" }
  }
}
