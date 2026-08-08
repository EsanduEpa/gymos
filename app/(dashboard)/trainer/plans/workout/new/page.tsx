import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WorkoutBuilderForm } from "./workout-builder-form"

export default async function NewWorkoutPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const { clientId } = await searchParams
  const session = await auth()
  const trainerId = session?.user?.id

  if (!trainerId) return <div className="p-6">Unauthorized</div>

  // Fetch trainer's accepted clients
  const hireRequests = await prisma.hireRequest.findMany({
    where: { trainerId, status: "ACCEPTED" },
    include: { client: true },
  })

  const clients = hireRequests.map((hr) => hr.client)

  return (
    <div className="max-w-3xl">
      <WorkoutBuilderForm clients={clients} initialClientId={clientId} />
    </div>
  )
}
