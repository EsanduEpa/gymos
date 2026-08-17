import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { cookies } from "next/headers"

// Every server action is a public HTTP endpoint. A role check on the page that
// renders a button is not a check on the action behind it, and an id that
// arrives in a form field is attacker-controlled. These helpers exist so that
// each action states its rule once, in one shape, and can't silently skip it.

export const IMPERSONATION_COOKIE = "superAdminGymId"

export type Authorized = {
  ok: true
  userId: string
  fullName: string
  role: Role
  /** The gym this call acts within. Never null — actions can use it directly. */
  gymId: string
  isSuperAdmin: boolean
}

export type Denied = { ok: false; error: string }

export type AuthResult = Authorized | Denied

/**
 * Resolves which gym the caller is acting inside.
 *
 * A SUPER_ADMIN has no gym of their own, so they may adopt one for the request
 * via the impersonation cookie. The role is checked here rather than where the
 * cookie is written, because anyone can set a cookie in their own browser —
 * only the role makes it trustworthy.
 */
export async function getEffectiveGymId(role: Role, ownGymId?: string | null) {
  if (role === Role.SUPER_ADMIN) {
    const jar = await cookies()
    const impersonated = jar.get(IMPERSONATION_COOKIE)?.value
    if (impersonated) return impersonated
  }
  return ownGymId ?? null
}

/**
 * The gate every gym-scoped action opens with. Confirms there is a session,
 * that the role is allowed, and that a gym can be resolved — then hands back a
 * context whose `gymId` is safe to query with.
 */
export async function authorize(allowed: Role[]): Promise<AuthResult> {
  const session = await auth()
  if (!session?.user) {
    return { ok: false, error: "You are not signed in." }
  }

  const { id, fullName, role } = session.user
  if (!allowed.includes(role)) {
    return { ok: false, error: "You do not have access to this." }
  }

  const gymId = await getEffectiveGymId(role, session.user.gymId)
  if (!gymId) {
    return {
      ok: false,
      error:
        role === Role.SUPER_ADMIN
          ? "Select a gym before performing this action."
          : "Your account is not linked to a gym.",
    }
  }

  return {
    ok: true,
    userId: id,
    fullName,
    role,
    gymId,
    isSuperAdmin: role === Role.SUPER_ADMIN,
  }
}

/** Same rule as `authorize`, for call sites that throw rather than return an error. */
export async function authorizeOrThrow(allowed: Role[]): Promise<Authorized> {
  const result = await authorize(allowed)
  if (!result.ok) throw new Error(result.error)
  return result
}

/**
 * Authorizes a caller who need not belong to any gym — members and trainers
 * acting purely on their own records. Use `authorize` wherever a gym is needed.
 */
export async function authorizeUser(allowed: Role[]) {
  const session = await auth()
  if (!session?.user) return null
  if (!allowed.includes(session.user.role)) return null
  return session.user
}

/**
 * Loads a user only if they sit inside `gymId`, optionally pinning the role.
 *
 * This is the check that stops an id lifted from one gym's URL or form from
 * being used against another gym's records. Returns null rather than throwing
 * so callers can answer "not found" instead of confirming the record exists.
 */
export async function findUserInGym(
  gymId: string,
  userId: string,
  role?: Role
) {
  if (!userId) return null
  return prisma.user.findFirst({
    where: { id: userId, gymId, ...(role ? { role } : {}) },
  })
}

/** True when a record carrying a gymId belongs to the caller's gym. */
export function ownedByGym(entity: { gymId: string } | null, gymId: string) {
  return entity != null && entity.gymId === gymId
}

/**
 * Statuses that establish a trainer↔client relationship. Booking is the hire
 * mechanism, so a confirmed or completed session is what makes someone a
 * trainer's client. A still-pending request deliberately does not count — the
 * trainer reviews that on their schedule, without access to the full profile.
 */
export const CLIENT_RELATIONSHIP_STATUSES = [
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
] as const

/**
 * The single definition of "this trainer's client", as a Prisma `where`
 * fragment. Every screen and action that reads client data composes this, so
 * the roster, the profile and the plan builder can never disagree about who a
 * trainer is allowed to see.
 */
export function trainerClientWhere(gymId: string, trainerId: string) {
  return {
    gymId,
    role: Role.GYM_MEMBER,
    sessionsClient: {
      some: {
        trainerId,
        status: { in: [...CLIENT_RELATIONSHIP_STATUSES] },
      },
    },
  }
}
