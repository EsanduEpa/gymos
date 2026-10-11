import { getMemberProgress } from "@/app/actions/progress"
import { MemberProgressClient } from "./member-progress-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function MemberProgressPage() {
  const result = await getMemberProgress()
  if (result.error && !result.metrics && !result.photos) {
    redirect("/login")
  }

  return (
    <MemberProgressClient
      metrics={result.metrics || []}
      photos={result.photos || []}
    />
  )
}

