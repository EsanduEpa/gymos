# GymOS Web App — Part 1: Project Foundation

## HEADER
- **Title**: GymOS Web App — Part 1: Project Foundation
- **What this part builds**: Project structure, complete Prisma database schema for ALL Phase 1 entities, authentication system (Auth.js v5), RBAC middleware, and the app shell (sidebar, header, layout).
- **Prerequisites**: Fresh Next.js 16.3.0 project already scaffolded with React 19, TypeScript, Tailwind CSS 4.
- **Reference**: Read `GymOS-ui-design-system.md` in the project root for all visual specifications.
- **Reference**: Read `GymOS-analysis.md` in the project root for full project context.

## TECH STACK
- Next.js 16 (App Router, Server Actions, Route Handlers)
- TypeScript (strict mode)
- Tailwind CSS 4 (already set up)
- Prisma ORM with PostgreSQL (Neon)
- Auth.js v5 (NextAuth) with Credentials provider
- Zod for validation
- shadcn/ui for components
- Lucide React for icons

---

## STEP 1: PROJECT STRUCTURE
Create the following folder structure to establish the architectural foundation:

```text
app/
  (auth)/
    login/page.tsx
  (dashboard)/
    layout.tsx          # Sidebar + Header shell
    owner/
      page.tsx          # Owner dashboard home
      gym-config/
      members/
      trainers/
      sessions/
      financials/
      audit-log/
      subscription/
    trainer/
      page.tsx          # Trainer portal home
      clients/
      plans/
      earnings/
      schedule/
    admin/              # SuperAdmin views
  api/
    auth/[...nextauth]/route.ts
components/
  ui/                   # shadcn/ui components
  layout/
    sidebar.tsx
    header.tsx
    nav-item.tsx
lib/
  auth.ts               # Auth.js config
  prisma.ts             # Prisma client singleton
  utils.ts
  validations/          # Zod schemas
prisma/
  schema.prisma
types/
  index.ts
```

## STEP 2: INSTALL DEPENDENCIES
Run the following exact commands to install necessary dependencies:

```bash
npm install prisma @prisma/client
npm install next-auth@beta @auth/prisma-adapter
npm install zod bcryptjs lucide-react date-fns
npm install -D @types/bcryptjs
npx shadcn@latest init
```
Add the initial necessary shadcn components as well (button, input, form, etc.).

## STEP 3: PRISMA SCHEMA
Update `prisma/schema.prisma` with the complete database schema for ALL 21 Phase 1 entities. Ensure strict typing and relations:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  SUPER_ADMIN
  GYM_OWNER
  PERSONAL_TRAINER
  GYM_MEMBER
}

enum MemberStatus {
  ACTIVE
  INACTIVE
  EXPIRED
  SUSPENDED
}

enum TrainerLevel {
  LEVEL_1
  LEVEL_2
}

enum SessionStatus {
  SCHEDULED
  ACTIVE
  COMPLETED
  MISSED
  CANCELLED
}

enum SessionType {
  IN_PERSON
  VIRTUAL
  INTRODUCTORY
}

enum ShiftStatus {
  IN_SHIFT
  OFF_SHIFT
}

enum PackStatus {
  ACTIVE
  EXHAUSTED
  EXPIRED
}

enum PayPeriodStatus {
  OPEN
  CLOSED
  APPROVED
}

enum HireRequestStatus {
  PENDING
  ACCEPTED
  DECLINED
}

enum RevenueCategory {
  MEMBERSHIP
  PT_SESSION
  ADD_ON
}

enum ExpenseCategory {
  RENT
  UTILITIES
  EQUIPMENT
  MARKETING
  SALARIES
  MAINTENANCE
  OTHER
}

model Gym {
  id                      String   @id @default(cuid())
  name                    String
  address                 String?
  logo                    String?
  phone                   String?
  email                   String?
  operatingHours          Json?    // { mon: {open, close}, tue: ... }
  cancellationWindowHours Int      @default(24)
  noShowDeduction         Boolean  @default(true)
  lateCancelDeduction     Boolean  @default(true)
  minSessionDuration      Int      @default(20) // minutes
  level1BaseRate          Float    @default(0.4)  // 40%
  level2BaseRate          Float    @default(0.5)  // 50%
  offShiftPremium         Float    @default(0.1)  // 10%
  payPeriod               String   @default("MONTHLY") // WEEKLY or MONTHLY
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  users                   User[]
  membershipPlans         MembershipPlan[]
  sessions                PTSession[]
  revenues                RevenueRecord[]
  expenses                ExpenseRecord[]
  auditLogs               AuditLog[]
  budgets                 CategoryBudget[]
  payPeriods              PayPeriod[]
}

model User {
  id               String   @id @default(cuid())
  email            String   @unique
  phone            String?
  password         String   // hashed
  fullName         String
  role             Role
  gymId            String?
  gym              Gym?     @relation(fields: [gymId], references: [id])
  
  // Member-specific
  dateOfBirth      DateTime?
  emergencyContact String?
  healthNotes      String?
  photo            String?
  memberStatus     MemberStatus?
  
  // Trainer-specific
  trainerLevel     TrainerLevel?
  specialisations  String[]  // array of strings
  yearsExperience  Int?
  shiftStart       String?   // "09:00"
  shiftEnd         String?   // "17:00"
  bio              String?
  ratingAvg        Float?    @default(0)
  trainerStatus    String?   @default("ACTIVE")
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  memberships      Membership[]
  sessionPacks     SessionPack[]
  sessionsClient   PTSession[] @relation("ClientSessions")
  sessionsTrainer  PTSession[] @relation("TrainerSessions")
  workoutPlansTrainer WorkoutPlan[] @relation("WorkoutPlanTrainer")
  workoutPlansClient  WorkoutPlan[] @relation("WorkoutPlanClient")
  mealPlansTrainer    MealPlan[] @relation("MealPlanTrainer")
  mealPlansClient     MealPlan[] @relation("MealPlanClient")
  progressPhotos      ProgressPhoto[]
  bodyMetrics         BodyMetric[]
  hireRequestsClient  HireRequest[] @relation("HireClient")
  hireRequestsTrainer HireRequest[] @relation("HireTrainer")
  payRecords          PayRecord[]
  messagesSent        Message[] @relation("MessageSender")
  messagesReceived    Message[] @relation("MessageReceiver")
  notifications       Notification[]
  auditLogs           AuditLog[]
}

model MembershipPlan {
  id          String   @id @default(cuid())
  gymId       String
  gym         Gym      @relation(fields: [gymId], references: [id])
  name        String
  description String?
  price       Float
  durationDays Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  memberships Membership[]
}

model Membership {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id])
  membershipPlanId String
  plan             MembershipPlan @relation(fields: [membershipPlanId], references: [id])
  startDate        DateTime
  endDate          DateTime
  status           MemberStatus @default(ACTIVE)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model SessionPack {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id])
  totalSessions    Int
  remainingSessions Int
  status           PackStatus @default(ACTIVE)
  purchaseDate     DateTime @default(now())
  expiryDate       DateTime
  price            Float?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model PTSession {
  id             String   @id @default(cuid())
  gymId          String
  gym            Gym      @relation(fields: [gymId], references: [id])
  trainerId      String
  trainer        User     @relation("TrainerSessions", fields: [trainerId], references: [id])
  clientId       String
  client         User     @relation("ClientSessions", fields: [clientId], references: [id])
  scheduledAt    DateTime
  duration       Int      // minutes
  type           SessionType @default(IN_PERSON)
  status         SessionStatus @default(SCHEDULED)
  notes          String?
  shiftStatus    ShiftStatus?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  payRecords     PayRecord[]
}

model WorkoutPlan {
  id          String   @id @default(cuid())
  trainerId   String
  trainer     User     @relation("WorkoutPlanTrainer", fields: [trainerId], references: [id])
  clientId    String
  client      User     @relation("WorkoutPlanClient", fields: [clientId], references: [id])
  name        String
  description String?
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  exercises   WorkoutExercise[]
}

model WorkoutExercise {
  id            String   @id @default(cuid())
  workoutPlanId String
  workoutPlan   WorkoutPlan @relation(fields: [workoutPlanId], references: [id], onDelete: Cascade)
  name          String
  sets          Int
  reps          Int?
  weight        Float?
  duration      Int? // minutes
  notes         String?
}

model MealPlan {
  id          String   @id @default(cuid())
  trainerId   String
  trainer     User     @relation("MealPlanTrainer", fields: [trainerId], references: [id])
  clientId    String
  client      User     @relation("MealPlanClient", fields: [clientId], references: [id])
  name        String
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  entries     MealPlanEntry[]
}

model MealPlanEntry {
  id          String   @id @default(cuid())
  mealPlanId  String
  mealPlan    MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  dayOfWeek   Int      // 0-6
  mealType    String   // Breakfast, Lunch, Dinner, Snack
  foodItem    String
  calories    Int?
  protein     Float?
  carbs       Float?
  fats        Float?
}

model ProgressPhoto {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  url       String
  dateTaken DateTime @default(now())
  notes     String?
}

model BodyMetric {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  dateRecorded DateTime @default(now())
  weight       Float?
  bodyFat      Float?
  muscleMass   Float?
  notes        String?
}

model HireRequest {
  id          String   @id @default(cuid())
  clientId    String
  client      User     @relation("HireClient", fields: [clientId], references: [id])
  trainerId   String
  trainer     User     @relation("HireTrainer", fields: [trainerId], references: [id])
  status      HireRequestStatus @default(PENDING)
  message     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PayPeriod {
  id        String   @id @default(cuid())
  gymId     String
  gym       Gym      @relation(fields: [gymId], references: [id])
  startDate DateTime
  endDate   DateTime
  status    PayPeriodStatus @default(OPEN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  payRecords PayRecord[]
}

model PayRecord {
  id          String   @id @default(cuid())
  trainerId   String
  trainer     User     @relation(fields: [trainerId], references: [id])
  payPeriodId String
  payPeriod   PayPeriod @relation(fields: [payPeriodId], references: [id])
  sessionId   String?
  session     PTSession? @relation(fields: [sessionId], references: [id])
  amount      Float
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model RevenueRecord {
  id          String   @id @default(cuid())
  gymId       String
  gym         Gym      @relation(fields: [gymId], references: [id])
  amount      Float
  category    RevenueCategory
  date        DateTime @default(now())
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ExpenseRecord {
  id          String   @id @default(cuid())
  gymId       String
  gym         Gym      @relation(fields: [gymId], references: [id])
  amount      Float
  category    ExpenseCategory
  date        DateTime @default(now())
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CategoryBudget {
  id        String   @id @default(cuid())
  gymId     String
  gym       Gym      @relation(fields: [gymId], references: [id])
  category  ExpenseCategory
  amount    Float
  month     DateTime // represents the month/year
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Message {
  id          String   @id @default(cuid())
  senderId    String
  sender      User     @relation("MessageSender", fields: [senderId], references: [id])
  receiverId  String
  receiver    User     @relation("MessageReceiver", fields: [receiverId], references: [id])
  content     String
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  gymId     String?
  gym       Gym?     @relation(fields: [gymId], references: [id])
  actorId   String
  actor     User     @relation(fields: [actorId], references: [id])
  action    String
  resource  String
  details   String?
  createdAt DateTime @default(now())
}
```

## STEP 4: AUTH.JS v5 CONFIGURATION
Set up `Auth.js v5` for credential-based authentication using Prisma Adapter.

1. Implement `lib/auth.ts` with the NextAuth config.
2. Use the Credentials provider: check email/password utilizing `bcryptjs.compare`.
3. Set the Session strategy to `jwt`.
4. Create a custom JWT callback to embed `userId`, `role`, `gymId`, and `fullName`.
5. Create a custom session callback to append these fields to the session object.
6. Configure pages to point to `/login`.
7. Implement middleware (`middleware.ts`) for protected routes logic.
8. Create RBAC (Role-Based Access Control) utility functions:
    - `requireRole(role: Role)`
    - `requireGymAccess(gymId: string)`
    - `isSuperAdmin(session)`

## STEP 5: PRISMA CLIENT SINGLETON
Create `lib/prisma.ts` utilizing the standard Next.js global singleton pattern to prevent multiple instances during dev hot-reloads.

## STEP 6: LOGIN PAGE (SCR-01)
Create the login page at `app/(auth)/login/page.tsx`.
- **Form**: Email + Password.
- **Validation**: Implement Zod validation (`z.string().email()`, `z.string().min(6)`).
- **Functionality**: On successful sign-in, redirect the user based on their `role`:
    - `SUPER_ADMIN` -> `/admin`
    - `GYM_OWNER` -> `/owner`
    - `PERSONAL_TRAINER` -> `/trainer`
    - `GYM_MEMBER` -> Display a message (e.g., "Members please use the mobile app").
- **Design**: Centered card, light background, GymOS logo prominently displayed, Inter font, green primary button (`#007A35`).

## STEP 7: DASHBOARD LAYOUT SHELL
Create the core layout files under `app/(dashboard)`. Apply visual specs from the design system.

### Sidebar (`components/layout/sidebar.tsx`)
- **Width**: 150-165px.
- **Background**: `#171B28`.
- **Logo**: "GymOS" (18-20px, 700 weight, white) + subtitle "Management System" (8-10px, `#8B8E98`).
- **Items Style**: 
    - Default state: transparent background, `#777B87` text.
    - Active state: `#007A35` background, white text, 5-7px border-radius.
- **Owner Navigation Items**:
    - Dashboard (LayoutDashboard icon)
    - Members (Users icon)
    - Trainers (Dumbbell icon)
    - Sessions (Calendar icon)
    - Financials (DollarSign icon)
    - Gym Config (Settings icon)
    - Audit Log (Shield icon)
    - Subscription (CreditCard icon)
- **Trainer Navigation Items**:
    - Schedule (Calendar icon)
    - Clients (Users icon)
    - Plans (ClipboardList icon)
    - Earnings (Wallet icon)

### Header (`components/layout/header.tsx`)
- **Height**: 48-52px.
- **Background**: White, with `1px solid #E1E1E4` border-bottom.
- **Components**:
    - Search field (rounded, `#F5F4F5` background).
    - Notification bell.
    - User avatar + name dropdown.

## STEP 8: SEED SCRIPT
Create `prisma/seed.ts` to populate the database with test data.
- 1 SuperAdmin user.
- 1 Gym with default config values.
- 1 Gym Owner user linked to the Gym.
- 2 Trainer users (1 Level 1, 1 Level 2).
- 5 Member users.
- 2 Membership plans (e.g., Basic, Premium).
- **Requirement**: Use `await bcrypt.hash('password123', 10)` for all passwords.

## STEP 9: ENVIRONMENT VARIABLES
Create a `.env` file with these required variables:
```env
DATABASE_URL="your-neon-postgres-url"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## STEP 10: TESTING CHECKLIST
Execute this checklist once complete:
- [ ] `npx prisma db push` succeeds.
- [ ] `npx prisma db seed` successfully populates test data.
- [ ] Login works for all 4 roles.
- [ ] Role-based redirect routes perfectly.
- [ ] Sidebar dynamically renders correct items per role.
- [ ] Header search and user menu render correctly.
- [ ] Protected routes successfully redirect unauthenticated users to `/login`.
- [ ] RBAC appropriately blocks unauthorized access (e.g., a trainer cannot access `/owner` paths).
