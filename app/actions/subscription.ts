"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getGymSubscription() {
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) {
    throw new Error("Unauthorized or Gym ID missing")
  }

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
