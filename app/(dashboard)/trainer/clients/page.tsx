import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainerClientsClient } from "./clients-client"

export default async function TrainerClientsPage() {
  const session = await auth()
  const trainerId = session?.user?.id

  if (!trainerId) return <div className="p-6">Unauthorized</div>

  // A client becomes "assigned" to this trainer once they have at least one
  // confirmed or completed session together (the booking flow is the hire
  // mechanism now — there is no separate HireRequest step).
  const clientSessions = await prisma.pTSession.findMany({
    where: { trainerId, status: { in: ["SCHEDULED", "ACTIVE", "COMPLETED"] } },
    distinct: ["clientId"],
    select: { clientId: true },
  })

  const clients = await prisma.user.findMany({
    where: { id: { in: clientSessions.map((s) => s.clientId) } },
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
