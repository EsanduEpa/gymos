import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainerScheduleClient } from "./schedule-client"

export default async function TrainerSchedulePage() {
  const session = await auth()
  const trainerId = session?.user?.id

  if (!trainerId) return <div className="p-6">Unauthorized</div>

  const sessions = await prisma.pTSession.findMany({
    where: { trainerId },
    include: {
      client: true,
    },
    orderBy: { scheduledAt: "asc" },
  })

  return (
    <div className="space-y-6">
      <TrainerScheduleClient sessions={sessions} />
    </div>
  )
}
