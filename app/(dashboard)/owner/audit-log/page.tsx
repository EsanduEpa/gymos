import { getAuditLogs } from "@/app/actions/audit"
import AuditLogClient from "./AuditLogClient"

export const dynamic = "force-dynamic"

export default async function AuditLogPage() {
  const initialData = await getAuditLogs()

  return <AuditLogClient initialData={initialData} />
}
