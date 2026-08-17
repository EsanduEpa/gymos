# Phase B: Middleware & Route Protection

## Objective
Migrate the existing Next.js middleware logic from an incorrectly named `proxy.ts` file to the standard `middleware.ts` file at the project root. We will also enhance the logic to handle authenticated users on the landing page and remove hardcoded fallback secrets.

## Prerequisites
- The Next.js project should be initialized.
- `next-auth` should be installed and configured.

## Step 1: Delete the old `proxy.ts` file
**Action**: Delete existing file

**Command to execute**:
```bash
rm /Users/esanduepa/Desktop/Projects/gymos/proxy.ts
```
*(If the file does not exist, you can proceed to Step 2).*

## Step 2: Create `middleware.ts` at project root
**File**: `/Users/esanduepa/Desktop/Projects/gymos/middleware.ts`
**Action**: Create new file

**Replace with**:
```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET
  const isProduction = process.env.NODE_ENV === "production"
  
  // Try to get the session token
  let token = await getToken({ 
    req, 
    secret,
    secureCookie: isProduction,
    salt: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token"
  })

  // Fallback for different NextAuth beta cookie naming
  if (!token) {
    token = await getToken({ 
      req, 
      secret,
      secureCookie: isProduction,
      salt: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token"
    })
  }

  const { pathname } = req.nextUrl

  // --- Landing page: redirect authenticated users to their dashboard ---
  if (pathname === "/") {
    if (token) {
      const role = token.role as string
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/admin", req.url))
      if (role === "GYM_OWNER") return NextResponse.redirect(new URL("/owner", req.url))
      if (role === "PERSONAL_TRAINER") return NextResponse.redirect(new URL("/trainer", req.url))
    }
    return NextResponse.next()
  }

  // --- Auth pages: redirect already-authenticated users away from login ---
  const isAuthPage = pathname.startsWith("/login")
  if (isAuthPage) {
    if (token) {
      const role = token.role as string
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/admin", req.url))
      if (role === "GYM_OWNER") return NextResponse.redirect(new URL("/owner", req.url))
      if (role === "PERSONAL_TRAINER") return NextResponse.redirect(new URL("/trainer", req.url))
      // GYM_MEMBER can't use web dashboard
      return NextResponse.redirect(new URL("/login?error=member_app_only", req.url))
    }
    return NextResponse.next()
  }

  // --- Dashboard pages: require authentication + correct role ---
  const isDashboardPage =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/trainer") ||
    pathname.startsWith("/admin")

  if (isDashboardPage) {
    // Not authenticated → redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role as string

    // Role-based access control
    if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
      if (role === "GYM_OWNER") return NextResponse.redirect(new URL("/owner", req.url))
      if (role === "PERSONAL_TRAINER") return NextResponse.redirect(new URL("/trainer", req.url))
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (pathname.startsWith("/owner") && role !== "GYM_OWNER" && role !== "SUPER_ADMIN") {
      if (role === "PERSONAL_TRAINER") return NextResponse.redirect(new URL("/trainer", req.url))
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (pathname.startsWith("/trainer") && role !== "PERSONAL_TRAINER" && role !== "SUPER_ADMIN") {
      if (role === "GYM_OWNER") return NextResponse.redirect(new URL("/owner", req.url))
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/owner/:path*",
    "/trainer/:path*",
    "/admin/:path*",
  ],
}
```

## Step 3: Verify
Run the following verification steps:
1. Compile the project to ensure there are no build errors. Run:
```bash
npm run build
```
2. **Manual Test (Unauthenticated):** Visit `/owner` and verify you are redirected to `/login`.
3. **Manual Test (Role Isolation):** Log in as a `PERSONAL_TRAINER` and attempt to visit `/owner`. Verify you are redirected to `/trainer` or `/login`.
4. **Manual Test (Authenticated Redirection):** While authenticated, visit `/login` or `/`. Verify you are automatically redirected to the respective role's dashboard.
