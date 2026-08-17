# Phase D: API & Backend Security Hardening

**Objective**: Secure the GymOS Next.js backend against common vulnerabilities by implementing CSV injection prevention, security headers, authentication rate limiting, and JWT session hardening.

**Prerequisites**: 
- Phase A (Authentication & Prisma setup) should be complete.
- Ensure you are working in the root directory of the GymOS project.

---

## Step 1: Prevent CSV Injection

**File**: `app/api/export/csv/route.ts`
**Action**: Modify existing file

**Current code**:
```typescript
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user || (session.user.role !== "GYM_OWNER" && session.user.role !== "SUPER_ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const gymId = session.user.gymId
  if (!gymId) {
    return new NextResponse("No gym assigned", { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "financials"
  const startDateStr = searchParams.get("startDate")
  const endDateStr = searchParams.get("endDate")

  const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endDate = endDateStr ? new Date(endDateStr) : new Date()

  if (type === "payroll") {
    const payRecords = await prisma.payRecord.findMany({
      where: {
        payPeriod: {
          gymId,
          startDate: { gte: startDate },
          endDate: { lte: endDate },
        },
      },
      include: {
        trainer: true,
        payPeriod: true,
        session: true,
      },
      orderBy: { createdAt: "desc" },
    })

    let csv = "Record ID,Trainer Name,Trainer Level,Pay Period Status,Amount,Shift Status,Description,Date\n"
    payRecords.forEach((r) => {
      const shift = r.session?.shiftStatus || "IN_SHIFT"
      csv += `"${r.id}","${r.trainer.fullName}","${r.trainer.trainerLevel}","${r.payPeriod.status}",${r.amount},"${shift}","${r.description || ""}","${r.createdAt.toISOString()}"\n`
    })

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="payroll-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  const revenues = await prisma.revenueRecord.findMany({
    where: { gymId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  })

  const expenses = await prisma.expenseRecord.findMany({
    where: { gymId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  })

  let csv = "--- REVENUE RECORDS ---\n"
  csv += "ID,Category,Amount,Description,Date\n"
  revenues.forEach((r) => {
    csv += `"${r.id}","${r.category}",${r.amount},"${r.description || ""}","${r.date.toISOString()}"\n`
  })

  csv += "\n--- EXPENSE RECORDS ---\n"
  csv += "ID,Category,Amount,Recurring,Description,Date\n"
  expenses.forEach((e) => {
    csv += `"${e.id}","${e.category}",${e.amount},${e.isRecurring},"${e.description || ""}","${e.date.toISOString()}"\n`
  })

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="financial-report-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
```

**Replace with**:
```typescript
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function sanitizeCsvCell(value: string): string {
  if (!value) return '';
  // Prevent CSV injection: prefix dangerous characters with a single quote
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some(char => value.startsWith(char))) {
    return "'" + value;
  }
  // Escape double quotes by doubling them
  return value.replace(/"/g, '""');
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user || (session.user.role !== "GYM_OWNER" && session.user.role !== "SUPER_ADMIN")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } })
    }

    const gymId = session.user.gymId
    if (!gymId) {
      return new NextResponse(JSON.stringify({ error: "No gym assigned" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "financials"
    const startDateStr = searchParams.get("startDate")
    const endDateStr = searchParams.get("endDate")

    const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = endDateStr ? new Date(endDateStr) : new Date()

    if (type === "payroll") {
      const payRecords = await prisma.payRecord.findMany({
        where: {
          payPeriod: {
            gymId,
            startDate: { gte: startDate },
            endDate: { lte: endDate },
          },
        },
        include: {
          trainer: true,
          payPeriod: true,
          session: true,
        },
        orderBy: { createdAt: "desc" },
      })

      let csv = "\uFEFFRecord ID,Trainer Name,Trainer Level,Pay Period Status,Amount,Shift Status,Description,Date\n"
      payRecords.forEach((r) => {
        const shift = r.session?.shiftStatus || "IN_SHIFT"
        csv += `"${sanitizeCsvCell(r.id)}","${sanitizeCsvCell(r.trainer.fullName)}","${sanitizeCsvCell(r.trainer.trainerLevel)}","${sanitizeCsvCell(r.payPeriod.status)}",${r.amount},"${sanitizeCsvCell(shift)}","${sanitizeCsvCell(r.description || "")}","${sanitizeCsvCell(r.createdAt.toISOString())}"\n`
      })

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="payroll-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    const revenues = await prisma.revenueRecord.findMany({
      where: { gymId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "asc" },
    })

    const expenses = await prisma.expenseRecord.findMany({
      where: { gymId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "asc" },
    })

    let csv = "\uFEFF--- REVENUE RECORDS ---\n"
    csv += "ID,Category,Amount,Description,Date\n"
    revenues.forEach((r) => {
      csv += `"${sanitizeCsvCell(r.id)}","${sanitizeCsvCell(r.category)}",${r.amount},"${sanitizeCsvCell(r.description || "")}","${sanitizeCsvCell(r.date.toISOString())}"\n`
    })

    csv += "\n--- EXPENSE RECORDS ---\n"
    csv += "ID,Category,Amount,Recurring,Description,Date\n"
    expenses.forEach((e) => {
      csv += `"${sanitizeCsvCell(e.id)}","${sanitizeCsvCell(e.category)}",${e.amount},${e.isRecurring},"${sanitizeCsvCell(e.description || "")}","${sanitizeCsvCell(e.date.toISOString())}"\n`
    })

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="financial-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to generate CSV" }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}
```

---

## Step 2: Implement Security Headers

**File**: `next.config.ts`
**Action**: Modify existing file

**Current code**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

**Replace with**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default nextConfig;
```

---

## Step 3: Implement Login Rate Limiting

**File**: `lib/rate-limit.ts`
**Action**: Create new file

**Replace with**:
```typescript
/**
 * Simple in-memory rate limiter for login attempts.
 * For production with multiple instances, replace with Redis (e.g., Upstash).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const attempts = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts.entries()) {
    if (now > entry.resetTime) {
      attempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = attempts.get(identifier);

  if (!entry || now > entry.resetTime) {
    attempts.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { 
      allowed: false, 
      retryAfterMs: entry.resetTime - now 
    };
  }

  entry.count++;
  return { allowed: true };
}

export function resetRateLimit(identifier: string): void {
  attempts.delete(identifier);
}
```

---

## Step 4: JWT Session Hardening & Rate Limit Integration

**File**: `lib/auth.ts`
**Action**: Modify existing file

Note: You should already be modifying the `lib/auth.ts` version that was created in Phase A. Ensure `authorize`, `session`, and `jwt` match the requirements below.

**Current code** (approximate, based on Phase A):
```typescript
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
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
      }
    })
  ],
  session: { strategy: "jwt" },
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
```

**Replace with**:
```typescript
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Rate limiting check
        const { checkRateLimit, resetRateLimit } = await import('@/lib/rate-limit')
        const rateLimitResult = checkRateLimit(email)
        if (!rateLimitResult.allowed) {
          throw new Error('Too many login attempts. Please try again later.')
        }

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

        // Reset rate limit on successful login
        resetRateLimit(email)

        // Check if user account is active
        if (user.role === 'PERSONAL_TRAINER' && user.trainerStatus === 'DEACTIVATED') {
          throw new Error('Your trainer account has been deactivated. Contact your gym owner.')
        }
        if (user.role === 'GYM_MEMBER' && (user.memberStatus === 'SUSPENDED' || user.memberStatus === 'INACTIVE')) {
          throw new Error('Your membership is suspended or inactive. Contact your gym.')
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          gymId: user.gymId,
        }
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours instead of 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.email = user.email || ""
        token.fullName = user.fullName
        token.role = user.role
        token.gymId = user.gymId
      }
      
      // Periodically re-verify user status from DB (every hour)
      const now = Math.floor(Date.now() / 1000)
      const lastVerified = (token.lastVerified as number) || 0
      if (now - lastVerified > 3600) { // 1 hour
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, gymId: true, memberStatus: true, trainerStatus: true, fullName: true },
          })
          if (!dbUser) {
            // User was deleted
            return { ...token, error: 'user-deleted' }
          }
          // Update token with latest DB values
          token.role = dbUser.role
          token.gymId = dbUser.gymId
          token.fullName = dbUser.fullName
          token.lastVerified = now
        } catch {
          // If DB check fails, keep existing token data
        }
      }
      
      return token
    },
```

---

## Step 5: Clean up test files from production

1. Run the following shell command to move test files out of the root:
   ```bash
   mkdir -p scripts && mv test-booking.js scripts/
   ```

2. **File**: `.gitignore`
   **Action**: Modify existing file

   **Add the following at the end of the `.gitignore`**:
   ```
   # Scripts
   /scripts
   ```

---

## Verification Steps

Run the following commands to verify everything was implemented correctly:

1. **Verify build passes**:
   ```bash
   npm run build
   ```
   *The application should compile without any TypeScript or build errors.*

2. **Check Security Headers**:
   ```bash
   curl -I http://localhost:3000
   ```
   *Verify that headers like `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security` are present in the response.*

3. **Verify Rate Limiting**:
   - Run the development server (`npm run dev`)
   - Attempt to log in with an incorrect password for the same email 6 times rapidly.
   - On the 6th attempt, you should receive a "Too many login attempts. Please try again later." error message.
