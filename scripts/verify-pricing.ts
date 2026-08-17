// Reconciliation check for the revenue model in docs/revenue-model.md.
// Run with: npm run verify:pricing
//
// The project has no test framework yet. This covers the one area where a
// silent regression is most expensive - what a session costs, what the
// trainer is paid, and whether deferred plus recognized still equals paid.

import { packSessionPrice, rateCardFee, resolveSessionFee, trainerPayFor, round2 } from "../lib/pricing"

let pass = 0, fail = 0
function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  console.log(`${ok ? "  ok  " : "  FAIL"} ${label} → got ${JSON.stringify(got)}${ok ? "" : `, want ${JSON.stringify(want)}`}`)
  ok ? pass++ : fail++
}

const rateCard = { defaultSessionFee: 50, level2SessionFee: 65, introSessionFee: 0 }
const pack = { price: 400, totalSessions: 10 }

console.log("\nRate card")
eq("default for L1 in-person", rateCardFee(rateCard, { type: "IN_PERSON", trainerLevel: "LEVEL_1" }), 50)
eq("L2 premium applies", rateCardFee(rateCard, { type: "IN_PERSON", trainerLevel: "LEVEL_2" }), 65)
eq("intro beats L2 premium", rateCardFee(rateCard, { type: "INTRODUCTORY", trainerLevel: "LEVEL_2" }), 0)
eq("blank overrides fall back", rateCardFee({ defaultSessionFee: 50, level2SessionFee: null, introSessionFee: null }, { trainerLevel: "LEVEL_2" }), 50)

console.log("\nPack price is the source of truth")
eq("$400 / 10 sessions", packSessionPrice(pack), 40)
eq("pack beats rate card even for L2", resolveSessionFee(rateCard, { trainerLevel: "LEVEL_2", pack }), 40)
eq("no pack → rate card", resolveSessionFee(rateCard, { trainerLevel: "LEVEL_2", pack: null }), 65)
eq("priceless pack → rate card, not zero", resolveSessionFee(rateCard, { trainerLevel: "LEVEL_1", pack: { price: null, totalSessions: 10 } }), 50)

console.log("\nTrainer pay follows the pack price, not the list price")
const payOpts = { level1BaseRate: 0.4, level2BaseRate: 0.5, offShiftPremium: 0.1 }
eq("L1 in-shift on $40", trainerPayFor(40, { trainerLevel: "LEVEL_1", offShift: false, ...payOpts }).amount, 16)
eq("L2 off-shift on $40", trainerPayFor(40, { trainerLevel: "LEVEL_2", offShift: true, ...payOpts }).amount, 24)
eq("old behaviour would have overpaid", trainerPayFor(50, { trainerLevel: "LEVEL_1", offShift: false, ...payOpts }).amount, 20)

console.log("\nWorked example — deferred + recognized must equal what was paid")
const per = packSessionPrice(pack)!
let remaining = 10, recognized = 0
const events = ["completed", "completed", "late-cancel", "no-show", "on-time-cancel"]
for (const e of events) {
  if (e !== "on-time-cancel") { remaining -= 1; recognized = round2(recognized + per) }
}
const deferred = round2(remaining * per)
console.log(`  after ${events.join(", ")}: recognized $${recognized}, deferred $${deferred}, remaining ${remaining}`)
eq("recognized + deferred = $400", round2(recognized + deferred), 400)
eq("4 credits consumed, 6 remain", remaining, 6)
eq("on-time cancel recognized nothing", recognized, 160)

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail === 0 ? 0 : 1)
