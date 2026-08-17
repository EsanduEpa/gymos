import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { authSecret } from "@/lib/env"
import { verifyPassword } from "@/lib/passwords"
import { clientIpFrom, consumeRateLimit, resetRateLimit, LOGIN_RATE_LIMIT } from "@/lib/rate-limit"
import { MemberStatus, Role } from "@prisma/client"

// Auth.js deliberately hides why a credentials sign-in failed, to avoid
// revealing whether an account exists. These two cases are safe to surface and
// genuinely need to be: "invalid email or password" for a throttled or
// suspended user is misleading, and generates support calls.
//
// Neither leaks account existence. The rate limit is checked before the
// database lookup, so it fires identically for unknown emails; the inactive
// check only runs after a correct password, which the attacker would already
// need to hold.
class RateLimitedError extends CredentialsSignin {
  code = "rate_limited"
}

class AccountInactiveError extends CredentialsSignin {
  code = "account_inactive"
}

/** Sessions last a working day, not a month. */
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60

/** How often the token is re-checked against the database. */
const REVALIDATE_AFTER_MS = 5 * 60 * 1000

/**
 * Whether an account may still hold a session.
 *
 * Suspending a member or deactivating a trainer has to actually end their
 * access. Before this check, a suspended member kept a working session until
 * the token expired.
 */
function accountIsActive(user: {
  role: Role
  memberStatus: MemberStatus | null
  trainerStatus: string | null
}) {
  if (user.role === Role.GYM_MEMBER) {
    return user.memberStatus === MemberStatus.ACTIVE || user.memberStatus === null
  }
  if (user.role === Role.PERSONAL_TRAINER) {
    return user.trainerStatus !== "DEACTIVATED"
  }
  return true
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required on Vercel, which terminates TLS at its proxy and passes the real
  // host through — NextAuth cannot infer its own URL otherwise. The header is
  // set by the platform rather than the client, so it is trustworthy *here*.
  // If this app is ever self-hosted behind a proxy you control, set
  // AUTH_URL explicitly instead of trusting the host.
  trustHost: true,
  secret: authSecret(),
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  jwt: { maxAge: SESSION_MAX_AGE_SECONDS },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).trim().toLowerCase()
        const password = credentials.password as string

        // Keyed on IP *and* email so one attacker cannot lock out every user
        // behind a shared address, and cannot dodge the limit by cycling
        // addresses against a single account either.
        const ip = clientIpFrom(await headers())
        const key = `${ip}|${email}`

        if (!consumeRateLimit(LOGIN_RATE_LIMIT, key).allowed) {
          throw new RateLimitedError()
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await verifyPassword(password, user.password)
        if (!isPasswordValid) {
          return null
        }

        if (!accountIsActive(user)) {
          throw new AccountInactiveError()
        }

        // Success clears the counter so a legitimate user who mistyped twice
        // isn't still throttled afterwards.
        resetRateLimit(LOGIN_RATE_LIMIT, key)

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          gymId: user.gymId,
          mustChangePassword: user.mustChangePassword,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email || ""
        token.fullName = user.fullName
        token.role = user.role
        token.gymId = user.gymId
        token.mustChangePassword = user.mustChangePassword ?? false
        token.checkedAt = Date.now()
        return token
      }

      // A JWT is self-contained, so nothing in it reflects changes made since
      // sign-in. Re-read the account periodically: a suspended member, a
      // deactivated trainer, a role or gym change, or a deleted account must
      // all take effect without waiting out the token's lifetime.
      const checkedAt = typeof token.checkedAt === "number" ? token.checkedAt : 0
      if (Date.now() - checkedAt < REVALIDATE_AFTER_MS) {
        return token
      }

      const current = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          gymId: true,
          memberStatus: true,
          trainerStatus: true,
          mustChangePassword: true,
        },
      })

      // Returning null invalidates the session — the user is gone or barred.
      if (!current || !accountIsActive(current)) {
        return null
      }

      token.email = current.email
      token.fullName = current.fullName
      token.role = current.role
      token.gymId = current.gymId
      token.mustChangePassword = current.mustChangePassword
      token.checkedAt = Date.now()
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = (token.email as string) || ""
        session.user.fullName = token.fullName as string
        session.user.role = token.role as Role
        session.user.gymId = token.gymId as string | null
        session.user.mustChangePassword = Boolean(token.mustChangePassword)
      }
      return session
    },
  },
})

export async function requireRole(allowedRoles: Role[]) {
  const session = await auth()
  if (!session || !session.user) {
    return { authorized: false, session: null }
  }
  if (!allowedRoles.includes(session.user.role)) {
    return { authorized: false, session }
  }
  return { authorized: true, session }
}

export function isSuperAdmin(session: { user?: { role?: Role } } | null) {
  return session?.user?.role === Role.SUPER_ADMIN
}
