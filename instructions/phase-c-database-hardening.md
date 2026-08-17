# Phase C: Database Hardening & Schema Improvements

This phase adds missing database indexes and cascade delete rules to the Prisma schema to improve query performance and enforce data integrity when parent records are deleted.

**Prerequisites**: Ensure the project is set up and `prisma/schema.prisma` is present.

### Step 1: Update the schema.prisma file

**File**: `prisma/schema.prisma`
**Action**: Modify existing file

Make the following exact modifications to each model block within `prisma/schema.prisma`.

#### 1. User Model
**Current code**:
```prisma
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

  memberships         Membership[]
  sessionPacks        SessionPack[]
  sessionsClient      PTSession[] @relation("ClientSessions")
  sessionsTrainer     PTSession[] @relation("TrainerSessions")
  workoutPlansTrainer WorkoutPlan[] @relation("WorkoutPlanTrainer")
  workoutPlansClient  WorkoutPlan[] @relation("WorkoutPlanClient")
  mealPlansTrainer    MealPlan[] @relation("MealPlanTrainer")
  mealPlansClient     MealPlan[] @relation("MealPlanClient")
  progressPhotos      ProgressPhoto[]
  bodyMetrics         BodyMetric[]
  hireRequestsClient  HireRequest[] @relation("HireClient")
  hireRequestsTrainer HireRequest[] @relation("HireTrainer")
  payRecords          PayRecord[]
  messagesSent        Message[] @relation("SentMessages")
  messagesReceived    Message[] @relation("ReceivedMessages")
  notifications       Notification[]
  auditLogs           AuditLog[]
}
```
**Replace with**:
```prisma
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

  memberships         Membership[]
  sessionPacks        SessionPack[]
  sessionsClient      PTSession[] @relation("ClientSessions")
  sessionsTrainer     PTSession[] @relation("TrainerSessions")
  workoutPlansTrainer WorkoutPlan[] @relation("WorkoutPlanTrainer")
  workoutPlansClient  WorkoutPlan[] @relation("WorkoutPlanClient")
  mealPlansTrainer    MealPlan[] @relation("MealPlanTrainer")
  mealPlansClient     MealPlan[] @relation("MealPlanClient")
  progressPhotos      ProgressPhoto[]
  bodyMetrics         BodyMetric[]
  hireRequestsClient  HireRequest[] @relation("HireClient")
  hireRequestsTrainer HireRequest[] @relation("HireTrainer")
  payRecords          PayRecord[]
  messagesSent        Message[] @relation("SentMessages")
  messagesReceived    Message[] @relation("ReceivedMessages")
  notifications       Notification[]
  auditLogs           AuditLog[]

  @@index([gymId])
  @@index([email])
  @@index([role])
}
```

#### 2. MembershipPlan Model
**Current code**:
```prisma
model MembershipPlan {
  id           String   @id @default(cuid())
  gymId        String
  gym          Gym      @relation(fields: [gymId], references: [id])
  name         String
  description  String?
  price        Float
  durationDays Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  memberships  Membership[]
}
```
**Replace with**:
```prisma
model MembershipPlan {
  id           String   @id @default(cuid())
  gymId        String
  gym          Gym      @relation(fields: [gymId], references: [id])
  name         String
  description  String?
  price        Float
  durationDays Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  memberships  Membership[]

  @@index([gymId])
}
```

#### 3. Membership Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
model Membership {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  membershipPlanId String
  plan             MembershipPlan @relation(fields: [membershipPlanId], references: [id], onDelete: Cascade)
  startDate        DateTime
  endDate          DateTime
  status           MemberStatus @default(ACTIVE)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([userId])
  @@index([membershipPlanId])
  @@index([status])
}
```

#### 4. SessionPack Model
**Current code**:
```prisma
model SessionPack {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  totalSessions     Int
  remainingSessions Int
  status            PackStatus @default(ACTIVE)
  purchaseDate      DateTime @default(now())
  expiryDate        DateTime
  price             Float?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```
**Replace with**:
```prisma
model SessionPack {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  totalSessions     Int
  remainingSessions Int
  status            PackStatus @default(ACTIVE)
  purchaseDate      DateTime @default(now())
  expiryDate        DateTime
  price             Float?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([status])
}
```

#### 5. PTSession Model
**Current code**:
```prisma
model PTSession {
  id          String   @id @default(cuid())
  gymId       String
  gym         Gym      @relation(fields: [gymId], references: [id])
  trainerId   String
  trainer     User     @relation("TrainerSessions", fields: [trainerId], references: [id])
  clientId    String
  client      User     @relation("ClientSessions", fields: [clientId], references: [id])
  scheduledAt DateTime
  duration    Int      // minutes
  type        SessionType @default(IN_PERSON)
  status      SessionStatus @default(SCHEDULED)
  fee         Float    @default(50.0)
  noShow      Boolean  @default(false)
  notes       String?
  shiftStatus ShiftStatus?
  startedAt   DateTime?
  endedAt     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  payRecords  PayRecord[]
}
```
**Replace with**:
```prisma
model PTSession {
  id          String   @id @default(cuid())
  gymId       String
  gym         Gym      @relation(fields: [gymId], references: [id], onDelete: Cascade)
  trainerId   String
  trainer     User     @relation("TrainerSessions", fields: [trainerId], references: [id], onDelete: Cascade)
  clientId    String
  client      User     @relation("ClientSessions", fields: [clientId], references: [id], onDelete: Cascade)
  scheduledAt DateTime
  duration    Int      // minutes
  type        SessionType @default(IN_PERSON)
  status      SessionStatus @default(SCHEDULED)
  fee         Float    @default(50.0)
  noShow      Boolean  @default(false)
  notes       String?
  shiftStatus ShiftStatus?
  startedAt   DateTime?
  endedAt     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  payRecords  PayRecord[]

  @@index([gymId])
  @@index([trainerId])
  @@index([clientId])
  @@index([status])
  @@index([scheduledAt])
}
```

#### 6. WorkoutPlan Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
model WorkoutPlan {
  id          String   @id @default(cuid())
  trainerId   String
  trainer     User     @relation("WorkoutPlanTrainer", fields: [trainerId], references: [id], onDelete: Cascade)
  clientId    String
  client      User     @relation("WorkoutPlanClient", fields: [clientId], references: [id], onDelete: Cascade)
  name        String
  description String?
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  exercises   WorkoutExercise[]

  @@index([trainerId])
  @@index([clientId])
}
```

#### 7. WorkoutExercise Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
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

  @@index([workoutPlanId])
}
```

#### 8. MealPlan Model
**Current code**:
```prisma
model MealPlan {
  id        String   @id @default(cuid())
  trainerId String
  trainer   User     @relation("MealPlanTrainer", fields: [trainerId], references: [id])
  clientId  String
  client    User     @relation("MealPlanClient", fields: [clientId], references: [id])
  name      String
  startDate DateTime?
  endDate   DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  entries   MealPlanEntry[]
}
```
**Replace with**:
```prisma
model MealPlan {
  id        String   @id @default(cuid())
  trainerId String
  trainer   User     @relation("MealPlanTrainer", fields: [trainerId], references: [id], onDelete: Cascade)
  clientId  String
  client    User     @relation("MealPlanClient", fields: [clientId], references: [id], onDelete: Cascade)
  name      String
  startDate DateTime?
  endDate   DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  entries   MealPlanEntry[]

  @@index([trainerId])
  @@index([clientId])
}
```

#### 9. MealPlanEntry Model
**Current code**:
```prisma
model MealPlanEntry {
  id         String   @id @default(cuid())
  mealPlanId String
  mealPlan   MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  dayOfWeek  Int      // 0-6
  mealType   String   // Breakfast, Lunch, Dinner, Snack
  foodItem   String
  calories   Int?
  protein    Float?
  carbs      Float?
  fats       Float?
}
```
**Replace with**:
```prisma
model MealPlanEntry {
  id         String   @id @default(cuid())
  mealPlanId String
  mealPlan   MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  dayOfWeek  Int      // 0-6
  mealType   String   // Breakfast, Lunch, Dinner, Snack
  foodItem   String
  calories   Int?
  protein    Float?
  carbs      Float?
  fats       Float?

  @@index([mealPlanId])
}
```

#### 10. ProgressPhoto Model
**Current code**:
```prisma
model ProgressPhoto {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  url       String
  dateTaken DateTime @default(now())
  notes     String?
}
```
**Replace with**:
```prisma
model ProgressPhoto {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  url       String
  dateTaken DateTime @default(now())
  notes     String?

  @@index([userId])
}
```

#### 11. BodyMetric Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
model BodyMetric {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dateRecorded DateTime @default(now())
  weight       Float?
  bodyFat      Float?
  muscleMass   Float?
  notes        String?

  @@index([userId])
}
```

#### 12. HireRequest Model
**Current code**:
```prisma
model HireRequest {
  id        String   @id @default(cuid())
  clientId  String
  client    User     @relation("HireClient", fields: [clientId], references: [id])
  trainerId String
  trainer   User     @relation("HireTrainer", fields: [trainerId], references: [id])
  status    HireRequestStatus @default(PENDING)
  message   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
**Replace with**:
```prisma
model HireRequest {
  id        String   @id @default(cuid())
  clientId  String
  client    User     @relation("HireClient", fields: [clientId], references: [id], onDelete: Cascade)
  trainerId String
  trainer   User     @relation("HireTrainer", fields: [trainerId], references: [id], onDelete: Cascade)
  status    HireRequestStatus @default(PENDING)
  message   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId])
  @@index([trainerId])
  @@index([status])
}
```

#### 13. PayPeriod Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
model PayPeriod {
  id        String   @id @default(cuid())
  gymId     String
  gym       Gym      @relation(fields: [gymId], references: [id], onDelete: Cascade)
  startDate DateTime
  endDate   DateTime
  status    PayPeriodStatus @default(OPEN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  payRecords PayRecord[]

  @@index([gymId])
  @@index([status])
}
```

#### 14. PayRecord Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
model PayRecord {
  id          String   @id @default(cuid())
  trainerId   String
  trainer     User     @relation(fields: [trainerId], references: [id], onDelete: Cascade)
  payPeriodId String
  payPeriod   PayPeriod @relation(fields: [payPeriodId], references: [id], onDelete: Cascade)
  sessionId   String?
  session     PTSession? @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  amount      Float
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([trainerId])
  @@index([payPeriodId])
  @@index([sessionId])
}
```

#### 15. RevenueRecord Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
model RevenueRecord {
  id          String   @id @default(cuid())
  gymId       String
  gym         Gym      @relation(fields: [gymId], references: [id], onDelete: Cascade)
  amount      Float
  category    RevenueCategory
  date        DateTime @default(now())
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([gymId])
  @@index([category])
  @@index([date])
}
```

#### 16. ExpenseRecord Model
**Current code**:
```prisma
model ExpenseRecord {
  id          String   @id @default(cuid())
  gymId       String
  gym         Gym      @relation(fields: [gymId], references: [id])
  amount      Float
  category    ExpenseCategory
  date        DateTime @default(now())
  description String?
  isRecurring Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
**Replace with**:
```prisma
model ExpenseRecord {
  id          String   @id @default(cuid())
  gymId       String
  gym         Gym      @relation(fields: [gymId], references: [id], onDelete: Cascade)
  amount      Float
  category    ExpenseCategory
  date        DateTime @default(now())
  description String?
  isRecurring Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([gymId])
  @@index([category])
  @@index([date])
}
```

#### 17. CategoryBudget Model
**Current code**:
```prisma
model CategoryBudget {
  id        String   @id @default(cuid())
  gymId     String
  gym       Gym      @relation(fields: [gymId], references: [id])
  category  ExpenseCategory
  amount    Float
  month     DateTime // represents the month/year
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([gymId, category, month])
}
```
**Replace with**:
```prisma
model CategoryBudget {
  id        String   @id @default(cuid())
  gymId     String
  gym       Gym      @relation(fields: [gymId], references: [id], onDelete: Cascade)
  category  ExpenseCategory
  amount    Float
  month     DateTime // represents the month/year
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([gymId, category, month])
}
```

#### 18. AuditLog Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
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

  @@index([gymId])
  @@index([userId])
  @@index([actionType])
  @@index([createdAt])
}
```

#### 19. Notification Model
**Current code**:
```prisma
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
**Replace with**:
```prisma
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

  @@index([recipientId])
  @@index([isRead])
  @@index([createdAt])
}
```

#### 20. Message Model
**Current code**:
```prisma
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
```
**Replace with**:
```prisma
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

  @@index([senderId])
  @@index([receiverId])
  @@index([createdAt])
}
```

### Step 2: Generate Migration

Once the `prisma/schema.prisma` file is fully updated, run the migration command to apply changes locally and generate the migration file:

```bash
npx prisma migrate dev --name add_indexes_and_cascades
```

### Step 3: Verify the Changes

Validate the Prisma schema to make sure the syntax is fully valid, regenerate the Prisma client, and build the Next.js application to ensure no typing errors were introduced.

```bash
npx prisma validate
npx prisma generate
npm run build
```
