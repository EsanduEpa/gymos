import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainerProfileClient } from "./trainer-profile-client"

export default async function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) return <div className="p-6">No gym assigned.</div>

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
