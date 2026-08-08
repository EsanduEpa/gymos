"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

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
  const activeImpersonatedGymId = cookieStore.get("superAdminGymId")?.value || null

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
  if (gymId) {
    cookieStore.set("superAdminGymId", gymId, { path: "/" })
  } else {
    cookieStore.delete("superAdminGymId")
  }
}
