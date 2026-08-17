# Upgrade Backlog — Phase 1 (non-M2)

Findings from a full-project audit on 2026-08-18. M2 items (Decimal conversion,
Payment ledger, email delivery) are deliberately out of scope here.

## Verification baseline

Everything below was run against the live Neon database on the `dev` branch.

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` (webpack) | 32 routes, no errors |
| `npx next build` (Turbopack) | also clean |
| `npx prisma migrate status` | 4 migrations, schema up to date |
| `npm run verify:pricing` | 14 passed, 0 failed |
| Unauthenticated route probes | all dashboards 307 → login, CSV export 403 |
| Security headers on `/login` | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy all present |
| Authorization coverage | every one of the 40 exported server actions gates on `authorize*` before touching data |
| `npx eslint .` | 79 errors, 40 warnings |

The core is sound. The items below are the gap between "works on my machine"
and "safe in front of the client".

---

## P1 — Will misbehave in production

### 1. Session times are parsed in the server's timezone

`app/actions/sessions.ts:203` and `:302`

```ts
const scheduledAt = new Date(`${date}T${time}:00`)
```

A bare `YYYY-MM-DDTHH:MM:SS` string with no offset is parsed in the **server's**
local timezone, then rendered with `toLocaleTimeString()` in the **browser's**.
Locally both are Asia/Colombo, so it looks correct. On Vercel the server runs
UTC: a session booked for 10:00 is stored as `10:00Z` and displayed to a Colombo
user as **15:30**.

This is invisible in local dev and wrong in every deployed booking. The same
server-side `getHours()` assumption drives the peak-hours chart
(`app/actions/analytics.ts:84`) and the owner dashboard's "today" windows
(`app/actions/dashboard.ts:10-18`).

**Fix:** store the gym's IANA timezone on `Gym`, and convert explicitly at the
boundary rather than relying on the process timezone. Setting `TZ=Asia/Colombo`
in Vercel env is a same-day stopgap that fixes the single-tenant case.

### 2. Audit-log CSV export produces malformed files

`app/(dashboard)/owner/audit-log/AuditLogClient.tsx:54-73`

The first column is `new Date(log.createdAt).toLocaleString()`, which contains a
comma in most locales (`"8/18/2026, 3:45:00 AM"`), and it is written **unquoted**.
Every row splits into an extra column. `encodeURI` also leaves `#` unencoded, so
a `#` anywhere in the details truncates the download.

A hardened CSV writer already exists in `lib/csv.ts` — with quoting, `"`
doubling, and formula-injection prefixing — and this export does not use it.
`app/(dashboard)/owner/sessions/daily-view.tsx:66-80` rolls its own too: it
quotes, but never doubles embedded quotes and never guards formula triggers.

**Fix:** route both through `lib/csv.ts`, ideally by moving them to the existing
`/api/export/csv` route which already does this correctly.

### 3. Two policy toggles do nothing

`gym.noShowDeduction` and `gym.lateCancelDeduction` are written by
`updateCancellationPolicy` and rendered as checkboxes in Gym Settings, but no
code ever reads them. `handleNoShow` always burns a credit;
`cancelSession` always burns one on a late cancel.

An owner can switch both off and the system keeps deducting. This is the same
class of thing M1-6 was cleaning up.

**Fix:** either honour them in `consumePackCredit`'s call sites, or remove the
controls. Honouring them is roughly six lines.

### 4. Trainer pay rates accept any number

`app/actions/gym-config.ts:111-147`

`updateTrainerPayRates` is the only config action with no zod schema — just
`parseFloat` and an `isNaN` check. `500` becomes a 500% rate; `-50` becomes a
negative one. It writes straight to the fields that price every future payroll
run.

`updateCancellationPolicy` has the same shape: negative
`cancellationWindowHours` and `minSessionDuration` are accepted, and a negative
minimum silently disables BR-010.

**Fix:** zod schemas with `.min(0).max(1)` on rates and `.min(0)` on the policy
integers, matching the other three actions in the file.

---

## P2 — Server-side guards the UI is currently covering for

`lib/authz.ts` opens by stating the rule this project holds itself to: *"Every
server action is a public HTTP endpoint. A role check on the page that renders a
button is not a check on the action behind it."* These three do not meet it. The
UI blocks all of them today, so none is reachable by a normal user — but each is
a POST away for any authenticated trainer or owner.

### 5. `handleNoShow` has no status guard

`app/actions/sessions.ts:623` checks authorization and goes straight to the
transaction. Called twice on the same session it burns two credits and writes
two `RevenueRecord` rows. Called on an already-`COMPLETED` session it does the
same, on top of the revenue that completion already recognized.

### 6. `overrideSessionStatus` allows arbitrary transitions

`app/actions/sessions.ts:739` special-cases `COMPLETED`/`MISSED`/`CANCELLED` and
lets everything else through to a bare `update`. So `COMPLETED → SCHEDULED` is
permitted, and from there `endSession` runs a second time: another credit
consumed, another revenue record, another `PayRecord`. The generic branch also
writes no audit log.

### 7. `bookSession` does not validate the booking time or member state

`requestSession` rejects a past date; the owner-side `bookSession` does not. It
also books members whose `memberStatus` is `SUSPENDED` or `EXPIRED`.

**Fix for 5-7:** the pattern is already in the file — `respondToSessionRequest`
guards on `status !== "PENDING_CONFIRMATION"`. Apply the same to `handleNoShow`,
whitelist the transitions `overrideSessionStatus` accepts, and mirror
`requestSession`'s date and status checks into `bookSession`.

Worth noting why `verify:pricing` does not catch 5 and 6: its worked-example
block re-implements the model in the script rather than exercising
`consumePackCredit`. It validates `lib/pricing.ts`, not the actions that call it.

---

## P3 — Honesty of what's on screen

### 8. The subscription page is still fabricated

`getGymSubscription` (`app/actions/subscription.ts:14-28`) auto-creates a
subscription on first view with `tier: GROWTH`, `status: ACTIVE`, and
`paymentMethodLast4: "4242"`. The owner sees an active paid plan and a card on
file that were invented by the page load. There are currently **0**
`GymSubscription` rows in the database, so this fires on the client's first
visit.

Both buttons are `alert()` stubs, and the GROWTH tier advertises **"In-App
Messaging"** — a feature cut from Phase 1 and removed from the schema in M1-4.

**Fix:** default to `TRIAL` with no payment method, drop the messaging bullet,
and label the buttons as contact-support rather than faking a billing portal.

### 9. "Members in Gym" is not a member count

`app/actions/dashboard.ts:21` counts PT sessions with status `ACTIVE` scheduled
today. The tile beside it, "Active Sessions", counts `ACTIVE` sessions with no
date filter. In practice both show the same number, and neither is a headcount —
there is no check-in feature to derive one from.

**Fix:** rename to "Sessions in Progress", or drop one of the two tiles.

### 10. Fake receipts

`member-profile-client.tsx:287` and `:314` render a "receipt" via `alert()`
with invented wording ("via GymOS Desk Billing"). No receipt exists until the
M2-1 Payment ledger.

### 11. Peak-hours chart shows counts labelled as averages

`app/actions/analytics.ts:95`:

```ts
avgSessions: Math.round((count / 30) * 10) / 10 || count
```

When the average rounds to `0`, `|| count` substitutes the raw count. With the
client's small dataset the chart will read `1`, `2`, `3` where it means
`0.1`, `0.2`, `0.3`.

---

## P4 — Housekeeping

- **Prisma 6.19 → 7.x.** The CLI already warns: `package.json#prisma` is
  deprecated and removed in Prisma 7 — migrate to `prisma.config.ts`. `npm audit`
  reports 3 high-severity advisories, all `deepmerge-ts` reached through
  `@prisma/config`; build-time only, no runtime exposure.
- **Drop `--webpack` from the build script.** `npx next build` on Turbopack was
  verified working. Keeping the flag means dev and prod use different bundlers
  for no current reason.
- **Patch bumps:** `next` and `eslint-config-next` 16.3.0 → 16.3.1.
- **Deliberately deferred majors:** `zod` 3→4, `lucide-react` 0.475→1.31,
  `typescript` 5→7, `eslint` 9→10. None blocking; each is a breaking change
  worth its own packet after delivery.
- **Lint debt:** 79 errors / 40 warnings, dominated by 65 `no-explicit-any`.
  Four are `react-hooks/set-state-in-effect` in `dashboard-chrome.tsx` and
  `data-table.tsx` — both are deliberate and commented, and both are candidates
  for `useMemo`/derived state instead. `test-booking.js` and `scripts/check-db.js`
  are untracked scratch files tripping `no-require-imports`; delete or ignore them.
- **`prisma/dev.db`** is a leftover SQLite file from before the Postgres move.
  Delete it.
- **Notification polling.** `NotificationBell` fires two queries every 20s per
  open tab. Fine for one gym; worth moving to an interval-on-focus or a single
  aggregated query before the gym count grows.
- **No test framework.** `verify:pricing` is the only automated check. The
  double-count paths in P2 are exactly what a thin integration suite around
  `endSession`/`handleNoShow` would have caught.

---

## Still open from earlier packets

- `NEXTAUTH_SECRET` is rotated locally but **not set in Vercel** — the next
  deploy fails on boot by design (`lib/env.ts`).
- Money is still `Float`. Must land before the client has live financial
  records; see `docs/revenue-model.md`.
