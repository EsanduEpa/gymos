import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Sidebar role={session.user.role} fullName={session.user.fullName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header fullName={session.user.fullName} role={session.user.role} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
