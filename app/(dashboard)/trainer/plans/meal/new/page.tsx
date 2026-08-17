import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MealBuilderForm } from "./meal-builder-form"

export default async function NewMealPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const { clientId } = await searchParams
  const session = await auth()
  const trainerId = session?.user?.id

  if (!trainerId) return <div className="p-6">Unauthorized</div>

  // Fetch trainer's assigned clients (confirmed/completed session together)
  const clientSessions = await prisma.pTSession.findMany({
    where: { trainerId, status: { in: ["SCHEDULED", "ACTIVE", "COMPLETED"] } },
    distinct: ["clientId"],
    select: { clientId: true },
  })

  const clients = await prisma.user.findMany({
    where: { id: { in: clientSessions.map((s) => s.clientId) } },
  })

  return (
    <div className="max-w-3xl">
      <MealBuilderForm clients={clients} initialClientId={clientId} />
    </div>
  )
}
