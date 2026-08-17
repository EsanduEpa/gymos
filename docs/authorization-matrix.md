# Authorization Matrix

Every server action is a public HTTP endpoint. This table is the record of what
each one allows, and it is the evidence that one gym cannot reach another's
data. **Update it in the same commit as any change to an action's access rule.**

Roles: `SA` SuperAdmin · `GO` Gym Owner · `PT` Personal Trainer · `GM` Gym Member

## How the rules are enforced

All of it lives in [`lib/authz.ts`](../lib/authz.ts):

| Helper | Job |
|---|---|
| `authorize(roles)` | Session exists, role is allowed, gym resolves. Returns a context whose `gymId` is safe to query with. |
| `authorizeOrThrow(roles)` | Same rule, for call sites that throw instead of returning an error. |
| `getEffectiveGymId(role, ownGymId)` | Resolves the acting gym. Honours the impersonation cookie **only** for `SUPER_ADMIN` — anyone can set a cookie, so the role is what makes it trustworthy. |
| `findUserInGym(gymId, userId, role?)` | Loads a user only if they sit inside the caller's gym. This is what stops an id lifted from a URL or form being used against another tenant. |
| `trainerClientWhere(gymId, trainerId)` | The single definition of "this trainer's client" — a member in the same gym sharing at least one `SCHEDULED` / `ACTIVE` / `COMPLETED` session. Composed by every screen and action that reads client data. |

Two rules of thumb when adding an action:

1. **Never trust an id that arrived from the caller.** Re-load it scoped to the gym.
2. **Never derive identity from a form field.** Take the actor from the session (`auth.userId`), as `requestSession` does.

## Server actions

| Action | SA | GO | PT | GM | Scope beyond role |
|---|:--:|:--:|:--:|:--:|---|
| **admin.ts** |
| `getSuperAdminData` | ✅ | — | — | — | Platform-wide by design |
| `setImpersonatedGym` | ✅ | — | — | — | Target gym must exist; cookie is httpOnly |
| **dashboard.ts / analytics.ts / audit.ts / subscription.ts** |
| `getOwnerDashboardData` | ✅ | ✅ | — | — | Own gym |
| `getAnalyticsData` | ✅ | ✅ | — | — | Own gym |
| `getAuditLogs` | ✅ | ✅ | — | — | Own gym |
| `getGymSubscription` | ✅ | ✅ | — | — | Own gym |
| **gym-config.ts** |
| `updateGymProfile` | ✅ | ✅ | — | — | Own gym |
| `createMembershipPlan` | ✅ | ✅ | — | — | Own gym |
| `updateTrainerPayRates` | ✅ | ✅ | — | — | Own gym |
| `updateCancellationPolicy` | ✅ | ✅ | — | — | Own gym |
| **members.ts** |
| `createMember` | ✅ | ✅ | — | — | Membership plan must belong to the gym |
| `updateMemberStatus` | ✅ | ✅ | — | — | Member must be in the gym |
| `checkMembershipExpiries` | ✅ | ✅ | — | — | Own gym |
| **trainers.ts** |
| `createTrainer` | ✅ | ✅ | — | — | Own gym |
| `updateTrainerStatus` | ✅ | ✅ | — | — | Trainer must be in the gym |
| `approveShiftHours` | ✅ | ✅ | — | — | Trainer must be in the gym |
| **packs.ts** |
| `issueSessionPack` | ✅ | ✅ | — | — | Member must be in the gym. `SessionPack` has no `gymId`, so the member is the only tenant link |
| **plans.ts** |
| `saveWorkoutPlan` | — | — | ✅ | — | Client must be the trainer's own |
| `saveMealPlan` | — | — | ✅ | — | Client must be the trainer's own |
| **sessions.ts** |
| `bookSession` | ✅ | ✅ | — | — | Trainer and client both verified in the gym |
| `requestSession` | — | — | — | ✅ | Actor forced to `auth.userId`; trainer verified in the gym |
| `respondToSessionRequest` | — | — | ✅ | — | Must be the trainer the request is addressed to |
| `startSession` | ✅ | ✅ | ✅ | — | Party to the session, or owner of its gym |
| `endSession` | ✅ | ✅ | ✅ | — | Party to the session, or owner of its gym |
| `handleNoShow` | ✅ | ✅ | ✅ | — | Party to the session, or owner of its gym |
| `updateSessionNotes` | ✅ | ✅ | ✅ | — | Party to the session, or owner of its gym |
| `cancelSession` | ✅ | ✅ | ✅ | ✅ | Any party to the session, or owner of its gym |
| `overrideSessionStatus` | ✅ | ✅ | — | — | Owner of the session's gym |
| **financials.ts** (all 11) |
| `getRevenueOverview`, `getExpenses`, `getBudgetVsActual`, `getDeferredRevenue`, `getCurrentPayPeriodInfo`, `generatePnL` | ✅ | ✅ | — | — | Own gym |
| `createExpense`, `setCategoryBudget` | ✅ | ✅ | — | — | Own gym |
| `closePayPeriod`, `approvePayPeriod` | ✅ | ✅ | — | — | Pay period must belong to the gym |
| `recordManualPayment` | ✅ | ✅ | — | — | Member must be in the gym |
| **notifications.ts** |
| `getUserNotifications` | ✅ | ✅ | ✅ | ✅ | Own records only |
| `markNotificationAsRead` | ✅ | ✅ | ✅ | ✅ | Own records only |
| `markAllNotificationsAsRead` | ✅ | ✅ | ✅ | ✅ | Own records only |

## Pages that query the database directly

A page is as exposed as an action — the Client 360 leak was a page, not an action.

| Page | Scope |
|---|---|
| `owner/**` | Gym-scoped on every query |
| `trainer/clients`, `trainer/clients/[id]` | `trainerClientWhere` |
| `trainer/plans/workout/new`, `trainer/plans/meal/new` | `trainerClientWhere` |
| `trainer/schedule`, `trainer/earnings` | Own `trainerId` |
| `member/**` | Own `id`, or gym-scoped for the trainer directory |

## Deliberate decisions

- **Plans are trainer-only.** `GYM_OWNER` was previously accepted but would have
  written the owner in as trainer-of-record, inventing a relationship no session
  backs. The plan builder already lives under `/trainer`.
- **A pending request does not make someone your client.** The trainer reviews it
  on their schedule; the full profile stays closed until they accept.
- **`SUPER_ADMIN` needs a gym before acting as one.** They have no `gymId` of
  their own, so gym-scoped actions require an impersonation target.

## Known gaps

- **Pages don't resolve impersonation yet.** They read `session.user.gymId`
  directly rather than `getEffectiveGymId`, so a super admin's impersonation
  applies to actions but not page reads. Not a data-exposure risk — pages fall
  back to the viewer's own gym. Finish in M2-2 with the rest of impersonation.
- **`authorizeSessionActor` grants `SUPER_ADMIN` access to any gym's session**
  regardless of impersonation target. Intentional today; revisit in M2-2.
- **Untested.** These rules are enforced but not yet proven. The hostile-tenant
  test in M2-3 is what turns this table into evidence.
