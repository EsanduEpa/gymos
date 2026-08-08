import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookSessionForm } from "./book-session-form"

export default async function BookSessionPage() {
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) return <div className="p-6">No gym assigned.</div>

  // Strictly filter members with active session packs > 0 (BR-018)
  const members = await prisma.user.findMany({
    where: {
      gymId,
      role: "GYM_MEMBER",
      sessionPacks: {
        some: {
          status: "ACTIVE",
          remainingSessions: { gt: 0 },
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      sessionPacks: {
        where: { status: "ACTIVE", remainingSessions: { gt: 0 } },
        select: { remainingSessions: true },
      },
    },
  })

  const trainers = await prisma.user.findMany({
    where: {
      gymId,
      role: "PERSONAL_TRAINER",
      trainerStatus: "ACTIVE",
    },
    select: {
      id: true,
      fullName: true,
      shiftStart: true,
      shiftEnd: true,
    },
  })

  return (
    <div className="max-w-2xl">
      <BookSessionForm members={members} trainers={trainers} />
    </div>
  )
}
