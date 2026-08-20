/**
 * Moves the upcoming demo sessions into today's mid-afternoon UTC.
 *
 * The dashboard computes "today" on the server, which Vercel runs in UTC
 * (app/actions/dashboard.ts). The sessions list groups by the viewer's local
 * timezone. For a viewer in IST those two disagree for anything scheduled
 * between 18:30 UTC and midnight — the session shows on /owner/sessions and is
 * missing from /owner, which looks like data loss during a demo.
 *
 * Parking the sessions at 15:00 UTC puts them on the same calendar day in both
 * UTC and IST, so every screen agrees. This is a demo aid, not a fix: the
 * underlying timezone mismatch is still there for sessions booked late at night.
 *
 * Usage:  node scripts/stage-demo-day.js
 */
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

/** Today at a given UTC hour. */
function todayAtUtc(hour) {
  const d = new Date()
  d.setUTCHours(hour, 0, 0, 0)
  return d
}

async function main() {
  const upcoming = await prisma.pTSession.findMany({
    where: { status: { in: ["SCHEDULED", "PENDING_CONFIRMATION"] } },
    select: { id: true, status: true, scheduledAt: true },
    orderBy: { scheduledAt: "asc" },
  })

  if (upcoming.length === 0) {
    console.log("  No SCHEDULED or PENDING_CONFIRMATION sessions to move.")
    return
  }

  // 15:00, 16:00, 17:00 UTC — comfortably inside the same day in UTC and IST.
  let hour = 15

  for (const session of upcoming) {
    const scheduledAt = todayAtUtc(hour)
    await prisma.pTSession.update({
      where: { id: session.id },
      data: { scheduledAt },
    })
    console.log(
      `  ${session.status.padEnd(22)} ${session.scheduledAt.toISOString()} -> ${scheduledAt.toISOString()}`
    )
    hour += 1
  }

  console.log("")
  console.log(`  Moved ${upcoming.length} session(s) onto today.`)
  console.log("")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
