import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
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

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          gymId: user.gymId,
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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = (token.email as string) || ""
        session.user.fullName = token.fullName as string
        session.user.role = token.role as Role
        session.user.gymId = token.gymId as string | null
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

export function isSuperAdmin(session: any) {
  return session?.user?.role === "SUPER_ADMIN"
}
