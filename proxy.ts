import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { authSecret } from "@/lib/env"

export async function proxy(req: NextRequest) {
  const secret = authSecret()
  const isProduction = process.env.NODE_ENV === "production"
  
  let token = await getToken({ 
    req, 
    secret,
    secureCookie: isProduction,
    salt: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token"
  })

  // Fallback for NextAuth older beta versions
  if (!token) {
    token = await getToken({ 
      req, 
      secret,
      secureCookie: isProduction,
      salt: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token"
    })
  }
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith("/login")
  const isChangePasswordPage = pathname.startsWith("/change-password")
  const isDashboardPage =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/trainer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/member")

  // An account still on its issued temporary password gets exactly one
  // destination. Checked before the role routing below so it cannot be stepped
  // around by navigating straight to a dashboard URL.
  if (token?.mustChangePassword && !isChangePasswordPage) {
    return NextResponse.redirect(new URL("/change-password", req.url))
  }

  if (isChangePasswordPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    return NextResponse.next()
  }

  if (isAuthPage) {
    if (token) {
      const role = token.role
      if (role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url))
      } else if (role === "GYM_OWNER") {
        return NextResponse.redirect(new URL("/owner", req.url))
      } else if (role === "PERSONAL_TRAINER") {
        return NextResponse.redirect(new URL("/trainer", req.url))
      } else if (role === "GYM_MEMBER") {
        return NextResponse.redirect(new URL("/member", req.url))
      } else {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }
    return NextResponse.next()
  }

  if (isDashboardPage) {
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role as string

    // Role-based path checks
    if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
      if (role === "GYM_OWNER") return NextResponse.redirect(new URL("/owner", req.url))
      if (role === "PERSONAL_TRAINER") return NextResponse.redirect(new URL("/trainer", req.url))
      if (role === "GYM_MEMBER") return NextResponse.redirect(new URL("/member", req.url))
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (pathname.startsWith("/owner") && role !== "GYM_OWNER" && role !== "SUPER_ADMIN") {
      if (role === "PERSONAL_TRAINER") return NextResponse.redirect(new URL("/trainer", req.url))
      if (role === "GYM_MEMBER") return NextResponse.redirect(new URL("/member", req.url))
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (pathname.startsWith("/trainer") && role !== "PERSONAL_TRAINER" && role !== "SUPER_ADMIN") {
      if (role === "GYM_OWNER") return NextResponse.redirect(new URL("/owner", req.url))
      if (role === "GYM_MEMBER") return NextResponse.redirect(new URL("/member", req.url))
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (pathname.startsWith("/member") && role !== "GYM_MEMBER" && role !== "SUPER_ADMIN") {
      if (role === "GYM_OWNER") return NextResponse.redirect(new URL("/owner", req.url))
      if (role === "PERSONAL_TRAINER") return NextResponse.redirect(new URL("/trainer", req.url))
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/change-password",
    "/owner/:path*",
    "/trainer/:path*",
    "/admin/:path*",
    "/member/:path*",
  ],
}
