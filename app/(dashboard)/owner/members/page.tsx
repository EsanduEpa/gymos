import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MembersListClient } from "./members-list-client"

export default async function MembersPage() {
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) return <div className="p-6">No gym assigned.</div>

  const members = await prisma.user.findMany({
    where: {
      gymId,
      role: "GYM_MEMBER",
    },
    include: {
      memberships: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const plans = await prisma.membershipPlan.findMany({
    where: { gymId },
  })

  return (
    <div className="space-y-6">
      <MembersListClient members={members} plans={plans} />
    </div>
  )
}
