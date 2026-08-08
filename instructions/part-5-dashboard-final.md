# GymOS Web App — Part 5: Dashboard, Messaging & Final Polish

## TECH STACK CONTEXT
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Authentication:** Auth.js v5
- **Validation:** Zod
- **UI Library:** shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts

## PREREQUISITE CONTEXT
**The AI reading this document must assume Parts 1-4 are completely built.** 
Here is what exists so far:
- Complete auth, database schema, and layout navigation.
- Gym configuration (plans, rates, policies).
- Member and Trainer management (CRUD operations).
- PT session lifecycle (booking, status management, pack deduction, billing).
- Trainer hire flow, plan builder, and client management.
- Financial dashboard (revenue, expenses, P&L, payroll, CSV exports).

**Reference:** You MUST read and follow the styling specifications in `GymOS-ui-design-system.md` and the functional requirements in `GymOS-analysis.md`.

---

# SECTION 1: DATABASE SCHEMA UPDATES

Update `prisma/schema.prisma` to include the models required for this final phase.

```prisma
enum AuditActionType {
  MEMBER_CREATED
  MEMBER_UPDATED
  MEMBER_SUSPENDED
  MEMBER_DEACTIVATED
  TRAINER_CREATED
  TRAINER_UPDATED
  TRAINER_DEACTIVATED
  SESSION_CREATED
  SESSION_OVERRIDDEN
  SESSION_CANCELLED
  PLAN_ASSIGNED
  PLAN_UPDATED
  EXPENSE_CREATED
  BUDGET_SET
  PAY_PERIOD_CLOSED
  PAY_PERIOD_APPROVED
  GYM_CONFIG_UPDATED
  PAY_RATES_UPDATED
  POLICY_UPDATED
  HIRE_REQUEST_ACCEPTED
  HIRE_REQUEST_DECLINED
  ACCESS_OVERRIDE
}

model AuditLog {
  id               String          @id @default(uuid())
  gymId            String
  userId           String          // User who performed the action
  actionType       AuditActionType
  affectedRecordId String          // ID of the member, session, etc.
  details          String?         // JSON stringified additional info
  createdAt        DateTime        @default(now())

  gym              Gym             @relation(fields: [gymId], references: [id], onDelete: Cascade)
  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum SubscriptionTier {
  STARTER
  GROWTH
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  TRIAL
  GRACE_PERIOD
  SUSPENDED
}

model GymSubscription {
  id                   String             @id @default(uuid())
  gymId                String             @unique
  tier                 SubscriptionTier   @default(STARTER)
  status               SubscriptionStatus @default(TRIAL)
  billingCycle         String             @default("MONTHLY") // "MONTHLY" or "ANNUAL"
  nextBillingDate      DateTime
  paymentMethodLast4   String?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  gym                  Gym                @relation(fields: [gymId], references: [id], onDelete: Cascade)
}

model Message {
  id          String    @id @default(uuid())
  senderId    String
  receiverId  String
  content     String
  isRead      Boolean   @default(false)
  readAt      DateTime?
  createdAt   DateTime  @default(now())

  sender      User      @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver    User      @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  HIRE_REQUEST
  SESSION_BOOKED
  SESSION_CANCELLED
  PACK_LOW
  MEMBERSHIP_EXPIRING
  BUDGET_EXCEEDED
  PAYROLL_READY
  MESSAGE_RECEIVED
}

model Notification {
  id          String           @id @default(uuid())
  recipientId String
  type        NotificationType
  title       String
  message     String
  linkUrl     String?
  isRead      Boolean          @default(false)
  createdAt   DateTime         @default(now())

  recipient   User             @relation(fields: [recipientId], references: [id], onDelete: Cascade)
}
```

Run `npx prisma db push` and `npx prisma generate` after applying these updates.

---

# SECTION 2: UTILITY FUNCTIONS

Create global server utility functions that will be imported throughout the app.

## 2.1 Audit Logger
Create `lib/audit.ts`:
```typescript
import { db } from "@/lib/db";
import { AuditActionType } from "@prisma/client";

interface AuditLogParams {
  userId: string;
  gymId: string;
  actionType: AuditActionType;
  affectedRecordId: string;
  details?: Record<string, any>;
}

export async function logAudit(params: AuditLogParams) {
  return await db.auditLog.create({
    data: {
      userId: params.userId,
      gymId: params.gymId,
      actionType: params.actionType,
      affectedRecordId: params.affectedRecordId,
      details: params.details ? JSON.stringify(params.details) : null,
    },
  });
}
```
**Instruction:** Retrofit previous Server Actions (from Parts 2-4) to call `logAudit` upon successful database mutations.

## 2.2 Notification Creator
Create `lib/notifications.ts`:
```typescript
import { db } from "@/lib/db";
import { NotificationType } from "@prisma/client";

interface NotificationParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
}

export async function createNotification(params: NotificationParams) {
  return await db.notification.create({
    data: params,
  });
}
```
**Instruction:** Retrofit previous Server Actions (like booking a session or creating a hire request) to trigger `createNotification` for the relevant user.

---

# SECTION 3: OWNER LIVE OPERATIONS DASHBOARD (SCR-21)

Implement the Owner's home page at `app/(dashboard)/owner/page.tsx`.

## 3.1 Live Stats Row
Create four `StatCard` components aligned horizontally at the top.
Fetch these stats using Prisma in the Server Component:
1. **Members in Gym:** Count of members with a session status of `ACTIVE` today.
2. **Active Sessions:** Count of `PTSession` where `status` == `ACTIVE`. (Add a pulsing green `<Badge>` or dot next to the value).
3. **Today's Revenue:** Sum of `amount` from `RevenueRecord` where `date` is today. Format as currency.
4. **Trainers On Floor:** Distinct count of trainers who have a session scheduled today.

## 3.2 Today's Sessions Panel
Create a Table showing all sessions for today across the gym.
- Columns: Time, Member (Avatar + Name), Trainer, Status (Active badge), Fee.
- Active sessions should have a green left border on the table row.
- Refresh: Implement a basic 30-second client-side router refresh using `useRouter` and `useEffect`.

## 3.3 Revenue Today Area Chart
Use Recharts.
- Fetch hourly accumulated revenue for today.
- Render an AreaChart showing the running total of revenue.
- X-axis: Hour of day. Y-axis: Dollar amount.

## 3.4 Alerts Panel
Create a small card listing critical alerts:
- **Pack Expiry:** Members with ≤2 sessions remaining in their active pack.
- **No-Show:** List any sessions from today marked `NO_SHOW`.
- Implement these queries and map over them, displaying a red/yellow warning icon and brief text.

## 3.5 Trainer Performance Cards
Fetch all trainers for the gym. For each, display a compact Card component showing:
- Avatar, Name, Level badge.
- Sessions today / total this week.
- Revenue generated this week.
- Current status badge (On floor, Off duty, In session).

---

# SECTION 4: OPERATIONAL ANALYTICS (FR-073)

Create `app/(dashboard)/owner/analytics/page.tsx`. Include 3 distinct chart panels.

## 4.1 Trainer Utilisation Report
- Use a Recharts `BarChart`.
- X-axis: Trainer Names.
- Y-axis: Number of scheduled sessions vs. total available shift hours (assume 8 hours default if no shift data).
- Show two bars per trainer: Scheduled vs Idle.

## 4.2 Member Attendance Report
- Use a Recharts `BarChart` for Peak Hours.
- X-axis: Hour of the day (e.g., 6 AM, 7 AM... 8 PM).
- Y-axis: Average sessions per hour over the last 30 days.

## 4.3 New Member Growth
- Use a Recharts `LineChart`.
- X-axis: Month (Last 6 months).
- Y-axis: Number of new members signed up.

---

# SECTION 5: AUDIT LOG (SCR-28)

Create `app/(dashboard)/owner/audit-log/page.tsx`.

## 5.1 Audit Log Table
- Fetch `AuditLog` records for the owner's `gymId`. Include relations (User).
- Columns: Timestamp (formatted), User (Name/Email), Action Type, Details.
- Implement pagination (20 per page).
- Add filters at the top:
  - Date Range Picker (shadcn Calendar + Popover).
  - Select dropdown for `ActionType`.
- Include an "Export CSV" button that triggers a server action to download the filtered logs.

---

# SECTION 6: SUBSCRIPTION MANAGEMENT (SCR-29)

Create `app/(dashboard)/owner/subscription/page.tsx`.

## 6.1 Current Plan Card
- Fetch the `GymSubscription` for the current gym.
- Display current tier (`STARTER`, `GROWTH`, `PRO`, `ENTERPRISE`), billing cycle, next billing date, and status.

## 6.2 Tier Comparison Matrix
- Build a static visual table comparing the 4 tiers (features, limits, pricing).
- Add "Upgrade" / "Downgrade" buttons (these can just show a "Contact Support" toast for now).

## 6.3 Subscription Lapse Logic
Update the global `app/(dashboard)/layout.tsx`:
- Fetch the `GymSubscription`.
- If `status === 'SUSPENDED'` or `status === 'GRACE_PERIOD'`, render an absolute top banner (red or yellow) warning the owner: "Your subscription payment failed. Please update your billing details."

---

# SECTION 7: IN-APP MESSAGING (SCR-12)

Create `app/(dashboard)/trainer/messages/page.tsx`. This facilitates trainer-to-client messaging (web interface for trainer).

## 7.1 Layout
Split screen layout (Left: Thread List, Right: Active Conversation).

## 7.2 Thread List (Left Panel)
- Fetch distinct clients who have an assigned plan or hired the current trainer.
- Display as a scrollable list.
- Show Avatar, Name, last message snippet, and unread indicator (bold font).
- Add a Search input to filter clients by name.

## 7.3 Message Thread View (Right Panel)
- When a client is clicked, fetch all `Message` records where `senderId` and `receiverId` match the trainer and selected client.
- Display chat bubbles. Trainer (currentUser) messages on the right with a primary color background. Client messages on the left with a gray background.
- At the bottom, include a text `Input` and a Send `Button`.
- Create a Server Action `sendMessage(receiverId: string, content: string)` that creates a `Message` record and triggers `revalidatePath`.
- Implement polling (use `useEffect` and `useRouter().refresh()`) every 15 seconds to fetch new messages.

---

# SECTION 8: NOTIFICATION SYSTEM

## 8.1 Notification Bell Header Component
Create `components/layout/NotificationBell.tsx` and place it in the global Header.
- Fetch unread `Notification` records for the current user.
- Render a Lucide `Bell` icon with a red notification badge (showing count) if unread > 0.

## 8.2 Notification Dropdown Panel
- Use shadcn `DropdownMenu` or `Popover`.
- Render a list of the 5 most recent notifications.
- Include the `title`, `message`, and timestamp (e.g., "2 hours ago").
- Clicking a notification marks it as read (via Server Action) and redirects to `linkUrl`.
- Include a "Mark all as read" button at the top of the popover.

---

# SECTION 9: SUPERADMIN VIEWS

Create `app/(dashboard)/admin/page.tsx` for platform administrators.

## 9.1 SuperAdmin Dashboard
- Ensure route is protected (check session role === 'SUPERADMIN').
- Fetch all `Gym` records including their `GymSubscription`, member count, and trainer count.
- Render a Data Table: Gym Name, Owner, Tier, Members, Trainers, Status.

## 9.2 Gym Switcher (Impersonation)
- In the SuperAdmin global header, implement a `Select` dropdown listing all gyms.
- When a gym is selected, store it in cookies (`superAdminGymId`).
- Update your global data fetching utilities: if `session.role === 'SUPERADMIN'`, override the context `gymId` with the cookie value. This allows the SuperAdmin to view any owner dashboard as if they were the owner.

---

# SECTION 10: FINAL POLISH & INTEGRATION

## 10.1 Loading & Empty States
- Create `loading.tsx` in every major route folder using skeleton components (`Skeleton` from shadcn).
- Implement empty states for tables and lists: Use a centered layout with a large Lucide icon, a muted text description (e.g., "No active sessions today"), and a primary CTA button if applicable.

## 10.2 Error Handling
- Create `error.tsx` in the root dashboard folder to catch runtime errors gracefully. Include a "Try Again" button.
- Implement `not-found.tsx` for 404 pages.

## 10.3 Responsive Design
- Ensure Sidebar collapses into an icon-only mode on tablet, and hides behind a hamburger menu on mobile.
- Ensure all charts and tables are horizontally scrollable or stack vertically on screens `< 768px`.

---

# SECTION 11: COMPREHENSIVE TESTING CHECKLIST

At the end of your implementation, mentally simulate and verify the following:

## End-to-End Flow Tests
- [ ] Owner logs in → sees live dashboard with correct stats.
- [ ] Session starts → completes → pack deducted → revenue recorded → audit log updated.
- [ ] Trainer sends message → appears in thread immediately.
- [ ] All admin actions (creating users, changing settings) appear in the audit log.
- [ ] SuperAdmin can switch between gyms and see that gym's specific dashboard.

## Security Tests
- [ ] Trainer cannot access `/owner` or `/admin` routes (redirected).
- [ ] Owner cannot see other gyms' data.
- [ ] Unauthenticated users are redirected to `/auth/login`.

## UI/UX Tests
- [ ] All pages strictly follow the `GymOS-ui-design-system.md` specifications (colors, typography, component radii).
- [ ] Charts render properly with the specified green color palette.
- [ ] Form validation errors display in red below the corresponding inputs.
- [ ] Toast notifications (`sonner` or `use-toast`) appear on all successful/failed actions.
- [ ] Empty states and skeletons render beautifully.

**Begin Implementation.** Write the code exactly as requested, ensuring all files are perfectly integrated.
