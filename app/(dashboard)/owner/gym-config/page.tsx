import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GymConfigClient } from "./gym-config-client"

export default async function GymConfigPage() {
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) {
    return <div className="p-6">No gym assigned.</div>
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    include: {
      membershipPlans: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!gym) {
    return <div className="p-6">Gym configuration not found.</div>
  }

  return (
    <div className="space-y-6">
      <GymConfigClient gym={gym} />
    </div>
  )
}
