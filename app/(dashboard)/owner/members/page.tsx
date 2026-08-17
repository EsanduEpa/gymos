import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { MembersListClient } from "./members-list-client"

export default async function MembersPage() {
  const authorized = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>
  const { gymId } = authorized

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
