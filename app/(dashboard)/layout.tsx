import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"
import { AlertCircle } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  let subLapsed = false
  if (session.user.gymId) {
    const sub = await prisma.gymSubscription.findUnique({
      where: { gymId: session.user.gymId },
    })
    if (sub && (sub.status === "SUSPENDED" || sub.status === "GRACE_PERIOD")) {
      subLapsed = true
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Sidebar role={session.user.role} fullName={session.user.fullName} />
      <div className="flex-1 flex flex-col min-w-0">
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
