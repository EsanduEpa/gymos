import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainerClientsClient } from "./clients-client"

export default async function TrainerClientsPage() {
  const session = await auth()
  const trainerId = session?.user?.id

  if (!trainerId) return <div className="p-6">Unauthorized</div>

  // Fetch clients hired by this trainer
  const hireRequests = await prisma.hireRequest.findMany({
    where: {
      trainerId,
      status: "ACCEPTED",
    },
    include: {
      client: {
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
      },
    },
  })

  const clients = hireRequests.map((hr) => hr.client)

  return (
    <div className="space-y-6">
      <TrainerClientsClient clients={clients} />
    </div>
  )
}
