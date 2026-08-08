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

  const hireRequests = await prisma.hireRequest.findMany({
    where: { trainerId, status: "ACCEPTED" },
    include: { client: true },
  })

  const clients = hireRequests.map((hr) => hr.client)

  return (
    <div className="max-w-3xl">
      <MealBuilderForm clients={clients} initialClientId={clientId} />
    </div>
  )
}
