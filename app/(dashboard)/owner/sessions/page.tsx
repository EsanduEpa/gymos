import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { OwnerSessionsClient } from "./sessions-client"

export default async function OwnerSessionsPage() {
  const authorized = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>
  const { gymId } = authorized

  const sessions = await prisma.pTSession.findMany({
    where: { gymId },
    include: {
      client: true,
      trainer: true,
    },
    orderBy: { scheduledAt: "desc" },
  })

  const trainers = await prisma.user.findMany({
    where: { gymId, role: "PERSONAL_TRAINER" },
    select: { id: true, fullName: true },
  })

  const members = await prisma.user.findMany({
    where: { gymId, role: "GYM_MEMBER" },
    include: {
      memberships: {
        include: { plan: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      sessionPacks: true,
    },
    orderBy: { fullName: "asc" },
  })

  return (
    <div className="space-y-6">
      <OwnerSessionsClient sessions={sessions} trainers={trainers} members={members} />
    </div>
  )
}
