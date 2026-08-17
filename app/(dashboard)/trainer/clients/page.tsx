import { prisma } from "@/lib/prisma"
import { authorize, trainerClientWhere } from "@/lib/authz"
import { Role } from "@prisma/client"
import { TrainerClientsClient } from "./clients-client"

export default async function TrainerClientsPage() {
  const authorized = await authorize([Role.PERSONAL_TRAINER])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>

  const trainerId = authorized.userId

  // Shares one definition of "this trainer's client" with the profile page and
  // the plan builder, so the roster can never list someone those screens would
  // refuse to open.
  const clients = await prisma.user.findMany({
    where: trainerClientWhere(authorized.gymId, trainerId),
    include: {
      sessionPacks: {
        where: { status: "ACTIVE" },
        take: 1,
      },
      sessionsClient: {
        where: { trainerId },
        orderBy: { scheduledAt: "desc" },
        take: 1,
      },
    },
  })

  return (
    <div className="space-y-6">
      <TrainerClientsClient clients={clients} />
    </div>
  )
}
