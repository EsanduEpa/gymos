# Revenue Model

How money moves through GymOS, and the arithmetic that has to close.

## The rule

**A session pack is deferred revenue.** Cash arrives when the pack is sold, but
the gym has not earned it yet — it owes the member ten sessions. Revenue is
recognized one session at a time, as each is consumed.

Consumed means *any* of these, because in all three the member has spent the
credit and the gym keeps the money:

| Event | Pack credit | Revenue recognized | Trainer paid |
|---|---|---|---|
| Session completed | −1 | yes | yes, `fee × rate` |
| No-show | −1 | yes | no (BR-046) |
| Late cancellation | −1 | yes | no (BR-047) |
| On-time cancellation | unchanged | no | no |

At any moment: **`deferred + recognized = what the member paid`**. If that
doesn't hold, there is a bug.

## What a session costs

Resolved in this order:

1. **Funded by a pack** → `pack.price ÷ pack.totalSessions`. The pack records
   what the member actually paid, including any discount, so it is the only
   honest source of price. It is a snapshot: changing the rate card later never
   re-prices a pack already sold.
2. **No pack** → the gym's rate card: introductory rate if the session is
   introductory, else the level-2 rate if the trainer is level 2, else the
   default fee.

The fee is written onto the session when it is booked, so later rate-card edits
never retroactively change a booked session's price or the trainer's pay.

## Worked example

FitCore's rate card: default $50, level 2 $65, introductory $0.
Pay rates: L1 40%, L2 50%, off-shift premium +10%.

Priya buys a **10-session pack for $400** — a discount on the $500 list price.
Per-session price is **$40**, and that is what every session off this pack bills,
regardless of which trainer takes it.

| # | Event | Recognized | Deferred | Trainer pay |
|---|---|---:|---:|---:|
| 0 | Pack sold, $400 cash in | $0 | $400 | — |
| 1 | Completed, L1 in-shift | $40 | $360 | $40 × 0.40 = **$16** |
| 2 | Completed, L2 off-shift | $80 | $320 | $40 × 0.60 = **$24** |
| 3 | Late cancellation | $120 | $280 | **$0** |
| 4 | No-show | $160 | $240 | **$0** |
| 5 | Cancelled on time | $160 | $240 | **$0** |

After five events, four credits are spent and six remain.
`$160 recognized + $240 deferred = $400`. ✓

Note that trainer pay follows the **pack's** price, not the rate card — the
trainer is paid a share of what the gym actually collected. Billing $50 while
the member paid $40 overpaid the trainer on every discounted pack.

## Where the cash is recorded

Recognized revenue is not the same as cash received, and this app currently
tracks only the former. The `Payment` ledger in M2-1 records the cash event —
bank slip or cash in hand — at the moment the owner verifies it. Creating a
`RevenueRecord` when a pack is sold would double-count: once at sale, again as
each session is consumed.

## Money is still Float — deliberately, for now

Every money column is a `Float`, which cannot represent currency exactly. This
is scheduled for conversion to `Decimal` in its own packet before launch, and
the decision to defer it was measured rather than assumed:

- `round2()` runs at every write, so **stored values are exact to the cent**.
- Summing 6,000 pay records of $18.00 drifts by **$0.000** — float64 carries
  ~15 significant digits, and these are two-decimal values in the hundreds.
- The residual exposure is display-time aggregates, not stored data.

The conversion touches 13 schema fields, 29 arithmetic sites and 32
server-to-client boundaries (Prisma returns `Decimal.js` instances, which Next
will not pass to a client component unserialized). It must land **before the
client has live financial records** — after that it becomes a data migration.

**If you are adding a money field, keep passing it through `round2()` on write.**

## Known inconsistency

Membership revenue is recognized in full at sale (`createMember`), not spread
across the plan's duration. For a 30-day plan the distortion is small and this
is common practice; for the 365-day Annual Premium plan it overstates the month
of sale. Left as-is for Phase 1 deliberately — revisit if the client reports on
monthly margins.
