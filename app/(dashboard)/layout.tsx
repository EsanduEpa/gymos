import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"
import { getEffectiveGymId } from "@/lib/authz"
import { Role } from "@prisma/client"
import { AlertCircle, Eye } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
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
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Sidebar
        role={session.user.role}
        fullName={session.user.fullName}
        impersonating={isImpersonating}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {isImpersonating && (
          <div className="bg-[#171B28] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2">
            <Eye className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Viewing {gym?.name ?? "a gym"} as platform admin. Changes you make apply to
              that gym.
            </span>
          </div>
        )}
        {subLapsed && (
          <div className="bg-red-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Your gym subscription payment failed or is in grace period. Please update your billing details to maintain uninterrupted access.</span>
          </div>
        )}
        <Header fullName={session.user.fullName} role={session.user.role} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
