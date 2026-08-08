import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MemberProfileClient } from "./member-profile-client"

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) return <div className="p-6">No gym assigned.</div>

  const member = await prisma.user.findFirst({
    where: {
      id,
      gymId,
      role: "GYM_MEMBER",
    },
    include: {
      memberships: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      },
      sessionPacks: {
        orderBy: { createdAt: "desc" },
      },
      sessionsClient: {
        include: { trainer: true },
        orderBy: { scheduledAt: "desc" },
        take: 5,
      },
    },
  })

  if (!member) {
    return <div className="p-6">Member record not found.</div>
  }

  return (
    <div className="space-y-6">
      <MemberProfileClient member={member} />
    </div>
  )
}
