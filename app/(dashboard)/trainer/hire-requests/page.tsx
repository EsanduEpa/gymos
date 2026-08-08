import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HireRequestsClient } from "./hire-requests-client"

export default async function HireRequestsPage() {
  const session = await auth()
  const trainerId = session?.user?.id

  if (!trainerId) return <div className="p-6">Unauthorized</div>

  const requests = await prisma.hireRequest.findMany({
    where: { trainerId },
    include: {
      client: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <HireRequestsClient requests={requests} />
    </div>
  )
}
