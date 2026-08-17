import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { TrainersListClient } from "./trainers-list-client"

export default async function TrainersPage() {
  const authorized = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>
  const { gymId } = authorized

  const trainers = await prisma.user.findMany({
    where: {
      gymId,
      role: "PERSONAL_TRAINER",
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <TrainersListClient trainers={trainers} />
    </div>
  )
}
