import { getMemberPlans } from "@/app/actions/plans"
import { MemberPlansClient } from "./member-plans-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function MemberPlansPage() {
  const result = await getMemberPlans()
  if (result.error && !result.workoutPlans && !result.mealPlans) {
    redirect("/login")
  }

  return (
    <MemberPlansClient
      workoutPlans={result.workoutPlans || []}
      mealPlans={result.mealPlans || []}
    />
  )
}

