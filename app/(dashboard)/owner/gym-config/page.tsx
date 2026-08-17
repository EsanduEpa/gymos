import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { GymConfigClient } from "./gym-config-client"

export default async function GymConfigPage() {
  const authorized = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>
  const { gymId } = authorized

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
