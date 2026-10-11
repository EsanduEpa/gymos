import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import { BadgeType } from "@prisma/client"

export interface BadgeDefinition {
  type: BadgeType
  name: string
  description: string
  icon: string
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  FIRST_VISIT: {
    type: "FIRST_VISIT",
    name: "First Steps",
    description: "Completed your very first gym check-in!",
    icon: "🎯",
  },
  VISITS_10: {
    type: "VISITS_10",
    name: "Iron Cadet",
    description: "Logged 10 gym visits",
    icon: "🔥",
  },
  VISITS_50: {
    type: "VISITS_50",
    name: "Half-Century Beast",
    description: "Logged 50 gym workouts",
    icon: "⚡",
  },
  VISITS_100: {
    type: "VISITS_100",
    name: "Century Club Legend",
    description: "Logged 100 gym check-ins!",
    icon: "🏆",
  },
  VISITS_250: {
    type: "VISITS_250",
    name: "Gym Olympian",
    description: "Completed 250 gym check-ins!",
    icon: "💎",
  },
  STREAK_7_DAYS: {
    type: "STREAK_7_DAYS",
    name: "7-Day Streak Master",
    description: "Maintained a 7-day attendance streak",
    icon: "🌟",
  },
  STREAK_30_DAYS: {
    type: "STREAK_30_DAYS",
    name: "Monthly Warrior",
    description: "Maintained a 30-day streak",
    icon: "👑",
  },
  STREAK_100_DAYS: {
    type: "STREAK_100_DAYS",
    name: "Unstoppable Titan",
    description: "Attained a 100-day attendance streak",
    icon: "🔥",
  },
}

function getDayDifference(dateA: Date, dateB: Date): number {
  const d1 = new Date(Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate()))
  const d2 = new Date(Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate()))
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Process a check-in event for gamification:
 * - Logs the check-in record
 * - Updates attendance streak & total visits atomically
 * - Calculates milestones and awards newly unlocked badges
 * - Dispatches notifications for new achievements
 */
export async function processCheckInGamification(
  userId: string,
  checkInMethod: string = "BIOMETRIC"
) {
  const now = new Date()

  return prisma.$transaction(async (tx) => {
    // 1. Create CheckIn record
    const checkIn = await tx.checkIn.create({
      data: {
        userId,
        method: checkInMethod,
        createdAt: now,
      },
    })

    // 2. Fetch existing streak record
    const existingStreak = await tx.attendanceStreak.findUnique({
      where: { userId },
    })

    let currentStreak = 1
    let longestStreak = 1
    let totalVisits = 1

    if (existingStreak) {
      totalVisits = existingStreak.totalVisits + 1

      if (existingStreak.lastCheckInDate) {
        const daysDiff = getDayDifference(existingStreak.lastCheckInDate, now)

        if (daysDiff === 0) {
          // Same calendar day check-in: total visits increments, streak count unchanged
          currentStreak = existingStreak.currentStreak
          longestStreak = existingStreak.longestStreak
        } else if (daysDiff === 1) {
          // Consecutive calendar day: streak increments
          currentStreak = existingStreak.currentStreak + 1
          longestStreak = Math.max(existingStreak.longestStreak, currentStreak)
        } else {
          // Streak broken: reset to 1
          currentStreak = 1
          longestStreak = Math.max(existingStreak.longestStreak, 1)
        }
      }

      await tx.attendanceStreak.update({
        where: { userId },
        data: {
          currentStreak,
          longestStreak,
          totalVisits,
          lastCheckInDate: now,
        },
      })
    } else {
      await tx.attendanceStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          totalVisits: 1,
          lastCheckInDate: now,
        },
      })
    }

    // 3. Evaluate Badges
    const existingBadges = await tx.milestoneBadge.findMany({
      where: { userId },
      select: { badgeType: true },
    })
    const existingBadgeTypes = new Set(existingBadges.map((b) => b.badgeType))

    const qualifyingBadges: BadgeType[] = []

    if (totalVisits >= 1) qualifyingBadges.push("FIRST_VISIT")
    if (totalVisits >= 10) qualifyingBadges.push("VISITS_10")
    if (totalVisits >= 50) qualifyingBadges.push("VISITS_50")
    if (totalVisits >= 100) qualifyingBadges.push("VISITS_100")
    if (totalVisits >= 250) qualifyingBadges.push("VISITS_250")

    if (currentStreak >= 7) qualifyingBadges.push("STREAK_7_DAYS")
    if (currentStreak >= 30) qualifyingBadges.push("STREAK_30_DAYS")
    if (currentStreak >= 100) qualifyingBadges.push("STREAK_100_DAYS")

    const newlyAwarded: BadgeDefinition[] = []

    for (const bType of qualifyingBadges) {
      if (!existingBadgeTypes.has(bType)) {
        const def = BADGE_DEFINITIONS[bType]
        if (def) {
          await tx.milestoneBadge.create({
            data: {
              userId,
              badgeType: bType,
              name: def.name,
              description: def.description,
              icon: def.icon,
              awardedAt: now,
            },
          })
          newlyAwarded.push(def)
        }
      }
    }

    // 4. Send notifications for newly unlocked badges
    for (const badge of newlyAwarded) {
      await createNotification({
        recipientId: userId,
        type: "SESSION_BOOKED",
        title: `🏆 Achievement Unlocked: ${badge.name}!`,
        message: `${badge.icon} ${badge.description}`,
        linkUrl: "/member/community",
      })
    }

    return {
      checkInId: checkIn.id,
      currentStreak,
      longestStreak,
      totalVisits,
      newlyAwardedBadges: newlyAwarded,
    }
  })
}
