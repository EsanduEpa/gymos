"use server"

import { prisma } from "@/lib/prisma"
import { authorizeOrThrow } from "@/lib/authz"
import { Role } from "@prisma/client"

export async function getGymSubscription() {
  const { gymId } = await authorizeOrThrow([Role.GYM_OWNER, Role.SUPER_ADMIN])

  let sub = await prisma.gymSubscription.findUnique({
    where: { gymId },
  })

  if (!sub) {
    const nextMonth = new Date()
    nextMonth.setDate(nextMonth.getDate() + 30)

    sub = await prisma.gymSubscription.create({
      data: {
        gymId,
        tier: "GROWTH",
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        nextBillingDate: nextMonth,
        paymentMethodLast4: "4242",
      },
    })
  }

  return sub
}
