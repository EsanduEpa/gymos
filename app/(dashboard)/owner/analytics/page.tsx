import { getAnalyticsData } from "@/app/actions/analytics"
import { authorizeOrThrow } from "@/lib/authz"
import { Role } from "@prisma/client"
import AnalyticsClient from "./AnalyticsClient"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  // authorizeOrThrow runs first — if the user is not an owner this throws
  // and the dashboard error boundary catches it before any data is fetched.
  const { gymId } = await authorizeOrThrow([Role.GYM_OWNER, Role.SUPER_ADMIN])
  const data = await getAnalyticsData()

  return <AnalyticsClient gymId={gymId} data={data} />
}
