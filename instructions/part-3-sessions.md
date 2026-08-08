# GymOS Web App — Part 3: PT Sessions, Trainer Hire & Plans

## Context & Technology Stack
You are building **Part 3 of 5** of the GymOS web dashboard. 
**Parts 1-2 have already been built.** Do NOT rebuild the authentication, base layout, gym configuration, or basic member/trainer CRUD.
You have access to the full auth system with RBAC, Prisma schema, dashboard layout, and shared UI components (DataTable, StatusBadge). 

**Tech Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Prisma, PostgreSQL (Neon), Auth.js v5, Zod, shadcn/ui, Lucide icons.
**References**: You MUST read `GymOS-ui-design-system.md` and `GymOS-analysis.md` for design system and overall business rules. Write in an imperative tone.

---

## Prisma Schema Requirements
Ensure the following models and fields are defined in `prisma/schema.prisma` before implementing the routes:

```prisma
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
  INTRO
}

enum ShiftType {
  IN_SHIFT
  OFF_SHIFT
}

model PTSession {
  id          String        @id @default(cuid())
  gymId       String
  memberId    String
  trainerId   String
  date        DateTime
  time        String
  type        SessionType
  status      SessionStatus @default(SCHEDULED)
  shiftType   ShiftType
  duration    Int?
  fee         Float
  noShow      Boolean       @default(false)
  notes       String?
  startedAt   DateTime?
  endedAt     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  member      User          @relation("MemberSessions", fields: [memberId], references: [id])
  trainer     User          @relation("TrainerSessions", fields: [trainerId], references: [id])
}

enum PackStatus {
  ACTIVE
  EXHAUSTED
  EXPIRED
}

model SessionPack {
  id             String     @id @default(cuid())
  memberId       String
  trainerId      String?
  totalSessions  Int
  usedSessions   Int        @default(0)
  remaining      Int
  status         PackStatus @default(ACTIVE)
  expiryDate     DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  
  member         User       @relation("MemberPacks", fields: [memberId], references: [id])
  trainer        User?      @relation("TrainerPacks", fields: [trainerId], references: [id])
}

enum HireRequestStatus {
  PENDING
  ACCEPTED
  DECLINED
}

model HireRequest {
  id          String            @id @default(cuid())
  memberId    String
  trainerId   String
  goalsNote   String?
  status      HireRequestStatus @default(PENDING)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  member      User              @relation("MemberRequests", fields: [memberId], references: [id])
  trainer     User              @relation("TrainerRequests", fields: [trainerId], references: [id])
}

enum PlanStatus {
  DRAFT
  ASSIGNED
}

model WorkoutPlan {
  id          String     @id @default(cuid())
  title       String
  clientId    String
  trainerId   String
  status      PlanStatus @default(DRAFT)
  exercises   Json       // Array of { name, sets, reps, rest, notes }
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  client      User       @relation("ClientWorkouts", fields: [clientId], references: [id])
  trainer     User       @relation("TrainerWorkouts", fields: [trainerId], references: [id])
}

model MealPlan {
  id          String     @id @default(cuid())
  clientId    String
  trainerId   String
  status      PlanStatus @default(DRAFT)
  meals       Json       // Array of { name, description, calories, protein, carbs, fats }
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  client      User       @relation("ClientMeals", fields: [clientId], references: [id])
  trainer     User       @relation("TrainerMeals", fields: [trainerId], references: [id])
}
```

---

## SECTION 1: PT SESSION MANAGEMENT

### 1.1 Owner: Session Oversight Page (SCR-25)
**Path**: `/owner/sessions/page.tsx`
**Requirements (FR-063)**: 
- Create a dashboard view showing all sessions for today across ALL trainers.
- Build a table with columns: Time, Member, Trainer, Type, Status, Shift (In/Off), Duration, Fee.
- Use `StatusBadge` for statuses:
  - `SCHEDULED`: neutral gray
  - `ACTIVE`: pulsing green dot + "Live"
  - `COMPLETED`: solid green
  - `MISSED`: red
  - `CANCELLED`: orange
- Add filters: Date range picker, Trainer dropdown, Status dropdown.
- Implement session actions:
  - **Override Status (FR-064)**: Allow the owner to mark as complete or cancel.
  - **View Details**: Open a modal showing full session info.
- Add an **Export** button to download filtered results as CSV (FR-065).

### 1.2 No-Show Analytics Section
**Requirements (FR-065)**: 
- Add a No-Show analytics section (either top of sessions page or a separate tab).
- Display the no-show rate broken down by Trainer (bar chart), Time slot (heatmap/bar chart), and Membership type.
- Use the green chart palette defined in `GymOS-ui-design-system.md`.

### 1.3 Session Booking (Admin/Trainer Side)
**Paths**: `/owner/sessions/book/page.tsx` and `/trainer/schedule/book/page.tsx`
**Requirements (FR-014, FR-039)**: 
- Build a form with fields:
  - Member (Searchable select - strictly filter to members with pack balance > 0).
  - Trainer (Select - pre-fill and disable if accessed from the trainer view).
  - Date (Date picker) and Time (Time picker).
  - Session Type (In-person, Virtual, Introductory).
- **Validation Rules**:
  - `BR-018/PT011`: If member pack balance is 0, block booking and show error "No sessions remaining - purchase a pack".
  - `BR-049/TRN001`: Prevent double-booking for trainers; show error "Trainer unavailable at this time" and suggest alternatives.
  - Prevent overlapping sessions for the same member.
- **On Success**:
  - Create a `PTSession` record with `status: SCHEDULED`.
  - Add placeholder comments to queue 24h and 1h reminder notifications.
  - Show a success confirmation with session details.

### 1.4 Session Status Override (Owner)
**Requirements (FR-064)**: 
- Build a modal/dialog triggered from the session table actions.
- Allow selecting a new status: `COMPLETED` or `CANCELLED`.
- Show a confirmation warning explaining downstream effects:
  - `COMPLETED` will trigger billing (deduct pack, create revenue record, calculate trainer pay).
  - `CANCELLED` will bypass deduction if outside the policy window.
- Make sure this implements the same server-side billing logic as a QR scan completion.
- Create an audit log entry for this override.

### 1.5 Session Lifecycle Business Logic (Server-Side)
Create shared server actions (e.g., in `actions/sessions.ts`) to be used by the web interface (and later mobile):

- `startSession(sessionId, memberId)`:
  - Validate the session exists and is `SCHEDULED`.
  - Validate the member matches the booked session (`BR-009/PT002`).
  - Set status to `ACTIVE`, record `startedAt` timestamp.
  - Add placeholder to notify trainer.

- `endSession(sessionId, memberId)`:
  - Validate session is `ACTIVE`.
  - Check if the minimum duration (default 20 mins) has elapsed (`BR-010/PT003`).
  - If met: Set status to `COMPLETED`, record `endedAt`, deduct 1 from `SessionPack` (`BR-011/PT004`), create `RevenueRecord` (fee = session fee, category = PT_SESSION), calculate and create `PayRecord` for the trainer based on in-shift/off-shift multipliers (`BR-041-048/PAY001-008`). Check if pack balance ≤ 2 and trigger low balance alert placeholder (`BR-014/PT007`).
  - If not met: Return error "Minimum session duration not reached".

- `handleNoShow(sessionId)`:
  - Set status to `MISSED`, set `noShow` to true.
  - Deduct 1 session from pack (`BR-013/PT006`). Create `RevenueRecord`. NO trainer pay created (`BR-046/PAY006`).
  - Increment member no-show counter and trigger Owner alert if threshold met (`BR-052/TRN004`).

- `cancelSession(sessionId, cancelledBy)`:
  - Check cancellation window (gym configured hours).
  - Inside window (late): deduct 1 session (`BR-012/PT005`), log reason, NO trainer pay (`BR-047/PAY007`).
  - Outside window (on-time): No deduction.
  - Set status to `CANCELLED` and create audit log.

---

## SECTION 2: TRAINER HIRE (Web Admin View)

### 2.1 Hire Requests View (Owner)
**Path**: `/owner/members/[id]/page.tsx`
- In the existing member profile page, add a section showing the member's current trainer assignment.
- Display a history table of their hire requests.

### 2.2 Hire Request Review (Trainer - SCR-31)
**Path**: `/trainer/hire-requests/page.tsx`
**Requirements (FR-083)**: 
- Show a list of pending hire requests directed to the logged-in trainer.
- Display: Member name, goals note, date requested.
- Provide Accept and Decline buttons.
- On Accept: Create a trainer-client relationship and add the member to the trainer's client list.
- On Decline: Update request status and notify the member (placeholder).

---

## SECTION 3: SESSION PACKS (Admin Management)

### 3.1 Pack Management within Member Profile
**Requirements**: 
- In the member profile page (`/owner/members/[id]`), show active session packs (total, used, remaining, status, expiry).
- Add a modal form for an Admin to manually create a new pack for a member.
- Form fields: Total sessions, Linked trainer (optional), Expiry date.
- Deferred Revenue logic (`BR-064/FIN003`): On pack creation, create a Deferred Revenue record representing the upfront payment.

---

## SECTION 4: TRAINER PORTAL - SCHEDULE & CLIENTS

### 4.1 Trainer Schedule (SCR-16)
**Path**: `/trainer/schedule/page.tsx`
**Requirements (FR-036)**: 
- Build a daily/weekly schedule view for the trainer. Default to today.
- Session cards should display: Member name, Time, Type, Status.
- For `ACTIVE` sessions, display an elapsed timer with a pulsing indicator.
- Add a "Book new session" button.
- Add a manual completion button as a QR fallback (FR-037), which calls `endSession`.

### 4.2 Client Management (SCR-17)
**Path**: `/trainer/clients/page.tsx`
**Requirements (FR-041)**: 
- Build a data table displaying the trainer's assigned clients.
- Columns: Client name, Status (Active/At-Risk/Lapsed), Pack Balance, Last Session date, Actions.
- Ensure the table is sortable and filterable.

### 4.3 Client Profile 360° (SCR-18)
**Path**: `/trainer/clients/[id]/page.tsx`
**Requirements (FR-042)**: 
- Display individual client profile data accessible to the trainer.
- Sections: Personal details, Membership info & pack balance, Session history (last 10).
- Visualizations: Body metrics chart, Progress photos timeline placeholder.
- Show current Workout Plan and Meal Plan.
- Action Buttons: "Assign Plan", "Book Session", "Send Message".

---

## SECTION 5: PLAN BUILDER (SCR-19)

### 5.1 Workout Plan Builder
**Path**: `/trainer/plans/workout/new/page.tsx`
**Requirements (FR-084)**: 
- Form to select a client and provide a plan title.
- Dynamic fields to add exercises: Exercise name, Sets, Reps, Rest period, Notes.
- Allow drag-and-drop to reorder exercises.
- Structure by day (e.g., Day 1, Day 2).
- Buttons to "Save as Draft" or "Assign to Client".
- On assignment, set `status: ASSIGNED` (previous assigned plans can be kept in history).

### 5.2 Meal Plan Builder
**Path**: `/trainer/plans/meal/new/page.tsx`
**Requirements (FR-085)**: 
- Form to select a client.
- Dynamic fields to add meals per day: Meal name (Breakfast, Snack, etc.), Description, Calories, Protein (g), Carbs (g), Fats (g).
- Display auto-calculated daily totals for macros and calories.
- Buttons to "Save as Draft" or "Assign".

---

## SECTION 6: TRAINER EARNINGS (SCR-20)
**Path**: `/trainer/earnings/page.tsx`
**Requirements (FR-045)**: 
- Add a date range selector (this week, this month, custom).
- Build summary cards: Total Earnings, In-shift Earnings, Off-shift Earnings, Sessions Completed.
- Build an itemized data table: Date, Client, Session Type, Shift Status, Rate Applied, Amount.
- Add a pay period summary section at the bottom.

---

## SECTION 7: SESSION NOTES
**Requirements (FR-038)**: 
- Add a section within the session detail modal/page (for both owner and trainer) to log notes.
- Use a simple textarea or rich text editor.
- Notes should be visible to the member.
- Add a placeholder for a 24h reminder notification if notes are not logged (`BR-050/TRN002`).

---

## SECTION 8: TESTING CHECKLIST
Include the following in your final implementation testing:
- [ ] Session booking validates pack balance and trainer availability.
- [ ] Session list shows correct statuses with live indicators.
- [ ] Owner can override session status with correct downstream effects.
- [ ] No-show detection logic works (testable via direct API call).
- [ ] Cancellation policy applies correctly (within/outside window).
- [ ] Pay calculation executes correctly (Level 1 in-shift, Level 1 off-shift, Level 2 in-shift, Level 2 off-shift).
- [ ] Pack deduction works precisely on session completion.
- [ ] Revenue record is generated on completion.
- [ ] Trainer hire accept/decline works as expected.
- [ ] Client properly appears in trainer's client list post-hire acceptance.
- [ ] Workout plan builder saves state and assigns correctly.
- [ ] Meal plan builder saves state and assigns correctly.
- [ ] Trainer earnings display correct aggregates and breakdowns.
- [ ] Session notes save and display accurately.
- [ ] All required actions successfully create audit log entries.
