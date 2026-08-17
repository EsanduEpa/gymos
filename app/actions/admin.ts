"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IMPERSONATION_COOKIE } from "@/lib/authz"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getSuperAdminData() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: SuperAdmin only")
  }

  const gyms = await prisma.gym.findMany({
    include: {
      subscription: true,
      users: {
        where: { role: "GYM_OWNER" },
        select: { fullName: true, email: true },
      },
      _count: {
        select: {
          users: true,
          sessions: true,
        },
      },
    },
  })

  const cookieStore = await cookies()
  const activeImpersonatedGymId = cookieStore.get(IMPERSONATION_COOKIE)?.value || null

  return {
    gyms: gyms.map((g) => ({
      id: g.id,
      name: g.name,
      address: g.address,
      ownerName: g.users[0]?.fullName || "No Owner",
      ownerEmail: g.users[0]?.email || "-",
      tier: g.subscription?.tier || "STARTER",
      status: g.subscription?.status || "ACTIVE",
      totalMembers: g._count.users,
      totalSessions: g._count.sessions,
    })),
    activeImpersonatedGymId,
  }
}

export async function setImpersonatedGym(gymId: string | null) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const cookieStore = await cookies()

  if (!gymId) {
    cookieStore.delete(IMPERSONATION_COOKIE)
    revalidatePath("/admin")
    return { success: true }
  }

  // getEffectiveGymId only honours this cookie for a SUPER_ADMIN, but there is
  // no reason to let even them point it at a gym that doesn't exist.
  const gym = await prisma.gym.findUnique({ where: { id: gymId }, select: { id: true } })
  if (!gym) throw new Error("Gym not found")

  cookieStore.set(IMPERSONATION_COOKIE, gym.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  revalidatePath("/admin")
  return { success: true }
}
