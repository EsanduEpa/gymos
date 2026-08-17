import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MemberSessionsClient } from "./member-sessions-client"

export default async function MemberSessionsPage() {
  const session = await auth()
  const clientId = session?.user?.id

  if (!clientId) return <div className="p-6">Unauthorized</div>

  const sessions = await prisma.pTSession.findMany({
    where: { clientId },
    include: { trainer: true },
    orderBy: { scheduledAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <MemberSessionsClient sessions={sessions} />
    </div>
  )
}
