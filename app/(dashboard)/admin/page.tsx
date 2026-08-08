import { getSuperAdminData } from "@/app/actions/admin"
import AdminClient from "./AdminClient"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const initialData = await getSuperAdminData()

  return <AdminClient initialData={initialData} />
}
