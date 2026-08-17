import { Role } from "@prisma/client"

export type { Role }

export interface UserSessionData {
  id: string
  email: string
  fullName: string
  role: Role
  gymId?: string | null
}

declare module "next-auth" {
  interface User {
    id: string
    role: Role
    gymId?: string | null
    fullName: string
    mustChangePassword?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      fullName: string
      role: Role
      gymId?: string | null
      mustChangePassword?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    gymId?: string | null
    fullName: string
    mustChangePassword?: boolean
  }
}
