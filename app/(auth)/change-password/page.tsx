import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ChangePasswordForm } from "./change-password-form"

export default async function ChangePasswordPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F5F7] px-4 py-10 font-sans text-[#171B28]">
      <ChangePasswordForm
        fullName={session.user.fullName}
        required={Boolean(session.user.mustChangePassword)}
      />
    </div>
  )
}
