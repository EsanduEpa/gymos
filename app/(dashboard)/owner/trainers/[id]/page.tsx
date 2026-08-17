import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { TrainerProfileClient } from "./trainer-profile-client"

export default async function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const authorized = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>
  const { gymId } = authorized

  const trainer = await prisma.user.findFirst({
    where: {
      id,
      gymId,
      role: "PERSONAL_TRAINER",
    },
    include: {
      sessionsTrainer: {
        include: { client: true },
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
    },
  })

  if (!trainer) {
    return <div className="p-6">Trainer record not found.</div>
  }

  const distinctClients = await prisma.pTSession.findMany({
    where: { trainerId: id, status: { in: ["SCHEDULED", "ACTIVE", "COMPLETED"] } },
    distinct: ["clientId"],
    select: { clientId: true },
  })

  return (
    <div className="space-y-6">
      <TrainerProfileClient trainer={{ ...trainer, activeClientsCount: distinctClients.length }} />
    </div>
  )
}
