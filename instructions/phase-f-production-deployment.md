# Phase F: Production Deployment & Final Polish

This is the final phase before client delivery. It covers production environment setup, monitoring, legal pages, and final cleanup.

## Prerequisites
- Completion of previous phases (A through E).
- Project should build successfully locally (`npm run build`).

---

## Step 1: Create Privacy Policy Page

**File**: `app/(legal)/privacy/page.tsx`
**Action**: Create new file
**Replace with**:
```tsx
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | GymOS',
  description: 'GymOS Privacy Policy - How we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#007A35] hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-[#007A35] flex items-center justify-center text-white">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-[#171B28]">Privacy Policy</h1>
          </div>

          <p className="text-sm text-[#8B8E98] mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8 text-sm text-[#4A4D58] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">1. Information We Collect</h2>
              <p>GymOS collects information necessary to provide gym management services, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Personal Information:</strong> Full name, email address, phone number, date of birth</li>
                <li><strong>Health Information:</strong> Health notes, body metrics (weight, body fat percentage, muscle mass), fitness goals, progress photos</li>
                <li><strong>Account Information:</strong> Login credentials (password stored in encrypted form), role assignments</li>
                <li><strong>Financial Information:</strong> Membership payments, session pack purchases, trainer earnings</li>
                <li><strong>Usage Data:</strong> Session attendance, workout logs, platform interaction data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">2. How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide and manage gym membership services</li>
                <li>Facilitate personal training sessions and scheduling</li>
                <li>Process payments and generate financial reports</li>
                <li>Enable communication between trainers and members</li>
                <li>Track fitness progress and deliver personalized training plans</li>
                <li>Generate operational analytics for gym owners</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">3. Data Storage & Security</h2>
              <p>We implement appropriate technical and organizational security measures:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>All passwords are encrypted using industry-standard bcrypt hashing</li>
                <li>Data is stored in encrypted PostgreSQL databases hosted on secure cloud infrastructure</li>
                <li>All communications are encrypted via HTTPS/TLS</li>
                <li>Access to personal data is restricted by role-based access controls</li>
                <li>Regular database backups are performed to prevent data loss</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">4. Data Sharing</h2>
              <p>We do not sell your personal information. Data may be shared with:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Your Gym:</strong> Gym owners and assigned trainers can access your profile and training data</li>
                <li><strong>Payment Processors:</strong> For processing membership and session payments</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal data held by the platform</li>
                <li>Request correction of inaccurate personal data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Withdraw consent for data processing</li>
                <li>Export your personal data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">6. Data Retention</h2>
              <p>We retain personal data for as long as your account is active or as needed to provide services. Financial records may be retained for up to 7 years as required by applicable tax and accounting regulations. You may request account deletion at any time by contacting your gym administrator.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">7. Contact Us</h2>
              <p>For questions about this Privacy Policy or to exercise your data rights, please contact your gym administrator or reach out to the GymOS platform support team.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 2: Create Terms of Service Page

**File**: `app/(legal)/terms/page.tsx`
**Action**: Create new file
**Replace with**:
```tsx
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | GymOS',
  description: 'GymOS Terms of Service - Rules and guidelines for using our platform.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#007A35] hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-[#007A35] flex items-center justify-center text-white">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-[#171B28]">Terms of Service</h1>
          </div>

          <p className="text-sm text-[#8B8E98] mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8 text-sm text-[#4A4D58] leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using GymOS, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">2. Account Responsibilities</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">3. Acceptable Use</h2>
              <p>You agree not to use the platform to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Violate any local, state, national, or international law</li>
                <li>Infringe upon the rights of others</li>
                <li>Interfere with or disrupt the platform or servers</li>
                <li>Transmit any viruses or malicious code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">4. Payment Terms</h2>
              <p>Membership fees, session packs, and other purchases must be paid according to the terms specified by your gym. All payments are processed securely through our authorized payment partners.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">5. Cancellation & Refund Policy</h2>
              <p>Cancellation and refund policies are determined by your specific gym facility. Please refer to your membership agreement or contact your gym administrator for details regarding refunds.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">6. Intellectual Property</h2>
              <p>The GymOS platform, including all original content, features, and functionality, are owned by GymOS and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">7. Limitation of Liability</h2>
              <p>In no event shall GymOS, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#171B28] mb-3">8. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any material changes before they take effect.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 3: Add Footer Links to Login Page

**File**: `app/(auth)/login/page.tsx`
**Action**: Modify existing file
**Current code**:
```tsx
      {/* Footer info */}
      <div className="mt-8 pt-6 border-t border-[#E1E1E4] text-center">
        <p className="text-xs text-[#8B8E98]">
          GymOS Phase 1 Web Portal • For Gym Owners & Personal Trainers
        </p>
      </div>
```
**Replace with**:
```tsx
      {/* Footer info */}
      <div className="mt-8 pt-6 border-t border-[#E1E1E4] text-center space-y-2">
        <p className="text-xs text-[#8B8E98]">
          GymOS Web Portal • For Gym Owners & Personal Trainers
        </p>
        <div className="flex items-center justify-center gap-3 text-xs">
          <a href="/privacy" className="text-[#007A35] hover:underline">Privacy Policy</a>
          <span className="text-[#E1E1E4]">|</span>
          <a href="/terms" className="text-[#007A35] hover:underline">Terms of Service</a>
        </div>
      </div>
```

---

## Step 4: Production Environment Checklist File

**File**: `DEPLOYMENT.md`
**Action**: Create new file
**Replace with**:
```markdown
# GymOS Production Deployment Guide

## Prerequisites
- Node.js 20+ installed
- PostgreSQL database (Neon recommended)
- Vercel account (or alternative hosting)
- Custom domain (optional but recommended)

## Environment Variables

Set these in your deployment platform:

| Variable | Description | Example |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/gymos` |
| `NEXTAUTH_SECRET` | JWT encryption secret (generate with `openssl rand -base64 32`) | `Kx8m...` |
| `NEXTAUTH_URL` | Full URL of your deployment | `https://app.gymos.com` |

## Deployment Steps

### 1. Database Setup
\`\`\`bash
# Run migrations on production database
npx prisma migrate deploy

# Seed initial data (admin account)
npx prisma db seed
\`\`\`

### 2. Build & Deploy
\`\`\`bash
# Build production bundle
npm run build

# Start production server (if self-hosting)
npm start
\`\`\`

### 3. Post-Deployment Verification
- [ ] Login page loads at the production URL
- [ ] Can log in with admin credentials
- [ ] Dashboard loads correctly
- [ ] Can create a member
- [ ] Can create a trainer
- [ ] CSV export downloads correctly
- [ ] Security headers present (check via securityheaders.com)

### 4. Monitoring Setup
- Set up error tracking (Sentry: https://sentry.io)
- Set up uptime monitoring (UptimeRobot: https://uptimerobot.com)
- Enable Vercel Analytics (if using Vercel)

### 5. Backup Strategy
- Enable automated daily backups on Neon
- Test backup restoration quarterly
```

---

## Step 5: Disable Prisma Query Logging in Production

**File**: `lib/prisma.ts`
**Action**: Modify existing file
**Current code**:
```typescript
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
```
**Replace with**:
```typescript
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : [],
  })
```

---

## Step 6: Clean Up Test Files

Move `test-booking.js` from the project root into the `scripts/` directory to keep the root directory clean for production. The `scripts/check-db.js` file is already in the correct place.

**Command to run**:
```bash
mv test-booking.js scripts/test-booking.js
```
*Note: Make sure these scripts are not imported anywhere in the main application code.*

---

## Verification

After applying all the changes, run the following verification steps:
1. Run `npm run build` to ensure the application builds successfully without errors.
2. Start the app locally and visit `/privacy` — the privacy policy page should render correctly.
3. Visit `/terms` — the terms of service page should render correctly.
4. Visit the login page (`/login`) — it should display the new footer links to the privacy and terms pages.
5. Verify that `DEPLOYMENT.md` exists at the root of the project with the correct content.
6. Check the `scripts` directory to ensure `test-booking.js` has been successfully moved.
