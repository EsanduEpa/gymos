import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainersListClient } from "./trainers-list-client"

export default async function TrainersPage() {
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) return <div className="p-6">No gym assigned.</div>

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
