/**
 * Sets a known password on one account per role, for demos and walkthroughs.
 *
 * Targeted and reversible: it updates four rows and touches nothing else. This
 * is deliberately not `prisma db seed` — the seed calls deleteMany() on users,
 * gyms, memberships and plans, so running that to recover a password would
 * destroy the data you were trying to log in and look at.
 *
 * Usage:  node scripts/reset-demo-passwords.js
 *
 * Reads DATABASE_URL from the environment, so it hits whichever database your
 * .env points at — currently the live Neon instance.
 */
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

// 15 characters, contains digits: clears the 10-character minimum and the
// "not entirely letters" rule in lib/passwords.ts.
const PASSWORD = "GymOS-Demo-2026"

const TARGETS = [
  "admin@gymos.com",
  "owner@fitgym.com",
  "trainer1@fitgym.com",
  "member1@fitgym.com",
]

async function main() {
  const password = await bcrypt.hash(PASSWORD, 10)

  for (const email of TARGETS) {
    // mustChangePassword stays false so these land straight on a dashboard.
    // Flip it to true if you want to exercise the forced-change flow instead.
    const { count } = await prisma.user.updateMany({
      where: { email },
      data: { password, mustChangePassword: false },
    })
    console.log(count ? `  reset    ${email}` : `  MISSING  ${email}`)
  }

  console.log("")
  console.log(`  Password for all four: ${PASSWORD}`)
  console.log("")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
