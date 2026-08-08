import { auth } from "@/lib/auth"
import { getTrainerClients } from "@/app/actions/messages"
import MessagesClient from "./MessagesClient"

export const dynamic = "force-dynamic"

export default async function TrainerMessagesPage() {
  const session = await auth()
  const clients = await getTrainerClients()

  return <MessagesClient initialClients={clients} currentUserId={session?.user?.id || ""} />
}
