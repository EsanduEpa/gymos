import { getOwnerDashboardData } from "@/app/actions/dashboard"
import OwnerDashboardClient from "./components/OwnerDashboardClient"

export const dynamic = "force-dynamic"

export default async function OwnerDashboardPage() {
  const initialData = await getOwnerDashboardData()

  return <OwnerDashboardClient initialData={initialData} />
}
