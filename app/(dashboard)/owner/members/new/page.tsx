import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NewMemberForm } from "./new-member-form"

export default async function NewMemberPage() {
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) return <div className="p-6">No gym assigned.</div>

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
