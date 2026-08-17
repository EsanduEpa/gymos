# Phase A: Critical Security Fixes

## Objective
This phase addresses 4 critical security vulnerabilities that must be fixed before deploying to production. These fixes ensure secure authentication, eliminate hardcoded secrets, and prevent open redirect vulnerabilities.

## Prerequisites
- Node.js installed
- Next.js project set up
- Ensure you have a backup of your codebase or are on a fresh git branch before starting.

---

## Step 1: Remove Hardcoded Secrets in Auth Config

**File**: `lib/auth.ts`
**Action**: Modify existing file

**Current code**:
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "gymos_secret_key_production_level_auth_2026_super_secure",
  session: { strategy: "jwt" },
```

**Replace with**:
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('FATAL: NEXTAUTH_SECRET environment variable is not set. Application cannot start without it.');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
```

---

## Step 2: Remove Hardcoded Default Passwords

### Step 2a: Create Secure Password Utility

**File**: `lib/password.ts`
**Action**: Create new file

**Code**:
```typescript
import crypto from 'crypto';

export function generateSecurePassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}
```

### Step 2b: Update Member Creation

**File**: `app/actions/members.ts`
**Action**: Modify existing file

**Current code**:
```typescript
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
```
*(and lower down in the file)*
```typescript
  try {
    const passwordHash = await bcrypt.hash("password123", 10)
    const startDate = new Date()
```

**Replace with**:
```typescript
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { generateSecurePassword } from "@/lib/password"
```
*(and lower down in the file)*
```typescript
  try {
    const tempPassword = generateSecurePassword()
    const passwordHash = await bcrypt.hash(tempPassword, 10)
    // TODO: In production, send tempPassword via email/SMS to the new member
    // TODO: Add `mustChangePassword: true` to user creation once schema is updated
    console.log(`[DEV] Generated temporary password for ${email}: ${tempPassword}`)
    
    const startDate = new Date()
```

### Step 2c: Update Trainer Creation

**File**: `app/actions/trainers.ts`
**Action**: Modify existing file

**Current code**:
```typescript
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
```
*(and lower down in the file)*
```typescript
  try {
    const passwordHash = await bcrypt.hash("password123", 10)

    const trainer = await prisma.user.create({
```

**Replace with**:
```typescript
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { generateSecurePassword } from "@/lib/password"
```
*(and lower down in the file)*
```typescript
  try {
    const tempPassword = generateSecurePassword()
    const passwordHash = await bcrypt.hash(tempPassword, 10)
    // TODO: In production, send tempPassword via email/SMS to the new trainer
    // TODO: Add `mustChangePassword: true` to user creation once schema is updated
    console.log(`[DEV] Generated temporary password for ${validated.data.email}: ${tempPassword}`)

    const trainer = await prisma.user.create({
```

---

## Step 3: Fix Open Redirect Vulnerability

**File**: `app/(auth)/login/page.tsx`
**Action**: Modify existing file

Find the redirect logic inside the login submission handler.

**Current code**:
```typescript
if (callbackUrl) {
  window.location.href = callbackUrl
} else {
  window.location.href = "/owner"
}
```

**Replace with**:
```typescript
// Validate callbackUrl to prevent open redirect attacks
const safeCallbackUrl = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') 
  ? callbackUrl 
  : '/owner';
window.location.href = safeCallbackUrl;
```

---

## Step 4: Add Startup Environment Validation

**File**: `lib/env-check.ts`
**Action**: Create new file

**Code**:
```typescript
/**
 * Environment variable validation.
 * Import this file early in your app to fail fast if required env vars are missing.
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `\n❌ FATAL: Missing required environment variables:\n${missing.map(k => `   - ${k}`).join('\n')}\n\nPlease set them in your .env file or deployment environment.\n`
    );
  }
}
```

---

## Verification Steps

Once all changes are applied, verify the system works correctly:

1. Build the project to check for compilation errors:
   ```bash
   npm run build
   ```
2. Verify hardcoded secrets are removed:
   ```bash
   grep -r 'gymos_secret_key' --include='*.ts' --include='*.tsx' .
   ```
   *(This should return NO results)*
3. Verify hardcoded passwords are removed:
   ```bash
   grep -r 'password123' --include='*.ts' --include='*.tsx' .
   ```
   *(This should return NO results)*
4. Run the development server (`npm run dev`) and manually test the login flow to ensure authentication still works successfully and redirects to `/owner` by default.
