import { getCommunityLeaderboardData } from "@/app/actions/gamification"
import { CommunityClient } from "./community-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function MemberCommunityPage() {
  const result = await getCommunityLeaderboardData()
  if (result.error && !result.currentMember) {
    redirect("/login")
  }

  if (!result.currentMember) {
    redirect("/login")
  }

  return (
    <CommunityClient
      leaderboard={result.leaderboard}
      currentMember={result.currentMember}
    />
  )
}
