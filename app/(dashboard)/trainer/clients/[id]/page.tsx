import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Client360Client } from "./client-360-client"

export default async function TrainerClient360Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const trainerId = session?.user?.id

  if (!trainerId) return <div className="p-6">Unauthorized</div>

  const client = await prisma.user.findFirst({
    where: { id },
    include: {
      sessionPacks: {
        where: { status: "ACTIVE" },
        take: 1,
      },
      sessionsClient: {
        where: { trainerId },
        include: { trainer: true },
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
      workoutPlansClient: {
        where: { trainerId },
        include: { exercises: true },
        orderBy: { createdAt: "desc" },
        take: 2,
      },
      mealPlansClient: {
        where: { trainerId },
        include: { entries: true },
        orderBy: { createdAt: "desc" },
        take: 2,
      },
      bodyMetrics: {
        orderBy: { dateRecorded: "desc" },
        take: 5,
      },
    },
  })

  if (!client) {
    return <div className="p-6">Client not found.</div>
  }

  return (
    <div className="space-y-6">
      <Client360Client client={client} />
    </div>
  )
}
