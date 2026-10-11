import { getTrainerHireRequests } from "@/app/actions/hire-requests"
import { HireRequestsClient } from "./hire-requests-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function TrainerHireRequestsPage() {
  const result = await getTrainerHireRequests()
  if (result.error && !result.requests) {
    redirect("/login")
  }

  return <HireRequestsClient requests={result.requests || []} />
}
