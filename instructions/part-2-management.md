# GymOS Web App — Part 2: Gym Configuration & User Management

## CONTEXT & PREREQUISITES

**What this part builds:** Gym settings page, membership plan management, member CRUD with profiles, trainer CRUD with level/shift management.
**Prerequisites:** Part 1 is already completed. The authentication system (Auth.js v5), Prisma schema, dashboard layout shell (sidebar + header), and initial seed data are already in place. 
**References:** 
- Read `GymOS-ui-design-system.md` for exact visual specifications, colors, and typography.
- Read `GymOS-analysis.md` for full project context and business rules.

## TECH STACK
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Authentication:** Auth.js v5
- **Validation:** Zod
- **UI Components:** shadcn/ui
- **Icons:** Lucide React

## WHAT EXISTS FROM PART 1
- Auth system with login page and RBAC middleware (`middleware.ts`).
- Complete Prisma schema with all models (`User`, `MembershipPlan`, `GymSettings`, `AuditLog`, etc.).
- Dashboard layout with a sidebar and header (`/app/(dashboard)/layout.tsx`).
- Seed data with test users.

---

## PRISMA SCHEMA REFERENCE
Use the following exact schema definitions when building the features in this document:

```prisma
enum Role {
  GYM_OWNER
  PERSONAL_TRAINER
  GYM_MEMBER
}

enum Status {
  ACTIVE
  INACTIVE
  EXPIRED
  SUSPENDED
}

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  passwordHash     String?
  name             String
  phone            String?
  role             Role      @default(GYM_MEMBER)
  status           Status    @default(ACTIVE)
  dateOfBirth      DateTime?
  emergencyContact String?
  healthNotes      String?
  photoUrl         String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Trainer specific
  trainerLevel     Int?      // 1 or 2
  specialisations  String[]
  yearsExperience  Int?
  shiftStart       String?   // HH:mm
  shiftEnd         String?   // HH:mm
  bio              String?

  membership       Membership?
  auditLogs        AuditLog[]
}

model MembershipPlan {
  id                  String   @id @default(cuid())
  name                String
  durationDays        Int
  price               Decimal  @db.Decimal(10, 2)
  includedPtSessions  Int      @default(0)
  isActive            Boolean  @default(true)
  memberships         Membership[]
}

model Membership {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id])
  planId           String
  plan             MembershipPlan @relation(fields: [planId], references: [id])
  startDate        DateTime @default(now())
  expiryDate       DateTime
  ptSessionBalance Int      @default(0)
  status           Status   @default(ACTIVE)
}

model GymSettings {
  id                        String  @id @default(cuid())
  name                      String
  address                   String?
  logoUrl                   String?
  contactPhone              String?
  contactEmail              String?
  operatingHours            Json?   // { monday: { start, end }, ... }
  
  // Trainer Pay Rates
  level1BaseRatePercent     Decimal @default(40.00) @db.Decimal(5, 2)
  level2BaseRatePercent     Decimal @default(50.00) @db.Decimal(5, 2)
  offShiftPremiumPercent    Decimal @default(10.00) @db.Decimal(5, 2)
  
  // Policies
  cancelWindowHours         Int     @default(24)
  enableNoShowDeduction     Boolean @default(true)
  enableLateCancelDeduction Boolean @default(true)
  minSessionDurationMinutes Int     @default(20)
  payPeriod                 String  @default("Monthly") // "Weekly" | "Monthly"
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  details   String
  createdAt DateTime @default(now())
}
```

---

## SECTION 1: GYM CONFIGURATION (SCR-22)

Create the gym configuration pages under `/app/(dashboard)/owner/gym-config/`. Use a tabbed interface (from shadcn/ui `Tabs`) to separate the configuration domains.

### 1.1 Gym Profile Tab
Implement FR-049 to configure the gym profile.
- **Path:** `/app/(dashboard)/owner/gym-config/page.tsx` (Default tab)
- **Fields:** Gym Name (text), Address (text), Logo URL (text/upload placeholder), Contact Phone (text), Contact Email (email), Operating Hours (JSON builder for each day of the week).
- **Validation:** Use Zod for all fields. Name and Email are required.
- **Action:** Create a server action to upsert `GymSettings` (ID `default`).
- **Feedback:** Show a success toast "Settings saved".

### 1.2 Membership Plans Tab
Implement FR-050 to create & manage membership plans.
- **UI:** A data table showing all plans. Columns: Name, Duration (days), Price, Included PT Sessions, Status (Active/Inactive toggle), Actions (Edit).
- **Add Plan:** "Add New Plan" button opens a shadcn `Dialog` or `Sheet` with a form.
- **Fields:** Plan name (text, required), Duration (number, required), Price (number, required), Included PT sessions (number, default 0), Active (switch).
- **Business Logic:** Deactivated plans must be hidden from the "Add Member" dropdown but existing memberships must remain unaffected.
- **Actions:** Server actions for `createPlan`, `updatePlan`, `togglePlanStatus`.

### 1.3 Trainer Pay Rates Tab
Implement FR-051 to configure trainer pay rates.
- **Fields:** Level 1 base rate (number input, percentage), Level 2 base rate (number input, percentage), Off-shift premium (number input, percentage).
- **UI Element:** Include an alert/callout: "Changes apply to future sessions only. In-progress sessions retain their original rate." (Business Rule BR-083/USR001).
- **Action:** Server action to update `GymSettings`.

### 1.4 Cancellation Policy Tab
Implement FR-052 to configure cancellation policy.
- **Fields:** 
  - Cancellation window (number input, hours before session)
  - Enable no-show deduction (switch/checkbox)
  - Enable late cancellation deduction (switch/checkbox)
  - Minimum session duration (number input, default 20 minutes) (Business Rule BR-012/PT005).
- **Action:** Server action to update `GymSettings`.

### 1.5 Pay Period Configuration
- **Field:** Select dropdown for "Weekly" or "Monthly". Include in the main settings update action.

---

## SECTION 2: MEMBER MANAGEMENT (SCR-23)

Create the member management screens under `/app/(dashboard)/owner/members/`.

### 2.1 Member List Page
Implement FR-057.
- **Path:** `/app/(dashboard)/owner/members/page.tsx`
- **UI:** Data table with columns: Name, Email, Phone, Membership Plan, Status, Expiry Date, Actions (View Profile).
- **Status Badges:** Use exactly these styles:
  - Active: green bg `#DDF5E7`, text `#007A35`
  - Expired: red bg `#FDE4E4`, text `#D71920`
  - Suspended: orange bg `#FFF0E0`, text `#F97316`
- **Interactivity:** Add a Search input (by name/email), Status filter dropdown, and simple pagination.
- **Primary Action:** Add a primary green button "Add New Member".

### 2.2 Add Member Form (SCR-02)
Implement FR-001/FR-056.
- **Path:** `/app/(dashboard)/owner/members/new/page.tsx` (or inside a Sheet on the list page).
- **Fields:** 
  - Full Name (required)
  - Email (required, must be unique)
  - Phone (required)
  - Date of Birth (required, date picker)
  - Emergency Contact (text)
  - Health Notes (textarea)
  - Membership Plan (select from `isActive: true` plans)
- **Submit Logic (Server Action `createMember`):**
  1. Create a `User` with role `GYM_MEMBER`.
  2. Create a `Membership` record linked to the user, setting `expiryDate` based on the plan's `durationDays`, and `ptSessionBalance` to `includedPtSessions`.
  3. Auto-generate a dummy password and log it to the console (Phase 1 placeholder for email delivery).
  4. Create an `AuditLog` entry: "Created new member: [Email]".
- **Validation:** Comprehensive Zod schema. Show inline errors.
- **Feedback:** Redirect to `/owner/members` with a success toast.

### 2.3 Individual Member Profile Page
- **Path:** `/app/(dashboard)/owner/members/[id]/page.tsx`
- **Header:** Display Photo placeholder, name, contact info, status badge, and current membership details.
- **Tabs:**
  - **Overview:** Membership info, PT pack balance, assigned trainer (if any), join/expiry dates.
  - **Attendance:** Table placeholder for session history (date, trainer, status, duration).
  - **Payments:** Table placeholder for billing history.
  - **Progress:** Placeholder for body metrics chart.
- **Action Buttons (Top Right):**
  - **Suspend Member (FR-058):** Opens a confirmation dialog. Updates status to `SUSPENDED`.
  - **Deactivate Member:** Opens a confirmation dialog. Updates status to `INACTIVE`.
  - **Override Access:** Manual status toggle dropdown.
- **Audit Logging:** All status changes MUST create an `AuditLog` entry (BR-086/USR004).

### 2.4 Membership Expiry Logic
Implement FR-012.
- **Background Context:** Expiry will be checked by a daily cron job. 
- **Implementation:** Create a Server Action `checkMembershipExpiries()` in `/app/actions/members.ts`.
  - Logic: Find all `Membership` records where `expiryDate < now()` and `status === ACTIVE`. Update their status (and their parent User status) to `EXPIRED`. Create AuditLogs for each.
  - Expose a manual trigger button in the UI for testing purposes (e.g., hidden in the Gym Config page or Member List header).

---

## SECTION 3: TRAINER MANAGEMENT (SCR-24)

Create the trainer management screens under `/app/(dashboard)/owner/trainers/`.

### 3.1 Trainer List Page
- **Path:** `/app/(dashboard)/owner/trainers/page.tsx`
- **UI:** Data table with columns: Name, Level, Specialisations (tags), Shift Hours, Status, Actions.
- **Level Badges:** L1 (gray bg), L2 (blue bg).
- **Primary Action:** "Add New Trainer" button.

### 3.2 Add Trainer Form
Implement FR-055.
- **Path:** `/app/(dashboard)/owner/trainers/new/page.tsx` (or Sheet).
- **Fields:** Full Name (required), Email (required, unique), Phone (required), Level (Select: 1 or 2), Specialisations (Multi-select or comma-separated tags), Years of Experience (number), Shift Start (time picker/string HH:mm), Shift End (time picker/string HH:mm), Bio (textarea).
- **Submit Logic (Server Action `createTrainer`):**
  1. Create `User` with role `PERSONAL_TRAINER`.
  2. Auto-generate password.
  3. Create `AuditLog` entry.
- **Validation:** Zod schema required.

### 3.3 Trainer Detail/Edit Page
- **Path:** `/app/(dashboard)/owner/trainers/[id]/page.tsx`
- **Profile Section:** Display and edit the form fields above.
- **Performance Section (FR-061):** 
  - Render a grid of `StatCard` components (Placeholder values for now): Sessions completed, No-show rate, Client count, Total revenue generated.
- **Shift Approval Section (FR-060):**
  - Display their shift hours. Include Approve/Reject buttons (logs to audit, visual state change only for now).
- **Deactivate Trainer Action (BR-084/USR002):**
  - Red button with confirmation dialog. Updates status to `INACTIVE`.
  - Must log to `AuditLog`.

---

## SECTION 4: SHARED COMPONENTS TO BUILD

Create the following reusable components in `/components/ui/` or `/components/shared/`:
1. **DataTable:** Reusable component wrapping shadcn Table, supporting generic columns, sorting, and pagination.
2. **StatusBadge:** Accepts status string and renders appropriate design system colors.
3. **ConfirmDialog:** Reusable wrapper around shadcn `AlertDialog` for destructive actions (Delete, Suspend, Deactivate).
4. **FormField Wrappers:** Consistent layout for label, input, and inline error message.
5. **PageHeader:** Renders a standard Title (h1), Description (p), and optional right-aligned action button.
6. **StatCard:** Renders a label, large value, and optional trend indicator (e.g., "+5% from last month").

---

## SECTION 5: SERVER ACTIONS PATTERN

Implement ALL database mutations using the following exact Server Action pattern. Place these in `/app/actions/`.

```typescript
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  // ... other fields
})

export async function createMember(formData: FormData) {
  // 1. Authenticate and Authorize
  const session = await auth()
  if (!session || session.user.role !== 'GYM_OWNER') {
    throw new Error('Unauthorized')
  }
  
  // 2. Parse and Validate
  const rawData = Object.fromEntries(formData.entries())
  const validated = createMemberSchema.safeParse(rawData)
  
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }
  
  try {
    // 3. Execute DB Transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          // ... map fields
          role: 'GYM_MEMBER',
        }
      })
      
      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'MEMBER_CREATED',
          details: `Created member ${user.email}`
        }
      })
    })

    // 5. Revalidate and Return
    revalidatePath('/owner/members')
    return { success: true }
    
  } catch (error) {
    console.error("Failed to create member:", error)
    return { error: { _form: ["An unexpected error occurred."] } }
  }
}
```

---

## SECTION 6: TESTING CHECKLIST

Ensure the following pass before considering this part complete:
- [ ] Gym Config: Updates save correctly to the single `GymSettings` record and persist across reloads.
- [ ] Membership Plans: CRUD operations work; inactive plans do not show in the new member form.
- [ ] Member List: Loads correctly with color-coded status badges, search, and filtering.
- [ ] Member Creation: Zod validation catches missing/invalid fields. Success creates both a User and a Membership.
- [ ] Member Profile: All tabs render. Suspend/Deactivate correctly updates status and writes an AuditLog.
- [ ] Expiry Logic: Triggering the expiry check accurately flips expired memberships to `EXPIRED`.
- [ ] Trainer List & Creation: Trainer forms work, level assignment persists, list renders badges correctly.
- [ ] Trainer Detail: Renders performance stat cards and shift approval UI.
- [ ] Security (RBAC): Ensure a `PERSONAL_TRAINER` cannot access or execute server actions for `/owner/*` routes.
- [ ] Audit Logging: Check the database to ensure every creation, suspension, and deactivation creates an `AuditLog` row.
