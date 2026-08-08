import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainerEarningsClient } from "./earnings-client"

export default async function TrainerEarningsPage() {
  const session = await auth()
  const trainerId = session?.user?.id

  if (!trainerId) return <div className="p-6">Unauthorized</div>

  const payRecords = await prisma.payRecord.findMany({
    where: { trainerId },
    include: {
      session: {
        include: { client: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <TrainerEarningsClient payRecords={payRecords} />
    </div>
  )
}
