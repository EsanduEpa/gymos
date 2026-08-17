import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { Role } from "@prisma/client"
import { NewMemberForm } from "./new-member-form"

export default async function NewMemberPage() {
  const authorized = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!authorized.ok) return <div className="p-6">{authorized.error}</div>
  const { gymId } = authorized

  const plans = await prisma.membershipPlan.findMany({
    where: { gymId },
    orderBy: { price: "asc" },
  })

  return (
    <div className="max-w-2xl">
      <NewMemberForm plans={plans} />
    </div>
  )
}
