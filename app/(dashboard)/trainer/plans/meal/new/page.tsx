import { prisma } from "@/lib/prisma"
import { authorize, trainerClientWhere } from "@/lib/authz"
import { Role } from "@prisma/client"
import { MealBuilderForm } from "./meal-builder-form"

export default async function NewMealPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const { clientId } = await searchParams
  const authorized = await authorize([Role.PERSONAL_TRAINER])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>

  // Same client rule the save action enforces, so the picker can never offer
  // someone the save would then reject.
  const clients = await prisma.user.findMany({
    where: trainerClientWhere(authorized.gymId, authorized.userId),
  })

  return (
    <div className="max-w-3xl">
      <MealBuilderForm clients={clients} initialClientId={clientId} />
    </div>
  )
}
