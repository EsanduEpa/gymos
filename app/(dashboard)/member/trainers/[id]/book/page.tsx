import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RequestSessionForm } from "./request-session-form"

export default async function RequestSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const gymId = session?.user?.gymId
  const clientId = session?.user?.id

  if (!gymId || !clientId) return <div className="p-6">No gym assigned.</div>

  const trainer = await prisma.user.findFirst({
    where: { id, gymId, role: "PERSONAL_TRAINER", trainerStatus: "ACTIVE" },
    select: {
      id: true,
      fullName: true,
      trainerLevel: true,
      shiftStart: true,
      shiftEnd: true,
    },
  })

  if (!trainer) {
    return <div className="p-6">Trainer not found.</div>
  }

  const activePack = await prisma.sessionPack.findFirst({
    where: { userId: clientId, status: "ACTIVE", remainingSessions: { gt: 0 } },
    select: { remainingSessions: true },
  })

  return (
    <div className="max-w-2xl">
      <RequestSessionForm trainer={trainer} remainingSessions={activePack?.remainingSessions ?? 0} />
    </div>
  )
}
