import { getGymSubscription } from "@/app/actions/subscription"
import SubscriptionClient from "./SubscriptionClient"

export const dynamic = "force-dynamic"

export default async function SubscriptionPage() {
  const subscription = await getGymSubscription()

  return <SubscriptionClient subscription={subscription} />
}
