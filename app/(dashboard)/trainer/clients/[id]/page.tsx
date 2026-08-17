import { prisma } from "@/lib/prisma"
import { authorize, trainerClientWhere } from "@/lib/authz"
import { Role } from "@prisma/client"
import { Client360Client } from "./client-360-client"

export default async function TrainerClient360Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const authorized = await authorize([Role.PERSONAL_TRAINER])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>

  const trainerId = authorized.userId

  // Scoped to this trainer's own clients within their own gym. Without the
  // relationship filter, changing the id in the URL would expose any member's
  // health notes, emergency contact and date of birth.
  const client = await prisma.user.findFirst({
    where: {
      id,
      ...trainerClientWhere(authorized.gymId, trainerId),
    },
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
