import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getEffectiveGymId } from "@/lib/authz"
import { DashboardChrome } from "@/components/layout/dashboard-chrome"
import { Role } from "@prisma/client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // `?stale` tells proxy.ts to drop the session cookie. The middleware waved
  // this request through on a raw JWT that `auth()` has just rejected, so
  // without clearing it the two would bounce the request between them.
  if (!session || !session.user) {
    redirect("/login?stale=1")
  }

  // Resolves the impersonated gym for a super admin, their own otherwise, so
  // the chrome describes the gym the pages are actually showing.
  const gymId = await getEffectiveGymId(session.user.role, session.user.gymId)
  const isImpersonating = session.user.role === Role.SUPER_ADMIN && Boolean(gymId)

  const gym = gymId
    ? await prisma.gym.findUnique({
        where: { id: gymId },
        select: { name: true, subscription: { select: { status: true } } },
      })
    : null

  const subLapsed =
    gym?.subscription?.status === "SUSPENDED" || gym?.subscription?.status === "GRACE_PERIOD"

  return (
    <DashboardChrome
      role={session.user.role}
      fullName={session.user.fullName}
      impersonating={isImpersonating}
      gymName={gym?.name ?? null}
      subLapsed={subLapsed}
    >
      {children}
    </DashboardChrome>
  )
}
