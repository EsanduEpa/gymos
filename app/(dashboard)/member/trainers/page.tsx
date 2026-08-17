import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MemberTrainersClient } from "./member-trainers-client"

export default async function MemberTrainersPage() {
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) return <div className="p-6">No gym assigned.</div>

  const trainers = await prisma.user.findMany({
    where: {
      gymId,
      role: "PERSONAL_TRAINER",
      trainerStatus: "ACTIVE",
    },
    select: {
      id: true,
      fullName: true,
      trainerLevel: true,
      specialisations: true,
      bio: true,
      yearsExperience: true,
      shiftStart: true,
      shiftEnd: true,
      ratingAvg: true,
    },
    orderBy: { fullName: "asc" },
  })

  return (
    <div className="space-y-6">
      <MemberTrainersClient trainers={trainers} />
    </div>
  )
}
