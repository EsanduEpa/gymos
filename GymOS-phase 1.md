**GymOS — Smart Gym Management Platform**

*Phase 1 Scope*

**Software Requirements Specification (SRS) — Phase 1**

Version: v1.0

Date: August 3, 2026

**Status: Working Draft — Internal Development Reference**

*This document is a filtered view of the full GymOS SRS, containing only what is needed to build Phase 1\. Phase 2 and Phase 3 requirements are issued as separate companion documents.*

# **Table of Contents**

*(Right-click and choose “Update Field” in Microsoft Word to populate/refresh this list.)*

 

# **1\. Document Control**

| Project Name | GymOS — Smart Gym Management Platform |
| :---- | :---- |
| **Document Scope** | Phase 1 only — see Section 5 for exact module boundaries. Companion documents cover Phase 2 and Phase 3\. |
| **Document Name** | Software Requirements Specification (SRS) — Phase 1 |
| **Version** | v1.0 |
| **Date** | August 3, 2026 |
| **Document Status** | Working Draft — Internal Development Reference |
| **Source** | Filtered and adapted from the full GymOS SRS v1.0 (all 35 sections, all phases). Where this document is silent on a topic covered in the full SRS, the full SRS remains the authoritative reference. |

# **2\. Executive Summary**

GymOS Phase 1 delivers the core product: a Gym Owner can configure their gym and register members and trainers; a member can hire a personal trainer directly (Private Trainer Hire); the trainer manages that client's sessions and workout/meal plans; PT sessions run through a QR-based booking-to-billing lifecycle; and the Gym Owner gets real-time financial and operational visibility. Authentication is username/password only for both client applications. There is no biometric access control, no public Trainer Marketplace, no gamification, no AI Agent, and no wearable integration in Phase 1 — these are Phase 2 and Phase 3 scope (see Section 5).

Exactly two client applications are built: a Web Dashboard (Gym Owner, SuperAdmin, and Personal Trainer management views) and a Mobile App (Gym Member, and Personal Trainer on-floor views). The Web Dashboard is built first; the Mobile App is built second (see Section 22.9).

*This document is a filtered view of the complete GymOS SRS, containing only the sections, requirements, rules, and workflows relevant to Phase 1\. It exists so the Development Team can work from a single, uncluttered reference for the current build without needing to mentally filter out Phase 2/3 content on every page. The full SRS remains the master reference and source of truth for anything not repeated here (e.g., full detail on Phase 2/3 features, complete Open Questions list).*

# **3\. Project Background**

## **3.1 Current Situation / Process**

Per the FitCore business proposal (background context), the majority of small-to-medium gyms in the target market currently manage members through a combination of WhatsApp groups, paper registers, and spreadsheets. Personal trainers communicate workout and meal plans informally (e.g., via screenshots or chat messages), and membership renewals are tracked manually.

## **3.2 Problems With the Current Process**

● No accountability or structured data for member attendance.

● No centralised record of trainer-assigned workout/meal plans for either the admin or the client.

● Membership renewals are frequently missed, leading to revenue loss.

● Admins have no consolidated view of trainer performance, session counts, or revenue.

## **3.3 Why Phase 1 Is Scoped This Way**

Phase 1 focuses on the smallest set of modules that let a gym fully replace manual PT-session tracking and billing, and let a member start training with a trainer immediately (Private Trainer Hire), without requiring biometric hardware procurement or the more elaborate retention/gamification/AI features that depend on a working core first. See Section 5.0 for the full re-scoping rationale.

# **4\. Objectives (Phase 1\)**

These are the Phase 1 subset of the full SRS's objectives (Section 4 there). OBJ IDs are preserved for cross-document traceability.

● OBJ-01 — Let members hire a personal trainer directly and let trainers manage that private client relationship (sessions, workout/meal plans) — Private Trainer Hire.

● OBJ-02 — Automate the complete Personal Training session lifecycle (booking, start/end, cancellation/no-show policy, billing, and trainer pay) to eliminate revenue leakage.

● OBJ-03 — Provide gym Owners with real-time financial and operational visibility (revenue, expenses, P\&L, trainer performance) without manual report-building.

● OBJ-04 — Equip Personal Trainers with tools to manage clients, deliver workout/meal plans, and have their pay calculated automatically and correctly.

*Deferred to later phases (not in this document): member retention automation and gamification (OBJ-05/06, Phase 2), public Trainer Marketplace (OBJ-07, Phase 2), AI Agent business intelligence (OBJ-08, Phase 3), wearable integration (OBJ-09, Phase 3), biometric gym-door access control (OBJ-10, Phase 3).*

# **5\. Scope**

## **5.0 Why This Document Exists**

The full GymOS SRS re-scoped three areas based on direct Product Owner direction: biometric access control moved to Phase 3 (Phase 1 uses username/password only); a simplified Private Trainer Hire flow was added to Phase 1; and exactly two client applications were confirmed (Web Dashboard built first, Mobile App second). This document applies that re-scoping by including only Phase 1 content. See the full SRS Section 5.0 for the complete rationale.

## **5.1 In Scope (Phase 1\)**

| Module | Primary Users | Summary |
| :---- | :---- | :---- |
| Authentication (Username/Password) | Members, Trainers, Gym Owner, SuperAdmin | Username/password account creation and login for both client applications. |
| PT Session Tracker | Members, Trainers, Owners | QR-based session lifecycle (start/end); automated billing; cancellation policy enforcement; no-show management. |
| Private Trainer Hire | Members, Trainers | Simplified, non-public hire flow — member selects and hires a specific trainer; trainer manages the resulting private client relationship, including per-client workout/meal plans. |
| Owner Dashboard | Gym Owner, SuperAdmin | Real-time revenue, sessions, trainer performance, pack alerts, weekly financial charts. Part of the Web Dashboard application. |
| Trainer Portal (views within the Web Dashboard \+ Mobile App) | Personal Trainers | Session management, client list, workout/meal plans, earnings. |
| Member App | Members | PT sessions, plans, hire-a-trainer flow, billing. Delivered in the Mobile App. |

 

## **5.2 Explicitly Out of Scope for Phase 1**

● Biometric access control (face ID / fingerprint gym-door entry) — Phase 3\. Phase 1 authentication is username/password only.

● Public Trainer Marketplace (discovery, filtering, ratings, virtual sessions) — Phase 2\. Phase 1 has the simpler Private Trainer Hire instead.

● Member Retention Engine (churn scoring, automated re-engagement, 30-day onboarding journey) — Phase 2\.

● Gamification & Community (streaks, challenges, badges, leaderboard) — Phase 2\.

● AI Agent (natural-language Q\&A, automated management accounts, anomaly detection, forecasting, AI member coaching) — Phase 3\.

● Wearable Integration (Apple Health, Google Fit, Fitbit, Garmin) — Phase 3\.

● A delegated "Manager" role, multi-branch management, in-app POS, equipment maintenance logging — see the full SRS Sections 5.2/5.3 and Open Questions for status.

 

## **5.3 What Comes Next**

Phase 2 (companion document, to follow) adds: Member Retention Engine, Gamification & Community, and the public Trainer Marketplace. Phase 3 (companion document, to follow) adds: biometric Access Control, Wearable Integration, and the AI Agent. See the full GymOS SRS Section 5.1 for the complete module-to-phase mapping across all three phases.

# **6\. Project Parties**

Unchanged from the full SRS — reproduced here for a self-contained reference.

| Party | Role | Responsibility | Relevance to Development |
| :---- | :---- | :---- | :---- |
| Founder / Product Owner | Product Owner | Defines product vision, feature scope, pricing, and business rules; final decision-maker on open questions | Primary source of requirements and rule confirmations |
| SuperAdmin (System Owner / Internal Dev Team) | Platform Operator \+ Development Team | Runs the platform itself and, for now, also performs all administrative functions a Gym Owner would — the team is operating a single combined internal role during this build phase | Consumes this SRS directly to build and operate the system |
| Gym Owner | Primary Tenant User | Configures their gym, manages trainers and members, reviews finances | Primary end-user role the system is built for |
| Personal Trainer | End User | Manages assigned clients, delivers workout/meal plans, logs sessions, tracks earnings | Primary end-user role the system is built for |
| Gym Member | End User | Books sessions, checks in, follows plans, tracks progress, makes payments | Primary end-user role the system is built for |
| Payment Gateway Provider(s) — Stripe / PayHere / iPay \[To Be Confirmed\] | Third-Party Integration | Processes membership and session-pack payments | External dependency — see Section 16 |
| Accounting Software — Xero / QuickBooks | Third-Party Integration | Receives exported financial data | External dependency — see Section 16 |
| Wearable Platform Providers — Apple Health, Google Fit, Fitbit, Garmin, WHOOP \[Phase 3\] | Third-Party Integration | Supplies biometric/wearable data | External dependency — see Section 16 (Phase 3\) |
| Biometric Hardware Vendor \[To Be Confirmed\] | Hardware Supplier | Supplies and services fingerprint/face-ID kiosks | External dependency — see Section 16 |

# **7\. User Roles and Permissions**

All four roles are relevant to Phase 1 (there is no phase-specific role). Reproduced in full from the master SRS.

## **SuperAdmin**

The system owner / super-admin role. For this build phase, the internal development/operations team operates under SuperAdmin, and it also covers every administrative function a Gym Owner would need — there is currently no separate "Gym Manager" or "Front Desk" role. SuperAdmin has unrestricted access across the entire platform, including all gyms (tenants).

**Responsibilities:**

● Full platform administration: manage all gyms (tenants), billing, and feature configuration

● Perform any function available to a Gym Owner, for any gym, when needed

● Configure and troubleshoot integrations; in Phase 3, biometric devices as well

● Maintain the system audit log and resolve operational exceptions

**Permissions:**

● Unrestricted access to every module described in Section 8 (System Overview), across all tenants

● All Gym Owner permissions (Section 7, Gym Owner role), for any gym

● Platform-level configuration not tied to a single gym (tenant management, global feature flags)

**Restrictions:**

● None — SuperAdmin is the top-level role for this build phase.

 

## **Gym Owner**

The tenant-level user for a single gym (or, on a multi-branch tier, multiple branches). Holds full administrative and financial control over their own gym. For this build phase, all functions previously split out to a separate "Gym Manager" or "Front Desk Staff" role (member registration assistance, manual access overrides, day-to-day operations) are performed directly by the Gym Owner.

**Responsibilities:**

● Configure gym profile, membership plans, pay rates, cancellation policy, and gamification settings

● Register members and manage the trainer roster

● Register members via username/password account creation (Phase 1); in Phase 3, assist with biometric enrolment and perform manual access overrides when needed

● Monitor daily operations, financial performance, and retention metrics

● Approve trainer payroll and review AI Agent outputs (Phase 3\)

**Permissions:**

● Full access to all gym-level modules listed in Section 8: member management, trainer management, PT session oversight, financial management, dashboard/analytics, access control, gamification/retention configuration

● Register/suspend/deactivate members; override access decisions (manual in Phase 1; biometric-related in Phase 3\)

● Add/edit/deactivate trainer accounts; assign trainer level; approve shift submissions

● Configure membership plans, trainer pay rates, cancellation policy, gamification settings, re-engagement templates

● View/export all financial data (P\&L, revenue, expenses, payroll) for their own gym

● View and act on AI Agent insights (Phase 3\)

● Manage GymOS subscription billing for their own gym

● View the system audit log for their own gym

**Restrictions:**

● Restricted to their own gym's (or own multi-branch group's) data — no visibility into other tenants (multi-tenant isolation)

● Cannot access SuperAdmin platform-level functions (other tenants' data, platform-wide configuration)

 

## **Personal Trainer**

A trainer assigned to a gym, using the mobile app (on-floor session execution) and the web Trainer Portal (client and plan management). Each trainer is assigned a pay Level (1 or 2\) by the Gym Owner — this is a configurable attribute of the role, not a separate role.

**Responsibilities:**

● Manage an assigned client roster

● Create and assign workout/meal plans

● Log session notes and monitor client wearable/recovery signals (where connected)

● Track own earnings and shift schedule

● Respond to Trainer Marketplace interest requests within 48 hours (Phase 2\)

**Permissions:**

● View/edit own trainer profile, specialisations, availability, shift hours

● View assigned client list and individual client profiles

● Create/assign/update workout and meal plans for own clients

● Manage own session schedule (book, cancel, reschedule, mark complete)

● Log session notes

● View own earnings, pay-period breakdown, and payroll export

● Enable/disable AI Coach per client and review flagged AI conversations (Phase 3\)

● Message own clients

● Opt in/out of Trainer Marketplace visibility; offer virtual sessions (Phase 2\)

**Restrictions:**

● Cannot view or edit other trainers' clients, plans, or earnings

● Cannot change own pay rate or level (Gym Owner-controlled)

● Cannot access gym-wide financial reports or the Owner Dashboard

● Cannot configure gym-wide settings (membership plans, cancellation policy, gamification rules)

 

## **Gym Member**

Any individual who holds an active (or lapsed/expired) membership at a gym. Primary channel is the mobile app.

**Responsibilities:**

● Maintain an accurate personal profile and fitness goals

● Log in via username/password (Phase 1); check in at the gym via biometric authentication once available (Phase 3\)

● Book, attend, or cancel Personal Training (PT) sessions in accordance with gym cancellation policy

● Follow assigned workout and meal plans

● Make membership and session-pack payments

● Engage with gamification features (streaks, challenges, leaderboard) on an opt-in basis (Phase 2\)

**Permissions:**

● View/edit own profile and fitness goals

● View own membership status, session pack balance, and billing history

● Book/cancel own PT sessions (subject to cancellation policy)

● Start/end own PT sessions via QR scan

● View own workout/meal plans (current and historical)

● Log solo workouts and nutrition intake

● Chat with AI Coach (only if enabled by their trainer) (Phase 3\)

● Message assigned trainer directly

● Browse Trainer Marketplace and submit PT interest requests (Phase 2\)

● Opt in/out of the leaderboard; view own gamification progress (Phase 2\)

● Connect/disconnect a wearable device (Phase 3\)

● Purchase/renew membership and session packs in-app

**Restrictions:**

● Cannot view other members' data, plans, or profiles

● Cannot view trainer earnings or gym financial data

● Cannot override access decisions

● Cannot access Gym Owner, Trainer Portal, or SuperAdmin functions

 

## **7.1 Role-Permission Matrix**

"Full" \= complete create/read/update capability; "View" \= read-only; "—" \= no access. The "Access Control (Biometric, Phase 3)" row is included for completeness but is not built in Phase 1\.

| Module / Function | SuperAdmin | Gym Owner | Personal Trainer | Gym Member |
| :---- | :---- | :---- | :---- | :---- |
| Own Profile & Goals | — | View | Full (own) | Full |
| Authentication (Username/Password) | Full (any gym) | Configure/Manage (own gym) | Self-service (own account) | Self-service (own account) |
| Access Control (Biometric, Phase 3\) | Full (any gym) | Configure/Override | Self (staff use) \[TBC\] | Self-service |
| PT Session Booking/Lifecycle | Full (any gym) | Oversee all / override | Manage own sessions | Book/Start/End own |
| Workout & Meal Plans | View (any gym) | View all | Create/assign (own clients) | View own |
| AI Coaching Assistant (Phase 3\) | — | — \[TBC\] | Enable/monitor (own clients) | Use (if enabled) |
| Trainer Marketplace (Phase 2\) | — | Enable/moderate | Profile / accept-decline | Browse / request |
| Gamification & Community (Phase 2\) | — | Configure | View client participation | Participate (opt-in) |
| Member Registration | Full (any gym) | Full | — | Self (app sign-up) \[TBC\] |
| Trainer Management | Full (any gym) | Full | View own profile only | — |
| PT Session Oversight (all) | Full (any gym) | Full | Own sessions only | — |
| Financial Management | Full (any gym) | Full (view \+ export) | Own earnings only | Own billing history only |
| Owner Dashboard & Analytics | Full (any gym) | Full | — | — |
| AI Agent (Owner Intelligence, Phase 3\) | Full (any gym) | Full | — | — |
| Access Control Management | Full (any gym) | Full (config \+ logs \+ override) | — | View own log |
| GymOS Subscription & Billing | Full (any gym) | Full (own gym) | — | — |
| Multi-Tenant Platform Admin | Full | — | — | — |

# **8\. System Overview**

## **8.1 What the System Does**

GymOS operates as a multi-tenant cloud platform: each gym ("tenant") configures its own membership plans, pay rates, and policies, and its own Members, Trainers, and Gym Owner interact within that isolated tenant space. SuperAdmin sits above all tenants with unrestricted platform-wide access. There are exactly two client applications — the Web Dashboard and the Mobile App (Section 8.4).

## **8.2 How Major Components Interact (Phase 1\)**

● A PT session's QR-based lifecycle (PT Session Tracker) drives: member pack-balance deduction, revenue recording (feeding the Owner Dashboard's Financial Management view), and trainer pay calculation (feeding the Trainer's Earnings view and the Owner's payroll report).

● Private Trainer Hire establishes a trainer-client relationship that the PT Session Tracker, plan assignment, and earnings modules all key off — once a member hires a trainer, all subsequent sessions, plans, and billing for that pair flow through the same mechanisms.

● Workout/meal plans created by a Trainer become immediately visible to that specific client in the Member App.

## **8.3 High-Level System Workflow (Phase 1\)**

A Gym Owner configures the gym (plans, pay rates, policies) via the Web Dashboard → registers members and trainers (username/password accounts) → a member hires a trainer directly (Private Trainer Hire) → the trainer assigns that client a workout/meal plan and they book/attend PT sessions via the Mobile App's QR lifecycle → the system automatically bills the member, pays the trainer, and records revenue/expenses → the Owner reviews real-time dashboards on the Web Dashboard. Detailed step-by-step workflows are in Section 13\.

## **8.4 Client Applications & Role Coverage**

| Application | Roles That Use It | Primary Purpose |
| :---- | :---- | :---- |
| Web Dashboard | Gym Owner, SuperAdmin, Personal Trainer | Gym configuration, member/trainer management, financial reporting, analytics (Gym Owner/SuperAdmin); client management, plan building, earnings review (Personal Trainer). |
| Mobile App | Gym Member, Personal Trainer | Hiring a trainer, booking/attending PT sessions, viewing plans, payments (Gym Member); on-floor session start/end via QR, session notes, schedule view (Personal Trainer). |

 

*"Trainer Portal" elsewhere in this document refers to the Trainer-facing views inside the Web Dashboard (management/planning) plus the Trainer-facing views inside the Mobile App (on-floor session execution) — not a third application. Full build-sequencing guidance is in Section 22.9.*

# **9\. Functional Requirements (Phase 1\)**

This section contains 59 functional requirements — the Phase 1 subset of the full SRS's 86\. IDs are preserved from the full SRS for cross-document traceability (so ID gaps are expected and correct — they mark a Phase 2/3 requirement filtered out here, not a missing item).

## **A. Member Account & Profile**

### **FR-001 — Member Registration & Account Creation**

| Requirement ID | FR-001 |
| :---- | :---- |
| **Module** | A. Member Account & Profile |
| **Priority** | Must Have |
| **Description** | The system shall allow the Gym Owner (or SuperAdmin) to register a new member with personal details and an active membership plan, creating a member account and triggering onboarding. |
| **User / Actor** | Gym Owner (data entry); Member (app activation) |
| **Preconditions** | • User performing registration is authenticated as Gym Owner or SuperAdmin • At least one membership plan is configured for the gym |
| **Trigger** | A new individual requests to join the gym. |
| **Main Workflow** | 1\. Admin opens the registration form 2\. Admin enters: full name, phone number, email, date of birth, emergency contact, and selects a membership plan 3\. Admin collects payment for the selected plan 4\. System creates the member account and activates the membership record 5\. System generates app login credentials and sends them via SMS/email 6\. System triggers the 30-day onboarding journey (FR-009) automatically |
| **Alternative / Exception Flows** | • Payment fails: system displays a payment error and allows retry or abandonment without creating an active membership (BR-MEM/Payment path per MEM-01) • \[To Be Confirmed\] Whether members may self-register via the app without Admin involvement is not specified in source material |
| **Business Rules** | Referenced: MEM-01 workflow |
| **Expected Outcome** | A new member record exists with an active membership, and the member has app access. |

 

### **FR-002 — Member Login & Authentication**

| Requirement ID | FR-002 |
| :---- | :---- |
| **Module** | A. Member Account & Profile |
| **Priority** | Must Have |
| **Description** | The system shall allow a registered member to log in to the Mobile App using a username (or email) and password. This is the only authentication method in Phase 1 — device-level biometric login (Face/Touch ID) and gym-entry biometric access control are both deferred to Phase 3 (see Section 5.0). |
| **User / Actor** | Member |
| **Preconditions** | • Member account exists and credentials have been issued |
| **Trigger** | Member opens the Mobile App. |
| **Main Workflow** | 1\. Member enters username/email and password 2\. System validates credentials 3\. System grants access to the member's home screen |
| **Alternative / Exception Flows** | • Invalid credentials: system displays an authentication error and permits retry (see Section 21, Error Handling) • \[TBD\] Password reset / forgot-password flow is not described in source material • Phase 3: device-level biometric login (Face/Touch ID) may be added as a convenience option on top of username/password — not in Phase 1 scope. |
| **Business Rules** | — |
| **Expected Outcome** | Member is authenticated via username/password and can access app functions. |

 

### **FR-003 — View & Edit Personal Profile**

| Requirement ID | FR-003 |
| :---- | :---- |
| **Module** | A. Member Account & Profile |
| **Priority** | Must Have |
| **Description** | The system shall allow a member to view and edit their personal profile, including photo, contact details, and health notes. |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in |
| **Trigger** | Member navigates to the Profile screen. |
| **Main Workflow** | 1\. Member opens Profile screen 2\. Member edits editable fields (photo, contact, health notes) 3\. System saves changes and confirms |
| **Alternative / Exception Flows** | • Invalid field format (e.g., malformed phone/email): system rejects save and displays a validation error \[format rules TBD\] |
| **Business Rules** | — |
| **Expected Outcome** | Member profile is updated and persisted. |

 

### **FR-004 — View Membership Status & Session Pack Balance**

| Requirement ID | FR-004 |
| :---- | :---- |
| **Module** | A. Member Account & Profile |
| **Priority** | Must Have |
| **Description** | The system shall display the member's active membership plan, start date, expiry date, renewal status, and PT session-pack balance (purchased vs. used). |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in and has an associated membership record |
| **Trigger** | Member opens the Membership/Home screen. |
| **Main Workflow** | 1\. System retrieves the member's current membership and pack records 2\. System displays plan name, dates, renewal status, and pack balance |
| **Alternative / Exception Flows** | • No active membership: system displays expired/lapsed status and a renewal prompt (BR-MEM007) |
| **Business Rules** | MEM006, MEM007 |
| **Expected Outcome** | Member has an accurate, real-time view of their account standing. |

 

### **FR-005 — Set Personal Fitness Goals**

| Requirement ID | FR-005 |
| :---- | :---- |
| **Module** | A. Member Account & Profile |
| **Priority** | Should Have |
| **Description** | The system shall allow a member to set personal fitness goals (e.g., weight, strength targets, session frequency) and track progress against them. |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in |
| **Trigger** | Member opens the Goals section. |
| **Main Workflow** | 1\. Member selects goal type and target value 2\. System saves the goal 3\. System displays actual-vs-target progress over time |
| **Alternative / Exception Flows** | • \[TBD\] Goal categories/templates are not enumerated in source material beyond 'weight loss / muscle gain / endurance' |
| **Business Rules** | — |
| **Expected Outcome** | Member has a saved, trackable fitness goal. |

 

### **FR-007 — Upload Progress Photos**

| Requirement ID | FR-007 |
| :---- | :---- |
| **Module** | A. Member Account & Profile |
| **Priority** | Must Have |
| **Description** | The system shall allow a member (or their trainer) to upload progress photos linked to the member's profile and dated timeline. |
| **User / Actor** | Member; Personal Trainer |
| **Preconditions** | • User is logged in |
| **Trigger** | User selects 'Add Progress Photo'. |
| **Main Workflow** | 1\. User selects/captures a photo 2\. System stores the photo against the member's ID with a date 3\. Photo appears in the member's progress timeline |
| **Alternative / Exception Flows** | • Upload fails (e.g., file too large/unsupported format): system displays an error \[size/format limits TBD\] |
| **Business Rules** | — |
| **Expected Outcome** | A dated progress photo is stored and viewable in the member's history. |

 

### **FR-008 — Track Body Metrics Over Time**

| Requirement ID | FR-008 |
| :---- | :---- |
| **Module** | A. Member Account & Profile |
| **Priority** | Should Have |
| **Description** | The system shall allow logging and graphing of body metrics (weight, BMI, body fat %, chest, waist, arm measurements) over time. |
| **User / Actor** | Member; Personal Trainer |
| **Preconditions** | • User is logged in |
| **Trigger** | User logs a new body-metric entry. |
| **Main Workflow** | 1\. User enters metric values and date 2\. System stores the entry 3\. System renders a trend chart of historical entries |
| **Alternative / Exception Flows** | • Non-numeric or out-of-range values entered: system rejects the entry \[validation ranges TBD\] |
| **Business Rules** | — |
| **Expected Outcome** | Member/trainer can visualise physical progress over time. |

 

### **FR-012 — Membership Expiry Alert & Auto-Suspension**

| Requirement ID | FR-012 |
| :---- | :---- |
| **Module** | A. Member Account & Profile |
| **Priority** | Must Have |
| **Description** | The system shall notify a member 30 days before membership expiry, and automatically set membership status to 'Expired' if the expiry date passes without renewal — blocking new session bookings and purchases in Phase 1\. Once Phase 3 biometric access control is implemented, an 'Expired' status additionally blocks gym-door entry (FR-010). |
| **User / Actor** | System (automated) |
| **Preconditions** | • Member has an active membership with a known expiry date |
| **Trigger** | Scheduled daily check against expiry dates. |
| **Main Workflow** | 1\. 30 days before expiry: push notification sent; renewal prompt shown in app 2\. On expiry date with no renewal: member status set to 'Expired'; new PT session bookings and pack/membership-dependent features are blocked until renewed |
| **Alternative / Exception Flows** | • Phase 3: an 'Expired' status also blocks biometric gym-door entry (see FR-010). |
| **Business Rules** | MEM006, MEM007 |
| **Expected Outcome** | Members are proactively reminded, and lapsed memberships are automatically access-blocked without manual intervention. |

 

## **C. PT Session Booking & Lifecycle**

### **FR-013 — View Personal Session Attendance History**

| Requirement ID | FR-013 |
| :---- | :---- |
| **Module** | C. PT Session Booking & Lifecycle |
| **Priority** | Should Have |
| **Description** | The system shall allow a member to view their own PT session attendance history (date, time, trainer, status: completed/missed/cancelled). This is a Phase 1 requirement covering session history only — attendance streak tracking and milestone badges are a separate, Phase 2 capability (see FR-031, module H, Gamification & Community), since streak/gamification is scoped to Phase 2 regardless of what attendance signal it is later built on (see Open Questions Q-14). |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in |
| **Trigger** | Member opens Session History screen. |
| **Main Workflow** | 1\. System retrieves the member's PT session log 2\. System displays entries chronologically with date, time, trainer, and status |
| **Alternative / Exception Flows** | • Phase 2: FR-031 adds streak tracking on top of this same session history data. |
| **Business Rules** | — |
| **Expected Outcome** | Member can review their PT session attendance record. |

 

### **FR-014 — Book a PT Session**

| Requirement ID | FR-014 |
| :---- | :---- |
| **Module** | C. PT Session Booking & Lifecycle |
| **Priority** | Must Have |
| **Description** | The system shall allow a member (or trainer/admin on the member's behalf) to book a PT session against the trainer's available time slots, provided the member has a positive session-pack balance and no scheduling conflict exists. |
| **User / Actor** | Member; Personal Trainer; Gym Owner |
| **Preconditions** | • Member holds a session pack with balance \> 0 • Trainer has an available slot at the requested time |
| **Trigger** | User initiates a booking. |
| **Main Workflow** | 1\. User selects member, trainer, date, time, session type 2\. System checks pack balance 3\. System checks trainer availability for conflicts 4\. System creates the session record with status 'Scheduled' 5\. System notifies both member and trainer 6\. System schedules 24-hour and 1-hour automated reminders |
| **Alternative / Exception Flows** | • Zero pack balance: booking is blocked and the pack-purchase flow (FR-018) is prompted (BR-PT011) • Trainer time conflict: booking is rejected; alternative slots are suggested (BR-TRN001) |
| **Business Rules** | PT011, TRN001 |
| **Expected Outcome** | A confirmed session exists in 'Scheduled' status with reminders queued. |

 

### **FR-015 — PT Session Lifecycle — QR Start**

| Requirement ID | FR-015 |
| :---- | :---- |
| **Module** | C. PT Session Booking & Lifecycle |
| **Priority** | Must Have |
| **Description** | The system shall start a PT session when the member scans a valid start QR code linked to their booked session, beginning a timer and notifying the trainer. |
| **User / Actor** | Member |
| **Preconditions** | • Session status is 'Scheduled'; scheduled time has arrived or is imminent |
| **Trigger** | Member scans the start QR code at the PT zone. |
| **Main Workflow** | 1\. System validates that the scanning member matches the booked session ID 2\. Session status set to 'Active'; start timestamp recorded; timer starts 3\. Trainer is notified that the session has begun |
| **Alternative / Exception Flows** | • QR does not match the member's booked session: scan is rejected, an error is shown, and the incident is logged (BR-PT002) |
| **Business Rules** | PT001, PT002 |
| **Expected Outcome** | Session is verifiably underway with an accurate start time. |

 

### **FR-016 — PT Session Lifecycle — QR End & Billing**

| Requirement ID | FR-016 |
| :---- | :---- |
| **Module** | C. PT Session Booking & Lifecycle |
| **Priority** | Must Have |
| **Description** | The system shall end a PT session when the member scans the end QR code, but only if the configured minimum session duration (default 20 minutes) has elapsed, and shall then trigger billing (one session deducted from the pack) automatically. |
| **User / Actor** | Member |
| **Preconditions** | • Session status is 'Active' |
| **Trigger** | Member scans the end QR code. |
| **Main Workflow** | 1\. System checks elapsed time since start scan against the minimum duration threshold 2\. If met: session status set to 'Completed'; end timestamp recorded; one session deducted from pack; revenue record created; session summary sent to member |
| **Alternative / Exception Flows** | • Minimum duration not met: end scan is rejected with a message stating the minimum has not been reached (BR-PT003) |
| **Business Rules** | PT003, PT004, FIN001 |
| **Expected Outcome** | Session is closed, billed, and reflected in the member's pack balance and the gym's revenue. |

 

### **FR-017 — Late Cancellation & No-Show Handling**

| Requirement ID | FR-017 |
| :---- | :---- |
| **Module** | C. PT Session Booking & Lifecycle |
| **Priority** | Must Have |
| **Description** | The system shall apply the gym's configured cancellation policy: a cancellation inside the policy window (default configurable, e.g. 24 hours) deducts one session from the pack, and a session with no start-QR scan by the scheduled time is automatically marked 'Missed' with a pack deduction and no-show flag. |
| **User / Actor** | Member; System (automated) |
| **Preconditions** | • Session status is 'Scheduled' |
| **Trigger** | Member cancels the session, or the scheduled start time passes with no start scan. |
| **Main Workflow** | 1\. Late cancellation: session marked 'Cancelled (late)'; 1 session deducted; trainer and owner notified 2\. No-show: session marked 'Missed'; 1 session deducted; trainer notified; no-show counter incremented on client record |
| **Alternative / Exception Flows** | • Cancellation outside the policy window: no deduction applied \[exact 'on-time' outcome path implied but not explicitly detailed in source — Assumption: no charge, no flag\] • Client no-show count exceeds a configurable threshold: Owner alert triggered; client flagged in retention dashboard (BR-TRN004) |
| **Business Rules** | PT005, PT006, TRN003, TRN004 |
| **Expected Outcome** | Cancellation and no-show policies are enforced automatically and consistently, without manual trainer/owner intervention. |

 

## **D. Session Pack & Payments**

### **FR-018 — Purchase / Renew Session Pack**

| Requirement ID | FR-018 |
| :---- | :---- |
| **Module** | D. Session Pack & Payments |
| **Priority** | Must Have |
| **Description** | The system shall allow a member to purchase or renew a PT session pack via an integrated payment gateway, creating a new pack record on successful payment. |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in |
| **Trigger** | Pack-expiry alert fires (≤2 sessions remaining), or member opens the pack store voluntarily. |
| **Main Workflow** | 1\. Member views available pack sizes/prices (gym-configured) 2\. Member selects a pack and proceeds to payment 3\. Payment gateway processes the transaction 4\. On success: new pack record created (member ID, trainer ID, total sessions, sessions used \= 0, purchase date, expiry date); balance updated in app; confirmation/receipt sent; deferred revenue recorded |
| **Alternative / Exception Flows** | • Payment fails: error shown; retry offered; no pack is created (BR-PT/MEM-06) |
| **Business Rules** | PT007, PT008, FIN003 |
| **Expected Outcome** | Member's pack balance is topped up and the gym's deferred revenue ledger is updated. |

 

### **FR-019 — Purchase / Renew Membership Plan In-App**

| Requirement ID | FR-019 |
| :---- | :---- |
| **Module** | D. Session Pack & Payments |
| **Priority** | Must Have |
| **Description** | The system shall allow a member to purchase or renew their gym membership directly within the app via an integrated payment gateway. |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in |
| **Trigger** | Member selects 'Renew Membership' or membership nears/has passed expiry. |
| **Main Workflow** | 1\. Member selects a membership plan/duration 2\. Payment gateway processes the transaction 3\. On success: membership record is extended/reactivated; confirmation sent |
| **Alternative / Exception Flows** | • Payment fails: error shown; retry offered |
| **Business Rules** | FIN002 |
| **Expected Outcome** | Member's membership status is renewed without staff involvement. |

 

### **FR-020 — View Billing History & Payment Method Management**

| Requirement ID | FR-020 |
| :---- | :---- |
| **Module** | D. Session Pack & Payments |
| **Priority** | Should Have |
| **Description** | The system shall allow a member to view their payment/billing history and add or update a payment method. |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in |
| **Trigger** | Member opens Billing screen. |
| **Main Workflow** | 1\. System displays historical payments (membership \+ pack purchases) 2\. Member adds/edits a stored payment method \[tokenisation/PCI approach TBD — see Section 20\] |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Member has visibility and control over their payment information. |

 

## **E. Training & Nutrition Plans**

### **FR-021 — View Assigned Workout Plan**

| Requirement ID | FR-021 |
| :---- | :---- |
| **Module** | E. Training & Nutrition Plans |
| **Priority** | Must Have |
| **Description** | The system shall display the member's current workout plan (exercises, sets, reps, rest periods, notes) as assigned by their trainer, and allow viewing of historical plans. |
| **User / Actor** | Member |
| **Preconditions** | • A trainer has assigned at least one plan |
| **Trigger** | Member opens the Workout Plan screen. |
| **Main Workflow** | 1\. System retrieves the current active plan and displays exercise detail 2\. Member can navigate to historical (dated) plans |
| **Alternative / Exception Flows** | • No plan assigned: an empty/appropriate state is shown \[exact copy TBD\] |
| **Business Rules** | — |
| **Expected Outcome** | Member has clear, current visibility of their training program. |

 

### **FR-022 — View Assigned Meal Plan**

| Requirement ID | FR-022 |
| :---- | :---- |
| **Module** | E. Training & Nutrition Plans |
| **Priority** | Must Have |
| **Description** | The system shall display the member's current meal plan (daily meals, calorie targets, macros) as assigned by their trainer. |
| **User / Actor** | Member |
| **Preconditions** | • A trainer has assigned a meal plan |
| **Trigger** | Member opens the Meal Plan screen. |
| **Main Workflow** | 1\. System retrieves and displays the current meal plan |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Member can follow trainer-prescribed nutrition guidance. |

 

### **FR-023 — Log Solo Workout Session**

| Requirement ID | FR-023 |
| :---- | :---- |
| **Module** | E. Training & Nutrition Plans |
| **Priority** | Should Have |
| **Description** | The system shall allow a member to log a self-directed (non-PT) workout session, recording exercises completed, duration, and notes. |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in |
| **Trigger** | Member selects 'Log Workout'. |
| **Main Workflow** | 1\. Member enters exercises, duration, notes 2\. System saves the entry to the member's activity history |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Member's independent training activity is captured alongside PT sessions. |

 

### **FR-024 — Log Daily Nutrition Intake**

| Requirement ID | FR-024 |
| :---- | :---- |
| **Module** | E. Training & Nutrition Plans |
| **Priority** | Could Have |
| **Description** | The system shall allow a member to log daily nutrition intake (calories, protein, carbs, fats). |
| **User / Actor** | Member |
| **Preconditions** | • Member is logged in |
| **Trigger** | Member selects 'Log Nutrition'. |
| **Main Workflow** | 1\. Member enters intake values 2\. System saves the entry |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Nutrition adherence data is available to the member (and, per meal plan context, informs AI Coach responses). |

 

## **G. Trainer Communication**

### **FR-028 — Direct Messaging Between Member and Trainer**

| Requirement ID | FR-028 |
| :---- | :---- |
| **Module** | G. Trainer Communication |
| **Priority** | Must Have |
| **Description** | The system shall provide an in-app messaging channel allowing a member and their assigned trainer to send and receive direct messages. |
| **User / Actor** | Member; Personal Trainer |
| **Preconditions** | • A trainer is assigned to the member |
| **Trigger** | User opens the messaging screen. |
| **Main Workflow** | 1\. User composes and sends a message 2\. Recipient receives an in-app/push notification and can reply |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Gym-related communication occurs within GymOS rather than external channels (e.g., WhatsApp). |

 

### **FR-030 — Submit Trainer Review & Rating**

| Requirement ID | FR-030 |
| :---- | :---- |
| **Module** | G. Trainer Communication |
| **Priority** | Could Have |
| **Description** | The system shall allow a member who has completed at least one session with a trainer to submit a 1–5 star rating and short review, subject to Owner moderation before publication. |
| **User / Actor** | Member; Gym Owner (moderator) |
| **Preconditions** | • Member has completed ≥1 session with the trainer |
| **Trigger** | Member selects 'Leave a Review' after a session. |
| **Main Workflow** | 1\. Member submits rating and comment 2\. Review enters a moderation queue 3\. Owner approves or rejects the review 4\. Approved reviews are published to the trainer's public profile and update their rating |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | MKT002 |
| **Expected Outcome** | Trainer profiles display verified, moderated member feedback. |

 

## **I. Trainer Account & Profile**

### **FR-034 — Trainer Profile Management & Availability Toggle**

| Requirement ID | FR-034 |
| :---- | :---- |
| **Module** | I. Trainer Account & Profile |
| **Priority** | Must Have |
| **Description** | The system shall allow a trainer to view/edit their profile (photo, bio, specialisations, years of experience), set shift hours (submitted to the Owner for approval), and toggle their Trainer Marketplace availability on/off. |
| **User / Actor** | Personal Trainer; Gym Owner (shift approval) |
| **Preconditions** | • Trainer account exists |
| **Trigger** | Trainer opens Profile settings. |
| **Main Workflow** | 1\. Trainer edits profile fields and/or shift hours 2\. Shift-hour changes are submitted to the Owner for approval 3\. Trainer toggles marketplace visibility on/off |
| **Alternative / Exception Flows** | • Owner rejects submitted shift hours: \[TBD — rejection/resubmission flow not detailed in source\] |
| **Business Rules** | — |
| **Expected Outcome** | Trainer profile and availability are current and Owner-approved where required. |

 

## **J. Trainer Session Management**

### **FR-036 — View Daily/Weekly Session Schedule & Live Session Status**

| Requirement ID | FR-036 |
| :---- | :---- |
| **Module** | J. Trainer Session Management |
| **Priority** | Must Have |
| **Description** | The system shall display the trainer's upcoming sessions (member, time, type, status) and highlight any session currently 'Active' with an elapsed-time indicator. |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Trainer has scheduled sessions |
| **Trigger** | Trainer opens the app/portal dashboard. |
| **Main Workflow** | 1\. System retrieves and displays today's/this week's sessions with status 2\. Any Active session is shown live with a running timer |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Trainer has a real-time operational view of their day. |

 

### **FR-037 — Manual Session Completion (QR Fallback)**

| Requirement ID | FR-037 |
| :---- | :---- |
| **Module** | J. Trainer Session Management |
| **Priority** | Should Have |
| **Description** | The system shall allow a trainer to manually mark a session as completed when a QR scan is not possible. |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Session status is 'Active' or 'Scheduled' |
| **Trigger** | Trainer selects 'Mark Complete' manually. |
| **Main Workflow** | 1\. Trainer manually completes the session 2\. System applies standard completion logic (billing, pack deduction, pay calculation) as though ended by QR |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Session lifecycle can be closed even when the QR mechanism is unavailable. |

 

### **FR-038 — Log Session Notes**

| Requirement ID | FR-038 |
| :---- | :---- |
| **Module** | J. Trainer Session Management |
| **Priority** | Must Have |
| **Description** | The system shall allow a trainer to log session notes (exercises performed, observations, next steps) during or after a session, visible to the member, with a reminder if not logged within 24 hours of completion. |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Session exists (Active or Completed) |
| **Trigger** | Trainer opens the session record to add notes. |
| **Main Workflow** | 1\. Trainer enters notes 2\. System saves notes to the session record and makes them visible to the member |
| **Alternative / Exception Flows** | • Session completed \>24h ago with no notes: trainer receives a reminder notification (BR-TRN002) |
| **Business Rules** | TRN002 |
| **Expected Outcome** | Every completed session has an associated, member-visible record of what occurred. |

 

### **FR-039 — Book/Cancel/Reschedule Client Sessions**

| Requirement ID | FR-039 |
| :---- | :---- |
| **Module** | J. Trainer Session Management |
| **Priority** | Must Have |
| **Description** | The system shall allow a trainer to book a new session for a client, or cancel/reschedule an existing session, with the cancellation policy applied automatically. |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Trainer has an assigned client with pack balance for booking |
| **Trigger** | Trainer initiates booking/cancellation/reschedule. |
| **Main Workflow** | 1\. Trainer selects client, date, time, type (for new bookings) or selects an existing session to cancel/reschedule 2\. System applies double-booking prevention and cancellation-policy rules 3\. System notifies the member of the outcome |
| **Alternative / Exception Flows** | • Overlapping booking attempted: rejected with alternative slots suggested (BR-TRN001) • Trainer cancels within 24h of session time: Owner is notified (BR-TRN005) |
| **Business Rules** | TRN001, TRN005 |
| **Expected Outcome** | Trainer schedule remains conflict-free and policy-compliant. |

 

## **K. Trainer Client Management**

### **FR-041 — View Client List with Status & Churn Indicators**

| Requirement ID | FR-041 |
| :---- | :---- |
| **Module** | K. Trainer Client Management |
| **Priority** | Must Have |
| **Description** | The system shall display a trainer's full client roster with status (Active / At-Risk / Lapsed) and churn score per client. |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Trainer has ≥1 assigned client |
| **Trigger** | Trainer opens Client Management. |
| **Main Workflow** | 1\. System retrieves assigned clients and their current status/churn score 2\. List is displayed, sortable/filterable by status \[filter mechanics TBD\] |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | CHU001-006 (see Section 12\) |
| **Expected Outcome** | Trainer can prioritise attention toward at-risk clients. |

 

### **FR-042 — View Individual Client Profile (360° View)**

| Requirement ID | FR-042 |
| :---- | :---- |
| **Module** | K. Trainer Client Management |
| **Priority** | Must Have |
| **Description** | The system shall display a client's full profile to their trainer: personal details, membership, session history, pack balance, streak, churn score, and wearable data summary (recovery score, resting heart rate trend, HRV, sleep score, where connected). |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Client is assigned to the trainer |
| **Trigger** | Trainer selects a client from the roster. |
| **Main Workflow** | 1\. System aggregates and displays the client's profile data |
| **Alternative / Exception Flows** | • Client has no wearable connected: wearable section is omitted/empty |
| **Business Rules** | — |
| **Expected Outcome** | Trainer has a single consolidated view to inform coaching decisions. |

 

## **L. Trainer Earnings & Payroll**

### **FR-044 — Automated Pay Calculation (Level × In-Shift/Off-Shift)**

| Requirement ID | FR-044 |
| :---- | :---- |
| **Module** | L. Trainer Earnings & Payroll |
| **Priority** | Must Have |
| **Description** | The system shall automatically calculate pay for each completed session based on the trainer's level (1 or 2\) and whether the session occurred within or outside the trainer's scheduled shift hours, applying the Owner-configured base rate and off-shift premium. |
| **User / Actor** | System (automated) |
| **Preconditions** | • Session status is 'Completed'; trainer level and pay rates are configured |
| **Trigger** | Session marked 'Completed'. |
| **Main Workflow** | 1\. System compares session start time to the trainer's shift schedule 2\. In-shift: pay \= fee × level base rate 3\. Off-shift: pay \= fee × (level base rate \+ off-shift premium) 4\. Pay record is written to the session (rate, shift classification, amount) |
| **Alternative / Exception Flows** | • Session is a no-show or a cancellation-within-window: trainer receives NO pay for that session (BR-PAY006, BR-PAY007) |
| **Business Rules** | PAY001, PAY002, PAY003, PAY004, PAY005, PAY006, PAY007 |
| **Expected Outcome** | Every completed session has a correctly and automatically calculated trainer pay amount, with no manual calculation required. |

 

### **FR-045 — View Earnings Breakdown & Pay-Period Summary**

| Requirement ID | FR-045 |
| :---- | :---- |
| **Module** | L. Trainer Earnings & Payroll |
| **Priority** | Must Have |
| **Description** | The system shall allow a trainer to view a daily earnings breakdown, weekly/monthly summaries, and a full itemised pay-period report (per-session: member, date, type, shift status, rate, amount). |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Trainer has ≥1 completed session |
| **Trigger** | Trainer opens the Earnings tab. |
| **Main Workflow** | 1\. System aggregates completed session pay records for the selected period 2\. System displays subtotals (in-shift, off-shift) and itemised detail |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | PAY008 |
| **Expected Outcome** | Trainer has full transparency into how their pay was calculated. |

 

### **FR-046 — Pay-Period Close & Payroll Report Generation**

| Requirement ID | FR-046 |
| :---- | :---- |
| **Module** | L. Trainer Earnings & Payroll |
| **Priority** | Must Have |
| **Description** | At the end of each configured pay period (weekly or monthly), the system shall sum all completed sessions per trainer, separate in-shift/off-shift totals, and generate a payroll report for Owner review and export. |
| **User / Actor** | System (automated); Gym Owner |
| **Preconditions** | • Pay period end date reached |
| **Trigger** | Scheduled pay-period-end job. |
| **Main Workflow** | 1\. System collects all Completed sessions per trainer within the period (excluding Missed/Cancelled) 2\. System calculates in-shift/off-shift subtotals and gross pay per trainer 3\. Report is made available to the Owner for review/approval and export (CSV/payroll system) |
| **Alternative / Exception Flows** | • Owner raises a discrepancy query: trainer and Owner review the session record together \[dispute-resolution workflow TBD\] |
| **Business Rules** | PAY008 |
| **Expected Outcome** | A finalised, auditable payroll report exists for each pay period. |

 

## **N. Gym Setup & Configuration**

### **FR-049 — Configure Gym Profile**

| Requirement ID | FR-049 |
| :---- | :---- |
| **Module** | N. Gym Setup & Configuration |
| **Priority** | Must Have |
| **Description** | The system shall allow the Owner to configure the gym's profile: name, address, logo, operating hours, and contact details, visible across the member app and system communications. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Owner is authenticated |
| **Trigger** | Owner opens Gym Settings. |
| **Main Workflow** | 1\. Owner enters/edits gym profile fields 2\. System saves and propagates changes to member-facing surfaces |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Gym identity is consistently represented throughout the platform. |

 

### **FR-050 — Create & Manage Membership Plans**

| Requirement ID | FR-050 |
| :---- | :---- |
| **Module** | N. Gym Setup & Configuration |
| **Priority** | Must Have |
| **Description** | The system shall allow the Owner to create, price, activate, and deactivate membership plans, each defined by name, duration, price, and included PT sessions; multiple plans may be active simultaneously. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Owner is authenticated |
| **Trigger** | Owner opens Membership Plan management. |
| **Main Workflow** | 1\. Owner defines a plan (name, duration, price, included sessions) 2\. System saves and activates the plan for member selection at registration/renewal |
| **Alternative / Exception Flows** | • Owner deactivates a plan: existing members on that plan are unaffected; plan is no longer offered to new/renewing members \[confirmation needed\] |
| **Business Rules** | — |
| **Expected Outcome** | Gym's commercial membership offerings are fully configurable without developer involvement. |

 

### **FR-051 — Configure Trainer Pay Rates**

| Requirement ID | FR-051 |
| :---- | :---- |
| **Module** | N. Gym Setup & Configuration |
| **Priority** | Must Have |
| **Description** | The system shall allow the Owner to set Level 1 base rate, Level 2 base rate, and off-shift premium (all percentage-based per source examples), applied automatically and immediately to all future session pay calculations; historical/in-progress sessions retain the rate in effect at their time. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Owner is authenticated |
| **Trigger** | Owner opens Pay Rate settings. |
| **Main Workflow** | 1\. Owner enters/updates Level 1 rate, Level 2 rate, off-shift premium 2\. System saves and applies the new rates to all sessions from that point forward |
| **Alternative / Exception Flows** | • Session already in progress when a rate change is saved: that session retains the rate that was in effect when it started, per OWN-05 flow |
| **Business Rules** | USR001 |
| **Expected Outcome** | Pay-rate changes take effect prospectively without retroactively altering already-calculated pay. |

 

### **FR-052 — Configure Cancellation Policy**

| Requirement ID | FR-052 |
| :---- | :---- |
| **Module** | N. Gym Setup & Configuration |
| **Priority** | Must Have |
| **Description** | The system shall allow the Owner to configure the cancellation window (hours before a session), and toggle no-show/late-cancellation deduction rules on or off; changes apply automatically to all future bookings. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Owner is authenticated |
| **Trigger** | Owner opens Cancellation Policy settings. |
| **Main Workflow** | 1\. Owner sets the cancellation window in hours and toggles deduction rules 2\. System saves and applies the policy to future session bookings |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | PT005 |
| **Expected Outcome** | Cancellation/no-show enforcement (FR-017) reflects the gym's own policy, not a hardcoded default. |

 

### **FR-055 — Add/Edit Trainer Accounts & Assign Level**

| Requirement ID | FR-055 |
| :---- | :---- |
| **Module** | N. Gym Setup & Configuration |
| **Priority** | Must Have |
| **Description** | The system shall allow the Owner to add a trainer account (name, contact, specialisation, level assignment, shift hours, marketplace opt-in) and have credentials issued automatically. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Owner is authenticated |
| **Trigger** | Owner opens 'Add Trainer'. |
| **Main Workflow** | 1\. Owner enters trainer details and assigns Level (1 or 2\) 2\. System creates the trainer account and sends login credentials via SMS/email |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | USR001 |
| **Expected Outcome** | Trainer onboarding is fully self-service for the Owner, no developer/support involvement required. |

 

## **O. Member Management**

### **FR-056 — Register New Member (Admin-Side)**

| Requirement ID | FR-056 |
| :---- | :---- |
| **Module** | O. Member Management |
| **Priority** | Must Have |
| **Description** | Duplicate of FR-001 from the Admin perspective — see FR-001. Included here for module completeness; not a separate implementation. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • See FR-001 |
| **Trigger** | See FR-001 |
| **Main Workflow** | 1\. See FR-001 |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | See FR-001. |

 

### **FR-057 — View Member List & Individual Profiles with Status**

| Requirement ID | FR-057 |
| :---- | :---- |
| **Module** | O. Member Management |
| **Priority** | Must Have |
| **Description** | The system shall allow the Gym Owner to view all members (active, inactive, expired) with status and churn score, and drill into an individual member's full profile (history, attendance, pack balance, trainer, streak). |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Members exist in the system |
| **Trigger** | Gym Owner opens Member Management. |
| **Main Workflow** | 1\. System displays the member list with filters by status 2\. Gym Owner selects a member to view the full profile |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Owner has complete operational visibility over the member base. |

 

### **FR-058 — Suspend/Deactivate Member & Manual Access Override**

| Requirement ID | FR-058 |
| :---- | :---- |
| **Module** | O. Member Management |
| **Priority** | Must Have |
| **Description** | The system shall allow the Gym Owner to suspend or deactivate a member account, and to manually grant or deny access for a specific member overriding the standard biometric decision logic. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Member account exists |
| **Trigger** | Gym Owner selects 'Suspend' or 'Override Access' for a member. |
| **Main Workflow** | 1\. Gym Owner selects the action and confirms 2\. System updates the member's status/access flag and logs the action |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | MEM003, ACC003 |
| **Expected Outcome** | Owner retains ultimate manual control over member access independent of automated rules. |

 

## **P. Trainer Management**

### **FR-060 — Review/Approve Trainer Shift Submissions**

| Requirement ID | FR-060 |
| :---- | :---- |
| **Module** | P. Trainer Management |
| **Priority** | Must Have |
| **Description** | The system shall allow the Owner to review and approve trainer shift-hour submissions before they take effect for off-shift pay calculation. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • A trainer has submitted shift hours |
| **Trigger** | Owner opens Trainer Shift Approvals. |
| **Main Workflow** | 1\. Owner reviews submitted shift hours 2\. Owner approves (rate calculation begins using the new hours) or rejects \[rejection flow TBD\] |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Shift hours used for pay calculation are Owner-verified, not self-certified by trainers alone. |

 

### **FR-061 — Trainer Performance Dashboard**

| Requirement ID | FR-061 |
| :---- | :---- |
| **Module** | P. Trainer Management |
| **Priority** | Should Have |
| **Description** | The system shall display, per trainer, sessions completed, no-show rate, revenue generated, client count, and average rating; and allow viewing/exporting earnings for any period for payroll processing. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Trainer has session history |
| **Trigger** | Owner opens Trainer Performance. |
| **Main Workflow** | 1\. System aggregates and displays per-trainer KPIs for the selected period 2\. Owner exports earnings data as needed |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Owner can evaluate trainer performance and workload objectively. |

 

## **Q. PT Session Oversight**

### **FR-063 — View All Sessions Today (All Trainers, Live Status)**

| Requirement ID | FR-063 |
| :---- | :---- |
| **Module** | Q. PT Session Oversight |
| **Priority** | Must Have |
| **Description** | The system shall display, for the Owner, all sessions for the current day across all trainers with live status (Live/Completed/Scheduled/No-show), and allow drill-down to session detail. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Sessions exist for the current day |
| **Trigger** | Owner opens the Session Log / Live Operations panel. |
| **Main Workflow** | 1\. System retrieves and displays all of today's sessions with real-time status |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Owner has a real-time, gym-wide operational view. |

 

### **FR-064 — Override Session Status (Owner)**

| Requirement ID | FR-064 |
| :---- | :---- |
| **Module** | Q. PT Session Oversight |
| **Priority** | Should Have |
| **Description** | The system shall allow the Owner to override a session's status (mark complete or cancel) on behalf of a trainer or member, e.g. when QR scanning fails. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • A session exists in a status requiring correction |
| **Trigger** | Owner selects 'Override Status' on a session. |
| **Main Workflow** | 1\. Owner selects the corrected status and confirms 2\. System updates the session record and re-runs downstream logic (billing/pay) as appropriate |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Operational exceptions can be corrected without developer/database intervention. |

 

### **FR-065 — No-Show Analytics & Session Log Export**

| Requirement ID | FR-065 |
| :---- | :---- |
| **Module** | Q. PT Session Oversight |
| **Priority** | Should Have |
| **Description** | The system shall display no-show rate analytics broken down by trainer, time slot, and membership type, and allow exporting the session log for any date range. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Sufficient session history exists |
| **Trigger** | Owner opens No-Show Analytics or requests an export. |
| **Main Workflow** | 1\. System aggregates no-show data by the selected dimension 2\. Owner exports the underlying session log if needed |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Owner can identify systemic no-show patterns (trainer, slot, or membership-type related). |

 

## **R. Financial Management**

### **FR-066 — Real-Time Revenue Tracking & Revenue Split by Trainer Level**

| Requirement ID | FR-066 |
| :---- | :---- |
| **Module** | R. Financial Management |
| **Priority** | Must Have |
| **Description** | The system shall display real-time daily/period revenue (total, and split by membership vs. PT session vs. add-ons), and further split PT revenue and pay by trainer level (L1/L2) and off-shift premium totals. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Revenue records exist |
| **Trigger** | Owner opens the Financial/Revenue dashboard. |
| **Main Workflow** | 1\. System aggregates revenue records in real time 2\. Owner views totals and breakdowns by category, trainer level, and shift status |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | FIN001, FIN002, FIN005 |
| **Expected Outcome** | Owner has immediate, granular insight into where revenue and trainer cost are coming from. |

 

### **FR-067 — Expense Logging & Budget vs. Actual Tracking**

| Requirement ID | FR-067 |
| :---- | :---- |
| **Module** | R. Financial Management |
| **Priority** | Must Have |
| **Description** | The system shall allow the Owner to log expenses (amount, category, description, date, recurring flag), set a monthly budget per category, and view budget-vs-actual variance, with an alert when actual spend exceeds budget. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Owner is authenticated |
| **Trigger** | Owner logs an expense or sets a category budget. |
| **Main Workflow** | 1\. Owner enters expense/budget data 2\. System stores the record and recalculates variance 3\. If actual exceeds budget: dashboard alert triggered, variance highlighted |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | FIN004 |
| **Expected Outcome** | Owner can manage and monitor operating costs within the same platform used for revenue. |

 

### **FR-068 — Deferred Revenue & Pack Utilisation Tracking**

| Requirement ID | FR-068 |
| :---- | :---- |
| **Module** | R. Financial Management |
| **Priority** | Should Have |
| **Description** | The system shall track deferred revenue (prepaid session-pack value not yet consumed), recognising revenue as sessions are consumed, and display pack purchase history and utilisation rates. |
| **User / Actor** | System (automated); Gym Owner |
| **Preconditions** | • Session packs have been purchased |
| **Trigger** | Pack purchase and subsequent session consumption events. |
| **Main Workflow** | 1\. On pack purchase: full pack value recorded as deferred revenue (FIN003) 2\. On each session consumption: revenue is recognised proportionally 3\. Owner views pack utilisation and outstanding deferred-revenue reports |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | FIN003 |
| **Expected Outcome** | Financial reporting correctly distinguishes cash collected from revenue earned. |

 

### **FR-069 — P\&L Report Generation & Period Comparison**

| Requirement ID | FR-069 |
| :---- | :---- |
| **Module** | R. Financial Management |
| **Priority** | Must Have |
| **Description** | The system shall generate a Profit & Loss report for any selected date range (revenue minus all categorised expenses, including trainer payroll as a labour expense \= net profit), with period-over-period comparison, either on Owner request or automatically (weekly, via the AI Agent). |
| **User / Actor** | Gym Owner; System (automated/AI) |
| **Preconditions** | • Revenue and expense records exist for the period |
| **Trigger** | Owner requests a P\&L report, or the weekly AI Agent job runs. |
| **Main Workflow** | 1\. System aggregates revenue and expenses (incl. payroll) for the period 2\. P\&L is compiled and rendered with a comparison to the prior period |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | FIN007 |
| **Expected Outcome** | Owner has an accurate, on-demand or automated view of net profitability. |

 

### **FR-070 — Financial Data Export (CSV / Xero / QuickBooks)**

| Requirement ID | FR-070 |
| :---- | :---- |
| **Module** | R. Financial Management |
| **Priority** | Should Have |
| **Description** | The system shall allow the Owner to export financial data for a selected period to CSV, or push it to Xero or QuickBooks via API. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Financial data exists for the selected period |
| **Trigger** | Owner requests an export and selects a destination. |
| **Main Workflow** | 1\. Owner selects CSV, Xero, or QuickBooks 2\. System generates the file or initiates the API push |
| **Alternative / Exception Flows** | • API push fails: error surfaced to Owner; retry offered \[error-handling detail TBD\] |
| **Business Rules** | FIN008 |
| **Expected Outcome** | Financial data can flow into the gym's existing accounting process without manual re-entry. |

 

## **S. Owner Dashboard & Analytics**

### **FR-071 — Live Operations Panel**

| Requirement ID | FR-071 |
| :---- | :---- |
| **Module** | S. Owner Dashboard & Analytics |
| **Priority** | Must Have |
| **Description** | The system shall display, on the Owner Dashboard home view, members currently in the gym, active sessions, and today's revenue so far, updating in real time. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Owner is authenticated |
| **Trigger** | Owner opens the dashboard. |
| **Main Workflow** | 1\. System retrieves and displays live operational counters |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | — |
| **Expected Outcome** | Owner sees an at-a-glance snapshot of the gym's current state. |

 

### **FR-073 — Operational Analytics — Trainer Utilisation, Attendance & Growth**

| Requirement ID | FR-073 |
| :---- | :---- |
| **Module** | S. Owner Dashboard & Analytics |
| **Priority** | Should Have |
| **Description** | The system shall provide reports covering: trainer utilisation (sessions vs. availability/idle hours), member attendance patterns (peak hours, average visits), and new-member growth (sign-ups by month, source attribution). (Onboarding funnel, gamification engagement, and wearable adoption reporting are Phase 2/3 — see FR-086.) |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Underlying data exists for each report |
| **Trigger** | Owner navigates to the relevant analytics panel. |
| **Main Workflow** | 1\. System aggregates and renders the selected report |
| **Alternative / Exception Flows** | • \[TBD\] 'Source attribution' for new-member growth implies a lead-source capture mechanism not otherwise described in source material |
| **Business Rules** | — |
| **Expected Outcome** | Owner has trainer- and attendance-focused operational analytics beyond core financial/session reporting. |

 

## **V. Subscription & Platform**

### **FR-079 — GymOS Subscription Tier Management (Owner-Side)**

| Requirement ID | FR-079 |
| :---- | :---- |
| **Module** | V. Subscription & Platform |
| **Priority** | Must Have |
| **Description** | The system shall allow the Owner to view their current GymOS subscription plan and billing status, upgrade or downgrade tier, and manage billing details/payment method for the GymOS subscription itself. |
| **User / Actor** | Gym Owner |
| **Preconditions** | • Owner has an active or trialling GymOS subscription |
| **Trigger** | Owner opens Subscription settings. |
| **Main Workflow** | 1\. Owner views current tier/status 2\. Owner initiates an upgrade/downgrade or updates billing details |
| **Alternative / Exception Flows** | • Subscription payment fails/lapses: features are gated per tier; Owner is notified; a 7-day grace period applies before access is restricted (BR-USR005) |
| **Business Rules** | USR005 |
| **Expected Outcome** | Gym's access to GymOS features correctly reflects their current subscription standing. |

 

### **FR-080 — Delegated Admin ("Manager") Role Invitation — Deferred**

| Requirement ID | FR-080 |
| :---- | :---- |
| **Module** | V. Subscription & Platform |
| **Priority** | Could Have (Deferred — not in current role model) |
| **Description** | Source material (BR-USR003) documents a delegated "Manager" role with a fixed permission boundary (no billing changes, no pay-rate changes, no financial data export). The current build phase uses only four roles — SuperAdmin, Gym Owner, Personal Trainer, Gym Member (see Section 7\) — and does not include a separate delegated-admin role. This requirement is retained for traceability to BR-USR003 and should be revisited if/when a delegated admin role is reintroduced; it is not required for the current build. |
| **User / Actor** | Gym Owner (would be actor if/when reintroduced) |
| **Preconditions** | • N/A — deferred |
| **Trigger** | N/A — deferred. |
| **Main Workflow** | 1\. Not applicable in the current 4-role model |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | USR003 |
| **Expected Outcome** | No delegated-admin invitation flow exists in the current build; BR-USR003 remains documented for future reference only. |

 

### **FR-081 — System Audit Log & Compliance Data Export**

| Requirement ID | FR-081 |
| :---- | :---- |
| **Module** | V. Subscription & Platform |
| **Priority** | Must Have |
| **Description** | The system shall record every Gym Owner/Admin action (user ID, action type, timestamp, affected record ID) in a system audit log viewable by the Owner, and allow exporting all gym data for compliance or migration purposes. |
| **User / Actor** | Gym Owner; System (automated logging) |
| **Preconditions** | • Administrative actions have occurred |
| **Trigger** | Any Gym Owner/Admin action; or an Owner-initiated export request. |
| **Main Workflow** | 1\. Every qualifying action is automatically logged 2\. Owner views the audit log or requests a full data export |
| **Alternative / Exception Flows** | None specified in source material |
| **Business Rules** | USR004 |
| **Expected Outcome** | Full administrative traceability and data-portability are available to the gym. |

 

## **W. Private Trainer Hire (Phase 1\)**

### **FR-082 — Browse Available Trainers & Send a Hire Request**

| Requirement ID | FR-082 |
| :---- | :---- |
| **Module** | W. Private Trainer Hire (Phase 1\) |
| **Priority** | Must Have |
| **Description** | The system shall allow a member to view a simple list of trainers available at their gym (name, specialisation, level — no public ratings, reviews, or discovery filters, which remain part of the Phase 2 public Trainer Marketplace) and send a direct hire request to a chosen trainer. |
| **User / Actor** | Gym Member |
| **Preconditions** | • Member is logged in and has an active membership • At least one trainer is available at the member's gym |
| **Trigger** | Member opens 'Hire a Trainer' in the Mobile App. |
| **Main Workflow** | 1\. Member views the list of available trainers at their gym 2\. Member selects a trainer and sends a hire request (optionally with a short note on goals) 3\. System notifies the selected trainer of the pending hire request |
| **Alternative / Exception Flows** | • No trainers available at the gym: an empty state is shown \[exact copy TBD\] • \[To Be Confirmed\] Whether a member can have more than one active private trainer at a time, or only one — see Open Questions. |
| **Business Rules** | — |
| **Expected Outcome** | A pending hire request exists, visible to the trainer for acceptance. |

 

### **FR-083 — Accept/Decline a Private Trainer Hire Request**

| Requirement ID | FR-083 |
| :---- | :---- |
| **Module** | W. Private Trainer Hire (Phase 1\) |
| **Priority** | Must Have |
| **Description** | The system shall allow a trainer to accept or decline a private hire request from a member. On acceptance, the system establishes a private trainer-client relationship: the member becomes that trainer's client, and all subsequent session booking (FR-014), workout/meal plan assignment (FR-084/FR-085), and earnings calculation (FR-044) for that member are attributed to this trainer. |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • A pending hire request exists for the trainer (FR-082) |
| **Trigger** | Trainer reviews the hire request in the Web Dashboard or Mobile App. |
| **Main Workflow** | 1\. Trainer reviews the request (member name, any goals note) 2\. Trainer accepts or declines 3\. On acceptance: member is added to the trainer's client list (FR-041); member is notified and can now book sessions with this trainer |
| **Alternative / Exception Flows** | • Trainer declines: member is notified and may send a hire request to a different trainer (FR-082) |
| **Business Rules** | — |
| **Expected Outcome** | A confirmed, private trainer-client relationship exists, or the request is closed as declined. |

 

### **FR-084 — Create & Assign a Workout Plan to a Specific Client**

| Requirement ID | FR-084 |
| :---- | :---- |
| **Module** | W. Private Trainer Hire (Phase 1\) |
| **Priority** | Must Have |
| **Description** | The system shall allow a trainer to create a workout plan (exercises, sets, reps, rest periods, notes) and assign it to one specific client, visible only to that client and kept separate from every other client's plan. This closes a gap in the original source material's Role Function List ("2.4 Plans & Content"), which described this capability narratively but did not carry an explicit functional requirement in the initial SRS draft. |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Client is hired (FR-083) or otherwise assigned to the trainer |
| **Trigger** | Trainer opens the plan builder for a specific client. |
| **Main Workflow** | 1\. Trainer selects the client 2\. Trainer builds the plan (exercises, sets, reps, rest, notes) in the plan builder 3\. Trainer assigns the plan to that client 4\. System makes the plan visible immediately in that client's Mobile App view only (FR-021) |
| **Alternative / Exception Flows** | • Trainer updates/replaces an already-assigned plan for the same client: the new version becomes current; the previous version is retained in the client's plan history |
| **Business Rules** | — |
| **Expected Outcome** | Each client has their own current workout plan, fully separated from other clients' plans, per the trainer's design. |

 

### **FR-085 — Create & Assign a Meal Plan to a Specific Client**

| Requirement ID | FR-085 |
| :---- | :---- |
| **Module** | W. Private Trainer Hire (Phase 1\) |
| **Priority** | Should Have |
| **Description** | The system shall allow a trainer to create a meal plan (daily meals, calorie targets, macros) and assign it to one specific client, kept separate from every other client's meal plan. Closes the same source-material gap as FR-084, for meal plans. |
| **User / Actor** | Personal Trainer |
| **Preconditions** | • Client is hired (FR-083) or otherwise assigned to the trainer |
| **Trigger** | Trainer opens the meal plan builder for a specific client. |
| **Main Workflow** | 1\. Trainer selects the client 2\. Trainer builds the meal plan (meals, calories, macros) 3\. Trainer assigns the plan to that client 4\. System makes the plan visible immediately in that client's Mobile App view only (FR-022) |
| **Alternative / Exception Flows** | • Trainer updates/replaces an already-assigned meal plan for the same client: the new version becomes current; the previous version is retained in the client's plan history |
| **Business Rules** | — |
| **Expected Outcome** | Each client has their own current meal plan, fully separated from other clients' meal plans. |

 

# **10\. User Stories (Phase 1\)**

19 of the full SRS's 27 user stories apply to Phase 1\.

### **US-001**

| User Story | As a Member, I want to register and receive login credentials automatically, so that I can start using the app immediately after signing up at the gym. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • Given a valid registration form is submitted with payment collected, a member account and active membership are created • Login credentials are sent via SMS/email within the same session • The 30-day onboarding journey begins automatically without further staff action |

 

### **US-003**

| User Story | As a Member, I want to book a PT session against my trainer's availability, so that I can schedule training around my own timetable. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • Booking is only permitted when my session-pack balance is greater than zero • Booking is rejected with alternative slots suggested if the trainer is unavailable at that time • I receive confirmation, and 24-hour and 1-hour reminders are scheduled automatically |

 

### **US-004**

| User Story | As a Member, I want to start and end my PT session by scanning a QR code, so that my attendance and billing are recorded accurately without staff intervention. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • Scanning the start QR sets the session to Active and starts a timer • The end QR is rejected if less than the minimum session duration has elapsed • On a valid end scan, the session is marked Completed and one pack session is deducted automatically |

 

### **US-005**

| User Story | As a Member, I want to be notified before my session and warned if I risk losing a session for cancelling late, so that I understand and can avoid pack deductions. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • 24-hour and 1-hour reminders are sent automatically before a scheduled session • Cancelling within the configured policy window deducts one pack session and logs the reason • Not attending with no cancellation is marked as a no-show and deducts one pack session |

 

### **US-006**

| User Story | As a Member, I want to purchase or renew my session pack or membership from within the app, so that I never have to visit the front desk just to pay. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • Available packs/plans and prices are shown before checkout • A successful payment immediately updates my balance/membership and issues a receipt • A failed payment shows an error and allows retry without creating a pack/membership record |

 

### **US-007**

| User Story | As a Member, I want to view the workout and meal plan my trainer assigned, so that I know exactly what to do at the gym and what to eat. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • The current active workout plan and meal plan are visible on the home/plan screen • Historical plans remain accessible with their assignment dates • Newly assigned plans appear immediately without requiring an app update |

 

### **US-011**

| User Story | As a Trainer, I want my daily schedule and any live session shown clearly, so that I always know what's happening now and what's next. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • All of today's sessions are listed with member, time, type, and status • A session that has been QR-started is shown as Live with an elapsed timer • I am notified the moment a client's start/end QR scan is registered |

 

### **US-012**

| User Story | As a Trainer, I want the system to automatically apply my correct pay rate for every session, so that I don't have to calculate in-shift vs off-shift pay myself. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • A session inside my shift hours is paid at my level's base rate • A session outside my shift hours is paid at base rate plus off-shift premium • No-show and within-window-cancelled sessions generate no pay for me |

 

### **US-013**

| User Story | As a Trainer, I want to see my full earnings breakdown for any pay period, so that I can verify my pay before it is processed. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • Every completed session is itemised with date, client, type, shift status, rate, and amount • In-shift and off-shift subtotals are shown separately • A full pay-period report is available at period close |

 

### **US-014**

| User Story | As a Trainer, I want to build and assign workout and meal plans to my clients, so that they always know what to do without me sending screenshots over WhatsApp. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • I can create a plan with exercises, sets, reps, rest periods, and notes • Assigning the plan makes it visible in the client's app immediately • If AI Coach is enabled for that client, the new plan updates the AI's context |

 

### **US-015**

| User Story | As a Trainer, I want to see a client's full history and wearable-derived recovery data in one place, so that I can adjust their programme appropriately. |
| :---- | :---- |
| **Priority** | Should Have |
| **Acceptance Criteria** | • Client profile shows session history, pack balance, streak, churn score, and previous plans • Where a wearable is connected, recovery score, resting heart rate trend, HRV, and sleep score are shown • I receive an overtraining alert if the client shows 3+ consecutive days of high fatigue |

 

### **US-017**

| User Story | As a Gym Owner, I want a live dashboard showing who's in the gym, active sessions, and today's revenue, so that I can monitor operations at a glance. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • The dashboard shows current occupancy, active session count, and today's revenue in real time • All of today's sessions are listed with status and shift classification • The view refreshes without requiring a manual reload \[refresh mechanism TBD\] |

 

### **US-018**

| User Story | As a Gym Owner, I want to configure membership plans, pay rates, and cancellation policy myself, so that I don't need developer involvement to run my business. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • I can create/edit/deactivate membership plans with price and included sessions • I can set Level 1/Level 2 base rates and the off-shift premium, effective immediately for future sessions • I can set the cancellation window and toggle no-show/late-cancel deduction rules |

 

### **US-019**

| User Story | As a Gym Owner, I want to register new members and enrol their biometrics, so that they can start using the gym the same day. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • Registration creates an active membership immediately after payment is collected • The member is guided to biometric enrolment at the kiosk • App credentials are sent automatically and the onboarding journey begins |

 

### **US-020**

| User Story | As a Gym Owner, I want a complete financial picture (P\&L, revenue split, expenses, payroll), so that I understand exactly how the business is performing. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • I can generate a P\&L for any date range including trainer payroll as a labour cost • Revenue is split by membership vs. PT vs. add-ons, and further by trainer level and shift status • I can export the data to CSV, Xero, or QuickBooks |

 

### **US-023**

| User Story | As SuperAdmin, I want full access across every gym on the platform, so that I can support, configure, or troubleshoot any tenant without being blocked by tenant-level restrictions. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • I can view and act on any gym's data using the same functions a Gym Owner has, for any tenant • I can perform platform-level configuration not tied to a single gym • No gym-level restriction applied to a Gym Owner also applies to me |

 

### **US-025**

| User Story | As a Gym Member or Personal Trainer, I want to log in with a username and password, so that I can access my account without any biometric hardware being required. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • I can log in using my username (or email) and password • An incorrect password shows an error and lets me retry • No biometric enrolment or hardware is required to use the app in Phase 1 |

 

### **US-026**

| User Story | As a Gym Member, I want to hire a personal trainer directly, so that I can start training with someone dedicated to my goals without browsing a public marketplace. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • I can view a simple list of trainers available at my gym • I can send a hire request to a chosen trainer • I am notified when the trainer accepts or declines my request |

 

### **US-027**

| User Story | As a Personal Trainer, I want to create and assign workout and meal plans to each of my hired clients separately, so that every client gets a plan tailored to them without mixing up with other clients. |
| :---- | :---- |
| **Priority** | Must Have |
| **Acceptance Criteria** | • I can build a workout or meal plan and assign it to one specific client • That plan is visible only to the client it was assigned to • Updating one client's plan does not affect any other client's plan |

 

# **11\. Use Cases (Phase 1\)**

10 of the full SRS's 16 use cases apply to Phase 1\.

### **UC-01 — Member Registration & Biometric Enrolment**

| Actor(s) | Gym Owner (primary), Member (secondary) |
| :---- | :---- |
| **Goal** | Create a new member account with an active membership and enrolled biometric credential. |
| **Preconditions** | • A membership plan is configured • Payment method is available at the front desk |
| **Main Flow** | 1\. Admin opens the registration form and enters member details and plan selection 2\. Admin collects payment 3\. System creates the member account and activates the membership 4\. Member is directed to the biometric kiosk and completes a face/fingerprint scan 5\. System stores the biometric token against the member ID 6\. Member receives app credentials by SMS/email and logs in 7\. System automatically triggers the Day-1 onboarding message |
| **Alternative Flow** | • Biometric enrolment fails on first attempt: member re-attempts up to 3 times before escalating to admin (MEM-01) |
| **Exception Flow** | • Payment fails: registration halts before account activation; admin may retry payment or abandon the registration |
| **Postconditions** | • A member account exists with active membership, enrolled biometric, and app access. |

 

### **UC-03 — PT Session Booking**

| Actor(s) | Member / Trainer / Admin |
| :---- | :---- |
| **Goal** | Create a confirmed, scheduled PT session against a trainer's availability. |
| **Preconditions** | • Member holds a session pack with a positive balance • Trainer's schedule is accessible |
| **Main Flow** | 1\. User selects member, trainer, date, time, and session type 2\. System validates pack balance and trainer availability 3\. Session record is created with status Scheduled 4\. Both parties are notified; 24-hour and 1-hour reminders are queued |
| **Alternative Flow** | • Trainer is unavailable at the requested time: alternative slots are suggested |
| **Exception Flow** | • Pack balance is zero: booking is blocked and the member is prompted to purchase a new pack |
| **Postconditions** | • A Scheduled session record exists with reminders queued. |

 

### **UC-04 — PT Session Lifecycle (QR Start–End & Billing)**

| Actor(s) | Member, Personal Trainer |
| :---- | :---- |
| **Goal** | Execute and correctly bill a scheduled PT session. |
| **Preconditions** | • Session status is Scheduled and the scheduled time has arrived |
| **Main Flow** | 1\. Member scans the start QR; system validates the match and sets status to Active, starting a timer 2\. Trainer is notified and conducts the session, optionally logging live notes 3\. Member scans the end QR after the minimum duration threshold has elapsed 4\. System sets status to Completed, deducts one pack session, records revenue, and sends a session summary |
| **Alternative Flow** | • Trainer marks the session complete manually if QR scanning is unavailable |
| **Exception Flow** | • Start QR does not match the booked session: scan rejected, incident logged • End QR scanned before minimum duration: scan rejected with an on-screen message • No start scan occurs by the scheduled time: session auto-marked Missed, pack deducted, no-show flagged |
| **Postconditions** | • Session is Completed (or Missed/Cancelled) with billing, pack balance, and trainer pay all updated consistently. |

 

### **UC-05 — Session Pack / Membership Purchase**

| Actor(s) | Member |
| :---- | :---- |
| **Goal** | Purchase or renew a session pack or membership via an integrated payment gateway. |
| **Preconditions** | • Member is logged in • Gym has configured available packs/plans and pricing |
| **Main Flow** | 1\. Member selects a pack/plan and proceeds to checkout 2\. Payment gateway processes the transaction 3\. On success, the system creates/extends the relevant record, updates balance/status, and issues a confirmation/receipt |
| **Alternative Flow** | • Purchase is member-initiated voluntarily rather than triggered by a low-balance alert |
| **Exception Flow** | • Payment fails: an error is shown and the member may retry; no record is created on failure |
| **Postconditions** | • Member's pack balance or membership status reflects the successful purchase; deferred revenue is recorded where applicable. |

 

### **UC-06 — Trainer Client Plan Assignment**

| Actor(s) | Personal Trainer |
| :---- | :---- |
| **Goal** | Create and assign a workout and/or meal plan to a client. |
| **Preconditions** | • Trainer has an assigned client |
| **Main Flow** | 1\. Trainer opens the client's profile and the plan builder 2\. Trainer adds exercises/meals, sets targets, and saves the plan 3\. Trainer assigns the plan to the client 4\. System makes the plan immediately visible in the client's app and updates AI Coach context if enabled |
| **Alternative Flow** | • Trainer also creates a meal plan in the same session, repeating the plan-builder steps |
| **Exception Flow** | • \[TBD\] No explicit error path is defined in source material for invalid plan data (e.g., missing required fields) |
| **Postconditions** | • Client's active plan(s) are updated and visible in their app. |

 

### **UC-10 — Automated Trainer Pay Calculation & Payroll Close**

| Actor(s) | System (automated), Gym Owner, Personal Trainer |
| :---- | :---- |
| **Goal** | Calculate and finalise trainer pay for each session and each pay period. |
| **Preconditions** | • Trainer pay rates (Level 1/2 base, off-shift premium) are configured |
| **Main Flow** | 1\. On session completion, system determines in-shift vs. off-shift status against the trainer's shift schedule 2\. System calculates pay \= fee × applicable rate and stores it against the session 3\. At pay-period end, system totals all completed sessions per trainer, separating in-shift/off-shift subtotals 4\. Owner reviews and approves the payroll report for external payment processing |
| **Alternative Flow** | • Owner disputes a figure: trainer and Owner jointly review the underlying session record \[dispute workflow TBD\] |
| **Exception Flow** | • Session is a no-show or a within-window cancellation: no trainer pay is generated for that session |
| **Postconditions** | • An itemised, auditable payroll report exists for the closed pay period. |

 

### **UC-11 — Financial Reporting & Export**

| Actor(s) | Gym Owner |
| :---- | :---- |
| **Goal** | Generate and, if needed, export a financial report for a selected period. |
| **Preconditions** | • Revenue and expense records exist for the requested period |
| **Main Flow** | 1\. Owner selects a date range and report type (P\&L, revenue breakdown, expense summary, payroll, session log) 2\. System aggregates revenue, expenses, and payroll for the period 3\. Report (including net profit and period-over-period comparison) is rendered in the dashboard 4\. Owner optionally exports to CSV, Xero, or QuickBooks |
| **Alternative Flow** | • Owner reviews on-screen only, without exporting |
| **Exception Flow** | • Export/API push fails: error is surfaced to the Owner \[retry mechanism TBD\] |
| **Postconditions** | • A financial report is available on-screen and/or exported to the selected destination. |

 

### **UC-12 — Gym Configuration & Trainer Onboarding (Owner)**

| Actor(s) | Gym Owner |
| :---- | :---- |
| **Goal** | Configure the gym and add trainer accounts so the gym is fully operational on GymOS. |
| **Preconditions** | • Owner has an active GymOS subscription |
| **Main Flow** | 1\. Owner configures the gym profile, membership plans, trainer pay rates, and cancellation policy 2\. Owner adds trainer accounts, assigning level and shift hours 3\. System issues trainer login credentials automatically 4\. Owner configures gamification and re-engagement templates |
| **Alternative Flow** | • Configuration is revisited later to adjust rates/policies — new values apply prospectively only |
| **Exception Flow** | • \[TBD\] No explicit validation-failure path documented for configuration forms |
| **Postconditions** | • Gym is fully configured and trainers have system access. |

 

### **UC-15 — GymOS Subscription Lapse & Grace Period**

| Actor(s) | Gym Owner, System (automated) |
| :---- | :---- |
| **Goal** | Handle a failed or lapsed GymOS subscription payment without abrupt service loss. |
| **Preconditions** | • Gym has an active GymOS subscription |
| **Main Flow** | 1\. Subscription payment fails or lapses 2\. System gates features according to the gym's tier 3\. Owner is notified 4\. A 7-day grace period is applied before access is further restricted |
| **Alternative Flow** | • Owner resolves billing within the grace period: full access is restored |
| **Exception Flow** | • Owner does not resolve billing within 7 days: \[TBD\] exact post-grace-period restriction scope is not detailed in source material |
| **Postconditions** | • Gym's feature access accurately reflects current subscription/payment status. |

 

### **UC-16 — Private Trainer Hire (Phase 1\)**

| Actor(s) | Gym Member, Personal Trainer |
| :---- | :---- |
| **Goal** | Establish a private trainer-client relationship so the member can begin PT sessions with a specific trainer. |
| **Preconditions** | • Member has an active membership and is logged in • At least one trainer is available at the member's gym |
| **Main Flow** | 1\. Member browses the simple list of available trainers at their gym (FR-082) 2\. Member selects a trainer and sends a hire request, optionally with a goals note 3\. Trainer reviews and accepts the request (FR-083) 4\. Member is added to the trainer's client list and notified 5\. Member can now book PT sessions with this trainer (FR-014); trainer can now assign this client workout/meal plans (FR-084/FR-085) |
| **Alternative Flow** | • Trainer declines: member is notified and may send a hire request to a different trainer |
| **Exception Flow** | • No trainers available at the gym: empty state shown, no hire possible • \[To Be Confirmed\] Whether a member may hire more than one trainer at a time — see Open Questions Q-15 |
| **Postconditions** | • A private trainer-client relationship exists, with all subsequent sessions, plans, and pay attributed to that specific pairing. |

 

# **12\. Business Rules (Phase 1\)**

Rules are transcribed directly from the GymOS Business Rules & Logic document (v2.0), filtered to the Phase 1 subset. BR-XXX IDs are preserved from the full SRS for cross-document traceability.

## **1\. Membership & Access Rules**

| BR ID | Source Ref | Rule | Condition | Outcome / Action |
| :---- | :---- | :---- | :---- | :---- |
| BR-006 | MEM006 | Membership expiry alert | 30 days before membership expiry date | Push notification sent to member; renewal prompt shown in app |
| BR-007 | MEM007 | Membership auto-suspension | Membership reaches expiry date with no renewal | Member status set to Expired; biometric access blocked until renewed |

 

## **2\. PT Session Rules**

| BR ID | Source Ref | Rule | Condition | Outcome / Action |
| :---- | :---- | :---- | :---- | :---- |
| BR-008 | PT001 | Session start via QR | Member scans session QR code | Session status set to Active, timer starts, trainer notified, timestamp recorded |
| BR-009 | PT002 | QR validation — wrong member | Member scans QR not linked to their booked session | Scan rejected, error message shown, incident logged |
| BR-010 | PT003 | Minimum session duration | QR end-scan attempted before minimum time threshold (default 20 min) | End-scan rejected with message: minimum session duration not reached |
| BR-011 | PT004 | Session end via QR | Member scans end QR after minimum time | Session status set to Completed, timestamp recorded, billing triggered |
| BR-012 | PT005 | Late cancellation | Member cancels session within cancellation window (e.g. under 24h) | 1 session automatically deducted from pack, cancellation reason logged |
| BR-013 | PT006 | No-show | Session time passes with no QR start scan | Session marked as Missed, 1 session deducted from pack, no-show flag set on client record |
| BR-014 | PT007 | Pack balance zero | Last session in pack used | Pack status set to Exhausted, renewal prompt sent to member, trainer alerted |
| BR-015 | PT008 | Pack expiry | Session pack reaches expiry date with unused sessions | Remaining sessions expire, owner notified of pack wastage, renewal prompt sent |
| BR-016 | PT009 | Session reminder — 24h | 24 hours before a scheduled session | Push notification and/or SMS sent to member |
| BR-017 | PT010 | Session reminder — 1h | 1 hour before a scheduled session | Push notification sent to member |
| BR-018 | PT011 | Booking with insufficient pack | Member attempts to book when pack balance is 0 | Booking blocked, message shown to purchase a new pack first |

 

## **6\. Trainer Pay Rate Rules**

| BR ID | Source Ref | Rule | Condition | Outcome / Action |
| :---- | :---- | :---- | :---- | :---- |
| BR-041 | PAY001 | Level 1 in-shift rate | Trainer is Level 1 AND session falls within scheduled shift hours | Pay \= Session fee × Level 1 base rate (configurable, default \[TBD\]) |
| BR-042 | PAY002 | Level 2 in-shift rate | Trainer is Level 2 AND session falls within scheduled shift hours | Pay \= Session fee × Level 2 base rate (configurable, default \[TBD\]) |
| BR-043 | PAY003 | Level 1 off-shift rate | Trainer is Level 1 AND session falls OUTSIDE scheduled shift hours | Pay \= Session fee × (Level 1 base rate \+ off-shift premium); premium configurable, default \[TBD\] |
| BR-044 | PAY004 | Level 2 off-shift rate | Trainer is Level 2 AND session falls OUTSIDE scheduled shift hours | Pay \= Session fee × (Level 2 base rate \+ off-shift premium) |
| BR-045 | PAY005 | Off-shift determination | Session start time compared to trainer's scheduled shift start/end | If session start time is before shift start OR after shift end: session classified as Off-shift |
| BR-046 | PAY006 | No-show — no trainer pay | Session marked as Missed (client no-show) | Trainer receives NO pay for this session; client pack is deducted |
| BR-047 | PAY007 | Cancelled within window — no pay | Session cancelled by client within cancellation window | Trainer receives NO pay; client pack is deducted |
| BR-048 | PAY008 | Pay period calculation | End of configured pay period (weekly or monthly) | All completed sessions summed; in-shift and off-shift totalled separately; payroll report generated |

 

## **7\. Trainer Session & Scheduling Rules**

| BR ID | Source Ref | Rule | Condition | Outcome / Action |
| :---- | :---- | :---- | :---- | :---- |
| BR-049 | TRN001 | Double-booking prevention | Trainer attempts to book a session that overlaps with an existing booking | Booking rejected; conflict shown; alternative slots suggested |
| BR-050 | TRN002 | Session notes deadline | Session completed more than 24 hours ago with no notes added | Trainer receives a reminder notification to add session notes |
| BR-051 | TRN003 | No-show logging | Session start time passes with no QR scan by member | Session auto-marked as Missed; trainer notified; client no-show counter incremented |
| BR-052 | TRN004 | Client no-show threshold | Client accumulates N no-shows within a rolling period (configurable) | Owner alert triggered; client flagged in retention dashboard |
| BR-053 | TRN005 | Cancellation by trainer | Trainer cancels a session | Member notified immediately; session removed from schedule; owner notified if within 24h of session time |

 

## **9\. Financial Rules**

| BR ID | Source Ref | Rule | Condition | Outcome / Action |
| :---- | :---- | :---- | :---- | :---- |
| BR-062 | FIN001 | Revenue recording — session | Session status set to Completed | Revenue record created: amount \= session fee, category \= PT Session, linked to session ID and trainer ID |
| BR-063 | FIN002 | Revenue recording — membership | Membership payment processed | Revenue record created: amount \= membership price, category \= Membership, linked to member ID |
| BR-064 | FIN003 | Deferred revenue | Session pack purchased by member | Full pack value recorded as deferred revenue; revenue recognised per session as sessions are consumed |
| BR-065 | FIN004 | Expense budget alert | Actual spend in a category exceeds monthly budget | Owner alert triggered in dashboard; variance highlighted in red on expense report |
| BR-066 | FIN005 | Off-shift payroll flag | Any off-shift session included in pay period | Off-shift sessions flagged separately in payroll report with premium amount itemised |
| BR-068 | FIN007 | P\&L report generation | Owner requests P\&L for a date range OR AI agent runs weekly | Revenue minus all categorised expenses equals net profit; trainer payroll included as labour expense |
| BR-069 | FIN008 | Export trigger | Owner requests data export | All financial records for selected period exported to CSV or pushed to Xero/QuickBooks via API |

 

## **12\. User & Role Management Rules**

| BR ID | Source Ref | Rule | Condition | Outcome / Action |
| :---- | :---- | :---- | :---- | :---- |
| BR-083 | USR001 | Trainer level assignment | Owner assigns or changes trainer level | Pay rate updated immediately for all future sessions; historical sessions retain original rate at time of session |
| BR-084 | USR002 | Trainer deactivation | Owner deactivates a trainer account | All future sessions reassigned or cancelled; trainer profile hidden from marketplace; historical data retained |
| BR-085 | USR003 | Manager role creation | Owner invites a manager user | Manager has full operational access except: cannot change billing details, cannot change trainer pay rates, cannot export financial data |
| BR-086 | USR004 | Audit log | Any admin or owner action performed | Action recorded in system audit log with: user ID, action type, timestamp, affected record ID |
| BR-087 | USR005 | GymOS subscription gate | Gym's subscription payment fails or lapses | Features gated according to tier; owner notified; grace period of 7 days before access restricted |

 

# **13\. Process Workflows (Phase 1\)**

Workflows are the Phase 1 subset of the full SRS's workflow set. MEM-01 (registration) and OWN-05 (gym configuration) have been adapted here to remove biometric-enrolment and Phase 2 configuration steps present in the full SRS's verbatim source transcription. MEM-11 (Private Trainer Hire) is new — it does not exist in the original source documents.

### **MEM-01 — Member Registration (Username/Password)  (Actor: Member \+ Admin)**

| Flow | START: New member arrives at gym 1\. Owner (or SuperAdmin) opens registration form; enters name, contact, email, DOB, emergency contact, plan selection 2\. Owner selects plan and collects payment DECISION: Payment successful? → YES: proceed to account creation | NO: show payment error, retry or abandon 3\. Member account created; membership activated; username/password credentials generated and sent via SMS/email 4\. Member installs the Mobile App and logs in with username/password END: Registration complete — member active and app-connected. (Phase 3 will insert a biometric enrolment step here — see the Phase 3 SRS.) |
| :---- | :---- |

 

### **MEM-03 — PT Session Booking  (Actor: Member \+ Trainer)**

| Flow | START: Session to be booked (by trainer, admin, or member interest request) 1\. Trainer/admin selects member, date, time, session type DECISION: Pack balance available? → NO: booking blocked, pack purchase flow prompted | YES: continue DECISION: Trainer available at selected time? → NO: alternative slots suggested | YES: continue 2\. Session record created, status Scheduled, linked to trainer/member/date/fee AUTO: Notifications sent to both parties; 24h and 1h reminders queued END: Booking complete — session in Scheduled status |
| :---- | :---- |

 

### **MEM-04 — PT Session Lifecycle — QR Start to End  (Actor: Member \+ Trainer)**

| Flow | START: Scheduled session time approached; 1h reminder sent 1\. Member arrives, opens app, scans START QR code DECISION: QR valid (member matches booked session)? → NO: scan rejected, error shown, incident logged | YES: continue 2\. Session status set to ACTIVE; timer starts; trainer notified 3\. Session in progress — trainer logs notes; wearable data recording if connected 4\. Member scans END QR code DECISION: Minimum duration met (default 20 min)? → NO: end scan rejected, message shown | YES: continue 5\. Session status set to COMPLETED; billing triggered automatically (pack deducted, revenue recorded, summary sent) DECISION: Pack balance now ≤2? → YES: pack renewal alert triggered | NO: no further action END: Session lifecycle complete |
| :---- | :---- |

 

### **MEM-05 — Late Cancellation & No-Show  (Actor: Member \+ System)**

| Flow | START: Session is scheduled DECISION: Member cancels? → YES: check cancellation window   DECISION: Within policy window (late)? → YES: 1 session deducted, reason logged, trainer/owner notified | NO: on-time cancel (no deduction — Assumption) PARALLEL PATH: Member does not show at session time DECISION: Has START QR been scanned by session time? → NO: no-show detected 1\. Session auto-marked MISSED; no-show flag set; timestamp logged 2\. 1 session deducted from pack; revenue record created (fee still counted); member notified AUTO: Trainer notified; no-show added to client history DECISION: Client no-show count exceeds configurable threshold? → YES: owner alert triggered, client flagged | NO: no further action END: No-show / cancellation flow complete |
| :---- | :---- |

 

### **MEM-06 — Session Pack Purchase & Renewal  (Actor: Member)**

| Flow | START: Pack alert triggered (≤2 sessions remaining) OR member initiates purchase 1\. Pack renewal prompt shown with available pack sizes/prices 2\. Member selects pack and proceeds to checkout 3\. Payment processed (Stripe / PayHere — per source) DECISION: Payment successful? → NO: error shown, retry offered, no pack created | YES: continue 4\. New session pack record created: member ID, trainer ID, total sessions, sessions used \= 0, purchase date, expiry date AUTO: Balance updated in app; confirmation sent; deferred revenue recorded in owner financials END: Pack purchase complete |
| :---- | :---- |

 

### **MEM-11 — Private Trainer Hire  (Actor: Member \+ Trainer)**

| Flow | START: Member wants to begin training with a specific trainer 1\. Member opens 'Hire a Trainer' in the Mobile App and browses the simple list of trainers at their gym (FR-082) 2\. Member selects a trainer and sends a hire request, optionally with a short goals note 3\. Trainer reviews the request in the Web Dashboard or Mobile App (FR-083) DECISION: Trainer accepts? → NO: member notified, may request a different trainer | YES: continue 4\. Member is added to the trainer's client list; both parties notified AUTO: Member can now book PT sessions with this trainer (see MEM-03); trainer can now assign this client workout/meal plans (FR-084/FR-085) END: Private trainer-client relationship established |
| :---- | :---- |

 

### **TRN-01 — Trainer Daily Session Flow  (Actor: Trainer)**

| Flow | START: Trainer logs in at start of shift 1\. Today's session schedule loaded (member, time, type, status) AUTO: Member scans START QR → notification pushed to trainer 3\. Trainer conducts session on the floor, adding live notes 4\. Member scans END QR → session status Completed, end timestamp recorded 5\. Trainer adds session notes (exercises, observations, next steps) 6\. Earnings record updated (fee × applicable rate, in-shift/off-shift, running daily total) DECISION: More sessions today? → YES: loop to step 2 | NO: end of daily flow END: Daily session flow complete |
| :---- | :---- |

 

### **TRN-02 — Off-Shift Session Detection & Pay Calculation  (Actor: Trainer \+ System)**

| Flow | TRIGGER: Session QR start scan received 1\. System retrieves trainer's scheduled shift for today DECISION: Session start time within shift? → YES: IN-SHIFT rate (fee × level base rate) | NO: OFF-SHIFT rate (fee × (level base rate \+ off-shift premium)) 2\. Pay record written to session (session ID, trainer ID, level, shift status, base rate, premium if applicable, total pay) 3\. Session appears in trainer earnings breakdown, in-shift/off-shift subtotals shown separately END: Pay calculation complete — stored against session record |
| :---- | :---- |

 

### **TRN-03 — Client Plan Assignment Flow  (Actor: Trainer)**

| Flow | START: Trainer decides to assign or update a plan (new client, periodic update, client request) 1\. Trainer opens client profile (history, wearable summary, previous plans, pack balance, churn score) 2\. Trainer opens plan builder; selects Workout Plan or Meal Plan 3\. Trainer builds the plan (exercises/meals, sets/macros, rest/calories, notes); titles and dates it 4\. Trainer assigns plan to client; effective date set AUTO: Plan visible in member app immediately; member notified DECISION: AI coach enabled for this client? → YES: AI coach context updated with new plan | NO: no AI update DECISION: Trainer also wants a meal plan? → YES: repeat steps 3-5 | NO: assignment complete END: Plan assignment complete |
| :---- | :---- |

 

### **TRN-05 — Pay Period & Earnings Calculation  (Actor: Trainer \+ System)**

| Flow | TRIGGER: End of pay period reached (weekly or monthly, gym-configured) 1\. System collects all Completed sessions for the trainer in the period (excludes Missed, Cancelled) 2\. Each session's stored pay (from TRN-02) is totalled: in-shift and off-shift subtotals, premium itemised 3\. Pay period summary generated (trainer, level, period dates, session count, subtotals, gross pay) 4\. Payroll report visible to trainer in portal (itemised, per-session) AUTO: Payroll report exported to owner dashboard; CSV/payroll-system export available DECISION: Owner approves payroll report? → YES: payment processed externally, period closed | NO: discrepancy flagged, trainer/owner review session record END: Pay period closed |
| :---- | :---- |

 

### **OWN-01 — Owner Dashboard Daily Review  (Actor: Gym Owner)**

| Flow | START: Owner opens dashboard 1\. Live operations panel loads (members in gym, active sessions, today's revenue) 2\. Session log reviewed (status, trainer, member, time, shift classification, pay rate) 3\. Pack expiry alerts reviewed (members with 1-2 sessions left; one-tap renewal prompt) 4\. Retention engine panel reviewed (at-risk/lapsed members, churn scores, recommended actions) 5\. Trainer performance cards reviewed (sessions vs target, no-shows, earnings, off-shift flagged) 6\. AI agent alerts reviewed (anomalies, revenue gaps, pricing recommendations) 7\. Revenue split panel reviewed (Level 1 vs Level 2, off-shift premium totals, net profit today) END: Daily review complete — owner takes actions as needed |
| :---- | :---- |

 

### **OWN-02 — Financial Reporting & Export  (Actor: Gym Owner)**

| Flow | START: Owner selects date range and report type (P\&L / revenue breakdown / expense summary / trainer payroll / session log) 1\. System aggregates revenue records for the period (membership \+ PT \+ other income, by category) 2\. System aggregates expense records (grouped by category; budget vs actual variance calculated) 3\. Trainer payroll calculated for the period (level rate \+ shift status; in-shift/off-shift separated per trainer) 4\. P\&L compiled (Revenue − Expenses incl. payroll \= Net Profit; period-over-period comparison added) 5\. Report rendered in dashboard (revenue chart, expense breakdown, payroll summary, net profit, key ratios) DECISION: Owner wants to export? → NO: review in dashboard, end | YES: continue 6\. Export format selected: CSV download OR Xero API push OR QuickBooks API push 7\. Export generated and delivered END: Reporting complete |
| :---- | :---- |

 

### **OWN-05 — Gym Configuration & Trainer Setup  (Actor: Gym Owner / Admin)**

| Flow | START: New gym onboarding OR configuration change required 1\. Owner configures gym profile (name, address, logo, hours, contact details) 2\. Owner creates membership plans (name, duration, price, included PT sessions); multiple plans can be active simultaneously 3\. Owner sets trainer pay rates (Level 1 base %, Level 2 base %, off-shift premium %) — applied to all future session calculations immediately DECISION: Any existing sessions in progress when rate is changed? → In-progress sessions retain original rate; new rate applies from next session 4\. Owner configures cancellation policy (window in hours, no-show/late-cancel deduction toggles) 5\. Owner adds trainer accounts (name, contact, specialisation, level, shift hours) AUTO: Trainer credentials issued via email/SMS; Web Dashboard and Mobile App access granted at assigned level END: Configuration complete — gym is operational for Phase 1\. (Gamification settings and re-engagement templates are configured here in Phase 2 — see the Phase 2 SRS.) |
| :---- | :---- |

 

# **14\. UI/UX Requirements (Phase 1\)**

27 of the full SRS's 31 screens apply to Phase 1\. No visual design is specified — only functional requirements per screen.

### **SCR-01 — Login / Authentication**

| Purpose | Authenticate a user (Member, Trainer, Gym Owner, SuperAdmin) into the appropriate app (Web Dashboard or Mobile App) via username/password. Phase 1 only — no biometric login option. |
| :---- | :---- |
| **Users Who Can Access** | All roles |
| **Required Fields** | Username (or email), password |
| **Buttons / Actions** | Log in; \[TBD\] Forgot password |
| **Validation Rules** | \[TBD — not specified in source\] |
| **Error Messages** | \[TBD\] |
| **Success Messages** | Redirect to role-appropriate home screen |
| **Navigation Behaviour** | Entry point of the Web Dashboard / Mobile App |
| **Permissions / Visibility** | Public (unauthenticated) |

 

### **SCR-02 — Member Registration Form (Admin-side)**

| Purpose | Capture new member details and membership selection. Phase 1: creates a username/password account — no biometric enrolment step (see SCR-03, Phase 3). |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner |
| **Required Fields** | Full name, phone number, email, date of birth, emergency contact, membership plan selection, payment, username/password (or auto-generated credentials) |
| **Buttons / Actions** | Submit registration; Cancel |
| **Validation Rules** | \[TBD — required-field and format rules not specified\] |
| **Error Messages** | Payment failure message (retry/abandon per MEM-01) |
| **Success Messages** | Member account created confirmation |
| **Navigation Behaviour** | → Member Home (Phase 1); → Biometric Enrolment screen (Phase 3, SCR-03) |
| **Permissions / Visibility** | Admin roles only |

 

### **SCR-04 — Member Home / Dashboard**

| Purpose | Central hub showing membership status, pack balance, upcoming sessions, and quick actions. |
| :---- | :---- |
| **Users Who Can Access** | Member |
| **Required Fields** | N/A (display) |
| **Buttons / Actions** | Navigate to Check-in History, Plans, PT Booking, AI Coach, Profile |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | App home / default landing tab |
| **Permissions / Visibility** | Member only |

 

### **SCR-05 — Member Profile & Goals**

| Purpose | View/edit personal profile and fitness goals. |
| :---- | :---- |
| **Users Who Can Access** | Member |
| **Required Fields** | Photo, contact details, health notes, fitness goals (type \+ target) |
| **Buttons / Actions** | Save changes |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | \[TBD\] |
| **Success Messages** | 'Profile updated' \[exact copy TBD\] |
| **Navigation Behaviour** | Accessible from Home tab bar |
| **Permissions / Visibility** | Member only (own profile) |

 

### **SCR-06 — Session Attendance History**

| Purpose | Display the member's PT session attendance log (FR-013, Phase 1). Phase 2 adds a streak counter on the same screen (FR-031). |
| :---- | :---- |
| **Users Who Can Access** | Member |
| **Required Fields** | N/A (display of date, time, method per entry) |
| **Buttons / Actions** | Scroll/filter history \[filter mechanics TBD\] |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | From Home |
| **Permissions / Visibility** | Member only (own data) |

 

### **SCR-07 — PT Session Booking**

| Purpose | Book a new PT session against trainer availability. |
| :---- | :---- |
| **Users Who Can Access** | Member, Trainer, Admin |
| **Required Fields** | Trainer, date, time, session type |
| **Buttons / Actions** | Confirm booking; select alternative slot |
| **Validation Rules** | Pack balance check; trainer availability check |
| **Error Messages** | 'No sessions remaining — purchase a pack' (BR-PT011); 'Trainer unavailable at this time' (BR-TRN001) |
| **Success Messages** | Booking confirmation with reminder schedule shown |
| **Navigation Behaviour** | From Home or Trainer profile |
| **Permissions / Visibility** | Role-appropriate |

 

### **SCR-08 — PT Session — QR Start/End**

| Purpose | Scan QR to start/end a live PT session. |
| :---- | :---- |
| **Users Who Can Access** | Member (scans), Trainer (views live status) |
| **Required Fields** | QR scanner viewfinder |
| **Buttons / Actions** | Scan start QR; Scan end QR |
| **Validation Rules** | Session-match validation; minimum duration validation |
| **Error Messages** | 'Invalid session scan' (BR-PT002); 'Minimum session duration not reached' (BR-PT003) |
| **Success Messages** | 'Session started' / 'Session completed' confirmation |
| **Navigation Behaviour** | Launched from PT Zone in-app |
| **Permissions / Visibility** | Member \+ assigned Trainer |

 

### **SCR-09 — Workout Plan Viewer**

| Purpose | Display current and historical assigned workout plans. |
| :---- | :---- |
| **Users Who Can Access** | Member (view), Trainer (create/edit for own clients) |
| **Required Fields** | Exercises, sets, reps, rest periods, coaching notes |
| **Buttons / Actions** | View historical plans; (Trainer) create/assign plan |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | \[TBD\] |
| **Success Messages** | 'Plan assigned' notification to member |
| **Navigation Behaviour** | From Home |
| **Permissions / Visibility** | Member (own), Trainer (assigned clients) |

 

### **SCR-10 — Meal Plan Viewer**

| Purpose | Display current assigned meal plan. |
| :---- | :---- |
| **Users Who Can Access** | Member (view), Trainer (create/edit) |
| **Required Fields** | Daily meals, calorie targets, macros |
| **Buttons / Actions** | View historical plans |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | \[TBD\] |
| **Success Messages** | N/A |
| **Navigation Behaviour** | From Home / Plans tab |
| **Permissions / Visibility** | Member (own), Trainer (assigned clients) |

 

### **SCR-11 — AI Coach Chat**

| Purpose | Chat interface with the plan-aware AI coaching assistant. |
| :---- | :---- |
| **Users Who Can Access** | Member (if enabled), Trainer (monitor/respond to flags) |
| **Required Fields** | Message input, chat history |
| **Buttons / Actions** | Send message; (Trainer) respond to flagged conversation |
| **Validation Rules** | Injury/medical keyword detection |
| **Error Messages** | Locked-state message if AI Coach not enabled |
| **Success Messages** | N/A |
| **Navigation Behaviour** | From Home tab bar |
| **Permissions / Visibility** | Member (if enabled by trainer); Trainer (all own clients' conversations) |

 

### **SCR-12 — Trainer Messaging**

| Purpose | Direct messaging channel between member and assigned trainer. |
| :---- | :---- |
| **Users Who Can Access** | Member, Trainer |
| **Required Fields** | Message input, thread history |
| **Buttons / Actions** | Send message |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | \[TBD\] |
| **Success Messages** | N/A |
| **Navigation Behaviour** | From Home / Trainer profile |
| **Permissions / Visibility** | Member \+ assigned Trainer only |

 

### **SCR-15 — Billing & Payments (Member)**

| Purpose | View billing history; purchase/renew membership or session pack. |
| :---- | :---- |
| **Users Who Can Access** | Member |
| **Required Fields** | Payment method, pack/plan selection |
| **Buttons / Actions** | Purchase; Add/update payment method |
| **Validation Rules** | Payment gateway validation |
| **Error Messages** | Payment failure message with retry |
| **Success Messages** | Receipt/confirmation display |
| **Navigation Behaviour** | From Home |
| **Permissions / Visibility** | Member only (own billing) |

 

### **SCR-16 — Trainer Daily Schedule**

| Purpose | Trainer's view of today's/this week's sessions and live status. |
| :---- | :---- |
| **Users Who Can Access** | Personal Trainer |
| **Required Fields** | N/A (display) |
| **Buttons / Actions** | Select a session to view detail |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | Trainer Portal / App home |
| **Permissions / Visibility** | Trainer (own sessions only) |

 

### **SCR-17 — Client Management (Trainer)**

| Purpose | View assigned client roster with status and churn indicators. |
| :---- | :---- |
| **Users Who Can Access** | Personal Trainer |
| **Required Fields** | Status filter (Active/At-Risk/Lapsed) \[filter mechanics TBD\] |
| **Buttons / Actions** | Select client to view profile |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | Trainer Portal |
| **Permissions / Visibility** | Trainer (own clients only) |

 

### **SCR-18 — Client Profile (Trainer View)**

| Purpose | 360° view of a client: history, wearable data, plans, churn score. |
| :---- | :---- |
| **Users Who Can Access** | Personal Trainer |
| **Required Fields** | N/A (display) |
| **Buttons / Actions** | Create/assign plan; enable AI coach; log session notes |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | From Client Management |
| **Permissions / Visibility** | Trainer (assigned client only) |

 

### **SCR-19 — Plan Builder (Trainer)**

| Purpose | Create and assign workout/meal plans. |
| :---- | :---- |
| **Users Who Can Access** | Personal Trainer |
| **Required Fields** | Exercise/meal entries, sets/reps/rest or calories/macros, coaching notes |
| **Buttons / Actions** | Save plan; Assign to client |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | \[TBD\] |
| **Success Messages** | 'Plan assigned' confirmation |
| **Navigation Behaviour** | From Client Profile |
| **Permissions / Visibility** | Trainer only |

 

### **SCR-20 — Trainer Earnings**

| Purpose | View earnings breakdown and pay-period reports. |
| :---- | :---- |
| **Users Who Can Access** | Personal Trainer |
| **Required Fields** | N/A (display); date range selector |
| **Buttons / Actions** | View/export pay-period report |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | Trainer Portal |
| **Permissions / Visibility** | Trainer (own earnings only) |

 

### **SCR-21 — Owner Dashboard — Live Operations**

| Purpose | Real-time snapshot of gym operations. |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner |
| **Required Fields** | N/A (display) |
| **Buttons / Actions** | Drill into session log, pack alerts, retention panel, trainer cards, AI alerts |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | Owner Portal home |
| **Permissions / Visibility** | Gym Owner |

 

### **SCR-22 — Gym Configuration**

| Purpose | Configure gym profile, membership plans, pay rates, cancellation policy, gamification, re-engagement templates. |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner |
| **Required Fields** | Gym profile fields; plan fields; pay-rate percentages; cancellation window/toggles; gamification settings; message templates |
| **Buttons / Actions** | Save settings |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | \[TBD\] |
| **Success Messages** | 'Settings saved' confirmation |
| **Navigation Behaviour** | Owner Portal settings area |
| **Permissions / Visibility** | Gym Owner |

 

### **SCR-23 — Member Management (Admin)**

| Purpose | View/manage member list, individual profiles, suspensions, overrides. |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner |
| **Required Fields** | Status filter (active/inactive/expired) |
| **Buttons / Actions** | Suspend/deactivate; override access; send re-engagement message |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | Owner Portal |
| **Permissions / Visibility** | Gym Owner |

 

### **SCR-24 — Trainer Management (Admin)**

| Purpose | Add/edit/deactivate trainers; approve shift submissions; view performance. |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner |
| **Required Fields** | Trainer detail fields; level assignment; shift hours |
| **Buttons / Actions** | Add trainer; approve/reject shift; deactivate |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | \[TBD\] |
| **Success Messages** | Credentials-issued confirmation |
| **Navigation Behaviour** | Owner Portal |
| **Permissions / Visibility** | Gym Owner |

 

### **SCR-25 — PT Session Oversight (Admin)**

| Purpose | View/override all sessions gym-wide; no-show analytics; export. |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner |
| **Required Fields** | Date range, trainer filter, status filter |
| **Buttons / Actions** | Override session status; export session log |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | Export confirmation |
| **Navigation Behaviour** | Owner Portal |
| **Permissions / Visibility** | Gym Owner |

 

### **SCR-26 — Financial Dashboard**

| Purpose | Revenue, expenses, P\&L, payroll, exports. |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner (full); SuperAdmin (full, any gym) |
| **Required Fields** | Date range, report type selector; expense entry fields |
| **Buttons / Actions** | Log expense; set budget; generate report; export (CSV/Xero/QuickBooks) |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | Export/API failure message |
| **Success Messages** | Report rendered / export confirmation |
| **Navigation Behaviour** | Owner Portal |
| **Permissions / Visibility** | Gym Owner (full); SuperAdmin (full, any gym) |

 

### **SCR-28 — Access Control & Audit Log**

| Purpose | Live entry/exit log, access denial report, biometric device config, system audit log. |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner, SuperAdmin |
| **Required Fields** | Filters by date/reason/member |
| **Buttons / Actions** | Re-enrol biometric; configure device; export audit/compliance data |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | N/A |
| **Navigation Behaviour** | Owner Portal |
| **Permissions / Visibility** | Gym Owner |

 

### **SCR-29 — GymOS Subscription Management**

| Purpose | Manage GymOS subscription tier/billing for the gym. |
| :---- | :---- |
| **Users Who Can Access** | Gym Owner only |
| **Required Fields** | Billing details, payment method |
| **Buttons / Actions** | Upgrade/downgrade tier; update billing |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | Payment failure → grace period notice |
| **Success Messages** | Confirmation of tier change |
| **Navigation Behaviour** | Owner Portal settings |
| **Permissions / Visibility** | Gym Owner (SuperAdmin has cross-tenant equivalent access) |

 

### **SCR-30 — Hire a Trainer (Directory)**

| Purpose | Phase 1 simplified trainer list — member browses available trainers at their gym and sends a hire request (FR-082). No public ratings/filters (those belong to the Phase 2 Trainer Marketplace, SCR-13). |
| :---- | :---- |
| **Users Who Can Access** | Member |
| **Required Fields** | N/A (display list: trainer name, specialisation, level); optional short goals note on request |
| **Buttons / Actions** | Select a trainer; Send hire request |
| **Validation Rules** | \[TBD\] |
| **Error Messages** | 'No trainers available' empty state \[exact copy TBD\] |
| **Success Messages** | 'Hire request sent' confirmation |
| **Navigation Behaviour** | From Member Home, before any trainer is hired |
| **Permissions / Visibility** | Member only |

 

### **SCR-31 — Hire Request Review (Trainer)**

| Purpose | Trainer reviews and accepts/declines an incoming private hire request (FR-083). |
| :---- | :---- |
| **Users Who Can Access** | Personal Trainer |
| **Required Fields** | N/A (display: member name, optional goals note) |
| **Buttons / Actions** | Accept; Decline |
| **Validation Rules** | N/A |
| **Error Messages** | N/A |
| **Success Messages** | 'Client added' confirmation; member is notified |
| **Navigation Behaviour** | Trainer Portal (Web Dashboard) notifications / Mobile App notifications |
| **Permissions / Visibility** | Personal Trainer only (the addressed trainer) |

 

# **15\. Data Requirements (Phase 1\)**

21 of the full SRS's 26 data entities apply to Phase 1 (Wearable Data, AI Conversation, Challenge, Re-engagement Log, and Churn Score Record are Phase 2/3 and excluded here).

| Entity | Key Fields | Required | Optional | Validation | Relationships | Retention |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Member | member\_id (PK), full\_name, phone, email, date\_of\_birth, emergency\_contact, photo, health\_notes, membership\_id (FK), biometric\_token\_ref, churn\_score, streak\_count, status (Active/At-Risk/Lapsed/Suspended/Expired), leaderboard\_opt\_in (bool), created\_at | full\_name, phone/email, date\_of\_birth, membership plan | photo, health\_notes, emergency\_contact \[TBC required or optional\] | \[TBD — field formats not specified in source\] | 1:1 with Membership (current); 1:N with Check-in, Session, SessionPack, ProgressPhoto, BodyMetric, Goal; N:1 with assigned Trainer | \[TBD\] |
| Membership | membership\_id (PK), member\_id (FK), plan\_id (FK), start\_date, expiry\_date, status (Active/Expired/Suspended), renewal\_date | member\_id, plan\_id, start\_date | — | expiry\_date must be \> start\_date | N:1 with Member; N:1 with MembershipPlan | \[TBD\] |
| MembershipPlan | plan\_id (PK), gym\_id (FK), name, duration\_days, price, included\_pt\_sessions, active (bool) | name, duration\_days, price | included\_pt\_sessions (default 0\) | price ≥ 0; duration\_days \> 0 | 1:N with Membership | N/A (config data) |
| SessionPack | pack\_id (PK), member\_id (FK), trainer\_id (FK, nullable), total\_sessions, sessions\_used, purchase\_date, expiry\_date, status (Active/Exhausted/Expired) | member\_id, total\_sessions, purchase\_date | trainer\_id, expiry\_date \[policy TBD\] | sessions\_used ≤ total\_sessions | N:1 with Member; 1:N with PT Session (consumption) | \[TBD\] |
| PT Session | session\_id (PK), member\_id (FK), trainer\_id (FK), scheduled\_date\_time, session\_type (In-person/Virtual/Introductory), status (Scheduled/Active/Completed/Missed/Cancelled), start\_scan\_ts, end\_scan\_ts, shift\_status (In-shift/Off-shift), fee, pay\_amount, notes, no\_show\_flag | member\_id, trainer\_id, scheduled\_date\_time, session\_type | notes | end\_scan\_ts − start\_scan\_ts ≥ minimum duration threshold to mark Completed | N:1 with Member; N:1 with Trainer; 1:1 with Revenue Record; 1:1 with Pay Record | \[TBD\] |
| Workout Plan | plan\_id (PK), client\_id (FK), trainer\_id (FK), title, created\_date, exercises\[\] (exercise, sets, reps, rest, notes), active (bool) | client\_id, trainer\_id, exercises | notes | \[TBD\] | N:1 with Member (client); N:1 with Trainer | Historical plans retained (per FR-021) |
| Meal Plan | plan\_id (PK), client\_id (FK), trainer\_id (FK), created\_date, meals\[\] (meal, calories, macros), dietary\_notes, active (bool) | client\_id, trainer\_id, meals | dietary\_notes | \[TBD\] | N:1 with Member; N:1 with Trainer | Historical plans retained |
| Progress Photo | photo\_id (PK), member\_id (FK), uploaded\_by (Member/Trainer), date, file\_ref | member\_id, date, file\_ref | — | \[format/size limits TBD\] | N:1 with Member | \[TBD\] |
| Body Metric Entry | entry\_id (PK), member\_id (FK), date, weight, bmi, body\_fat\_pct, chest, waist, arms | member\_id, date, at least one metric value | individual metric fields | numeric, plausible-range checks \[ranges TBD\] | N:1 with Member | \[TBD\] |
| Check-in / Access Log | checkin\_id (PK), member\_id (FK), timestamp, method (Face/Fingerprint/Override), result (Granted/Denied), denial\_reason, staff\_override\_id (nullable) | member\_id, timestamp, method, result | denial\_reason, staff\_override\_id | — | N:1 with Member | \[TBD — audit/compliance implications, see Section 20\] |
| Trainer | trainer\_id (PK), full\_name, contact, specialisations\[\], years\_experience, level (1/2), shift\_start, shift\_end, marketplace\_opt\_in (bool), rating\_avg, status (Active/Deactivated) | full\_name, contact, level | specialisations, years\_experience | level ∈ {1,2} | 1:N with PT Session, Workout Plan, Meal Plan, Client assignment | Historical data retained on deactivation (BR-USR002) |
| Pay Record | pay\_record\_id (PK), session\_id (FK), trainer\_id (FK), level, shift\_status, base\_rate\_applied, off\_shift\_premium\_applied, gross\_pay, pay\_period\_id (FK) | session\_id, trainer\_id, gross\_pay | — | gross\_pay \= fee × applicable rate formula | 1:1 with PT Session; N:1 with Pay Period | \[TBD\] |
| Pay Period | pay\_period\_id (PK), trainer\_id (FK), start\_date, end\_date, in\_shift\_subtotal, off\_shift\_subtotal, gross\_total, status (Open/Closed/Approved) | trainer\_id, start\_date, end\_date | — | — | 1:N with Pay Record | \[TBD\] |
| Revenue Record | revenue\_id (PK), category (Membership/PT Session/Add-on), amount, linked\_session\_id (nullable), linked\_member\_id, date, deferred (bool) | category, amount, date | linked\_session\_id | amount ≥ 0 | N:1 with Member; N:1 with PT Session (where applicable) | \[TBD — financial record retention likely subject to local tax/accounting law, not specified\] |
| Expense Record | expense\_id (PK), category, amount, description, date, recurring (bool) | category, amount, date | description | amount ≥ 0 | N:1 with Expense Category / Budget | \[TBD\] |
| Badge / Milestone | badge\_id (PK), member\_id (FK), type (First Visit/10-Visit/100-Visit/Streak/Pack Completion/Challenge), awarded\_date | member\_id, type, awarded\_date | — | — | N:1 with Member | \[TBD\] |
| Trainer Review | review\_id (PK), member\_id (FK), trainer\_id (FK), rating (1-5), comment, moderation\_status (Pending/Approved/Rejected), date | member\_id, trainer\_id, rating | comment | 1 ≤ rating ≤ 5; member must have ≥1 completed session with trainer (BR-MKT002) | N:1 with Member; N:1 with Trainer | \[TBD\] |
| PT Interest Request | request\_id (PK), member\_id (FK), trainer\_id (FK), goals\_note, submitted\_date, response\_deadline, status (Pending/Accepted/Declined/Expired) | member\_id, trainer\_id, submitted\_date | goals\_note | response\_deadline \= submitted\_date \+ 48h | N:1 with Member; N:1 with Trainer. Phase 2 (public Trainer Marketplace) only — see Private Trainer Hire Request for the Phase 1 equivalent. | \[TBD\] |
| Private Trainer Hire Request | hire\_request\_id (PK), member\_id (FK), trainer\_id (FK), goals\_note, submitted\_date, status (Pending/Accepted/Declined) | member\_id, trainer\_id, submitted\_date | goals\_note | \[TBD — no 48h SLA specified for Phase 1, unlike the Phase 2 PT Interest Request\] | N:1 with Member; N:1 with Trainer; on Accepted, establishes the Trainer-Client relationship referenced by PT Session, Workout Plan, and Meal Plan | \[TBD\] |
| Audit Log Entry | log\_id (PK), user\_id (FK), action\_type, timestamp, affected\_record\_id, affected\_record\_type | user\_id, action\_type, timestamp, affected\_record\_id | — | — | N:1 with User (Gym Owner/Admin) | \[TBD — compliance-relevant, see Section 20\] |
| Gym / Tenant | gym\_id (PK), name, address, logo, operating\_hours, contact\_details, subscription\_tier, subscription\_status, branch\_group\_id (nullable, multi-branch) | name, subscription\_tier | logo, branch\_group\_id | — | 1:N with Member, Trainer, MembershipPlan, etc. (tenant root) | N/A |

# **16\. Integration Requirements (Phase 1\)**

8 of the full SRS's 10 integrations apply to Phase 1 (Biometric Hardware and Wearable Platforms are Phase 3 and excluded here).

### **Payment Gateway — Stripe**

| Purpose | Process membership and session-pack payments in-app. |
| :---- | :---- |
| **Direction of Data Flow** | Bi-directional (payment request → gateway; payment status/webhook → GymOS) |
| **Data Exchanged** | Payment amount, currency, member reference, payment method token |
| **Trigger** | Member/Owner initiates a payment (FR-018, FR-019) |
| **Authentication / Security** | API key / OAuth per Stripe integration standard \[implementation detail TBD\] |
| **Expected Response** | Success/failure status, transaction ID |
| **Error Handling** | On failure: error shown to member; retry offered; no financial record created |
| **Dependency Notes** | Confirmed integration partner per GymOS workflow documents (MEM-01, MEM-06) |
| **Status** | Confirmed (named explicitly in GymOS source material) |

 

### **Payment Gateway — PayHere**

| Purpose | Local (Sri Lankan) payment gateway alternative/primary for membership and pack payments. |
| :---- | :---- |
| **Direction of Data Flow** | Bi-directional |
| **Data Exchanged** | Payment amount, currency (LKR), member reference |
| **Trigger** | Member/Owner initiates a payment |
| **Authentication / Security** | API key per PayHere integration standard \[TBD\] |
| **Expected Response** | Success/failure status, transaction ID |
| **Error Handling** | Same as Stripe path |
| **Dependency Notes** | Named in both GymOS (MEM-01, MEM-06) and FitCore documents |
| **Status** | Confirmed, but relationship to Stripe (primary vs. regional alternative, or both simultaneously) is \[To Be Confirmed\] — see Open Questions |

 

### **Payment Gateway — iPay**

| Purpose | Named as a local Sri Lankan gateway option in the FitCore business proposal only. |
| :---- | :---- |
| **Direction of Data Flow** | Bi-directional |
| **Data Exchanged** | Payment amount, member reference |
| **Trigger** | Payment initiation |
| **Authentication / Security** | \[TBD\] |
| **Expected Response** | \[TBD\] |
| **Error Handling** | \[TBD\] |
| **Dependency Notes** | Appears only in FitCore documentation, not in the more detailed GymOS Role/Business Rules/Workflow documents |
| **Status** | \[To Be Confirmed\] — possible conflict/overlap with Stripe/PayHere; see Open Questions §31.3 |

 

### **Accounting Software — Xero**

| Purpose | Push financial data (P\&L, revenue, expenses) for external accounting. |
| :---- | :---- |
| **Direction of Data Flow** | Outbound (GymOS → Xero) |
| **Data Exchanged** | Revenue records, expense records, payroll totals |
| **Trigger** | Owner-initiated export (FR-070) |
| **Authentication / Security** | OAuth per Xero API \[TBD\] |
| **Expected Response** | Push confirmation / error |
| **Error Handling** | Error surfaced to Owner; retry mechanism \[TBD\] |
| **Dependency Notes** | Confirmed as a named export destination |
| **Status** | Confirmed |

 

### **Accounting Software — QuickBooks**

| Purpose | Push financial data for external accounting. |
| :---- | :---- |
| **Direction of Data Flow** | Outbound (GymOS → QuickBooks) |
| **Data Exchanged** | Same as Xero |
| **Trigger** | Owner-initiated export |
| **Authentication / Security** | OAuth per QuickBooks API \[TBD\] |
| **Expected Response** | Push confirmation / error |
| **Error Handling** | Same as Xero |
| **Dependency Notes** | Confirmed as a named export destination |
| **Status** | Confirmed |

 

### **SMS Gateway Provider**

| Purpose | Deliver SMS notifications (session reminders, at-risk re-engagement, credentials). |
| :---- | :---- |
| **Direction of Data Flow** | Outbound (GymOS → SMS gateway → member) |
| **Data Exchanged** | Phone number, message content |
| **Trigger** | Various notification triggers (see Section 17\) |
| **Authentication / Security** | \[TBD\] |
| **Expected Response** | Delivery status \[TBD\] |
| **Error Handling** | \[TBD\] |
| **Dependency Notes** | Referenced functionally throughout (e.g., PT009, CHU002) but no specific SMS provider is named in any source document |
| **Status** | \[To Be Confirmed\] — provider not specified |

 

### **Email Service Provider**

| Purpose | Deliver email notifications (credentials, weekly AI management accounts, receipts). |
| :---- | :---- |
| **Direction of Data Flow** | Outbound |
| **Data Exchanged** | Email address, message content |
| **Trigger** | Various notification triggers |
| **Authentication / Security** | \[TBD\] |
| **Expected Response** | Delivery status \[TBD\] |
| **Error Handling** | \[TBD\] |
| **Dependency Notes** | Referenced functionally (e.g., AI-001 email delivery) but no specific email provider is named |
| **Status** | \[To Be Confirmed\] — provider not specified |

 

### **WhatsApp Business API**

| Purpose | WhatsApp-based notifications (session reminders, renewal alerts) — a headline feature of the FitCore business proposal. |
| :---- | :---- |
| **Direction of Data Flow** | Outbound |
| **Data Exchanged** | Phone number, message content |
| **Trigger** | Various |
| **Authentication / Security** | \[TBD\] |
| **Expected Response** | \[TBD\] |
| **Error Handling** | \[TBD\] |
| **Dependency Notes** | Prominent in FitCore proposal ('WhatsApp-integrated notifications', 'WhatsApp-first') but NOT mentioned anywhere in the GymOS Role Function List, Business Rules, or Workflow documents, which instead specify push notification and SMS. |
| **Status** | \[To Be Confirmed\] — significant scope conflict between FitCore and GymOS source material; see Open Questions §31.4 |

 

# **17\. Notifications (Phase 1\)**

23 of the full SRS's 31 notification triggers apply to Phase 1\.

| Trigger | Recipient | Content / Purpose | Conditions | Frequency |
| :---- | :---- | :---- | :---- | :---- |
| 30 days before membership expiry | Member | Renewal reminder | Membership has a known expiry date (BR-MEM006) | Once, 30 days prior |
| Membership auto-suspended (expiry reached, no renewal) | Member; Gym Owner | Access blocked notice | BR-MEM007 | Once, at expiry |
| Biometric access denied (any reason) | Gym Owner (alert); Member (denial reason on kiosk screen) | Access denial notice | BR-MEM002/003/004 | Per occurrence |
| 3 consecutive failed biometric scans | Gym Owner | Incident alert; member locked out 5 minutes | BR-ACC005 | Per occurrence |
| 24 hours before a scheduled PT session | Member | Session reminder | BR-PT009 | Once per session |
| 1 hour before a scheduled PT session | Member | Session reminder | BR-PT010 | Once per session |
| Session start (QR scan) | Trainer | '\[Client\] has started the session' | BR-PT001 | Per occurrence |
| Session marked Completed | Member | Post-session summary | BR-PT004 | Per occurrence |
| Session marked Missed (no-show) | Member (deduction notice); Trainer (no-show alert) | No-show notification | BR-PT006, BR-TRN003 | Per occurrence |
| Late cancellation | Trainer; Owner | Cancellation notice with reason | BR-PT005 | Per occurrence |
| Trainer cancels within 24h of session | Member (immediate); Owner (if within 24h) | Cancellation notice | BR-TRN005 | Per occurrence |
| Pack balance reaches ≤2 sessions | Member; Trainer | Pack renewal / upsell prompt | BR-PT007, BR-AI-008 | Once per threshold crossing |
| Pack reaches expiry with unused sessions | Member; Owner | Pack wastage / renewal prompt | BR-PT008 | Once, at expiry |
| Payment success (membership or pack) | Member | Receipt / confirmation | — | Per transaction |
| New workout/meal plan assigned | Member | 'New plan assigned' notice | — | Per assignment |
| AI Coach flags a conversation (medical keyword) | Trainer | Flagged conversation alert | BR-TRN007 | Per occurrence |
| Daily check-in prompt (non-PT day) | Member | AI Coach check-in / motivational message | AI Coach enabled for member | Daily (non-PT days) |
| New direct message received | Member or Trainer (recipient) | New message alert | — | Per message |
| PT interest request submitted | Trainer | New interest request with goals note | BR-MKT003 | Per request |
| PT interest request unanswered after 48h | Owner; Member | Request expired notice | BR-MKT003 | Once, at 48h |
| Expense exceeds monthly budget in a category | Owner | Budget variance alert | BR-FIN004 | Per occurrence |
| GymOS subscription payment fails/lapses | Gym Owner | Billing failure \+ grace-period notice | BR-USR005 | Per occurrence |
| New trainer account created | Trainer | Login credentials | — | Once, at account creation |

# **18\. Reporting & Analytics (Phase 1\)**

10 of the full SRS's 15 reports apply to Phase 1 (retention heatmap, onboarding funnel, gamification engagement, wearable adoption, and the AI weekly scorecard are Phase 2/3 and excluded here).

| Report | Purpose | Access | Data | Filters | Export | Frequency |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Profit & Loss (P\&L) Report | Show revenue minus expenses (incl. payroll) \= net profit for a period, with period-over-period comparison. | Gym Owner (full); SuperAdmin (full, any gym) | Revenue records, expense records, payroll totals | Date range | CSV, Xero, QuickBooks | On-demand; also auto-generated weekly by AI Agent (BR-AI-001) |
| Revenue Breakdown Report | Revenue split by category (membership/PT/add-ons), trainer level, and shift status. | Gym Owner | Revenue records | Date range, category | CSV | On-demand; real-time dashboard view |
| Expense Summary Report | Expenses by category with budget-vs-actual variance. | Gym Owner (view) | Expense records, category budgets | Date range, category | CSV | On-demand |
| Trainer Payroll Report | Itemised pay per trainer per pay period, in-shift/off-shift subtotals. | Gym Owner (approve/export); Trainer (own only) | Pay records, pay periods | Trainer, pay period | CSV, payroll system export | Per pay period (weekly/monthly, configurable) |
| Session Log Export | All sessions for a date range with full detail (status, trainer, member, shift classification). | Gym Owner | PT Session records | Date range, trainer, status | CSV | On-demand |
| Trainer Performance Report | Sessions completed, no-show rate, revenue generated, client count, average rating per trainer. | Gym Owner | Session, Revenue, Review records | Date range, trainer | \[TBD\] | On-demand |
| No-Show Analytics | No-show rate by trainer, time slot, and membership type. | Gym Owner | PT Session records (Missed status) | Date range, dimension (trainer/slot/plan) | \[TBD\] | On-demand |
| Trainer Utilisation Report | Sessions per trainer vs. availability; idle hours. | Gym Owner | PT Session records, trainer shift schedules | Date range, trainer | \[TBD\] | On-demand |
| Member Attendance Report | Peak hours; average visits per member per week. | Gym Owner | Check-in records | Date range | \[TBD\] | On-demand |
| New Member Growth Report | Sign-ups by month; source attribution. | Gym Owner | Member registration records | Date range | \[TBD\] | Monthly / on-demand |

# **19\. Non-Functional Requirements**

Reproduced from the full SRS. Measurable targets are provided only where explicitly supported by source material; unmeasured items remain \[TBD\].

## **Performance**

● System shall process a biometric check-in decision (match \+ membership \+ suspension checks) and open/deny the gate. \[Target response time TBD — not specified in source material; recommend ≤2 seconds for acceptable user experience — Recommendation, not confirmed\]

● QR session start/end scans shall be validated and reflected in session status. \[Target response time TBD\]

● Owner Dashboard live panels (occupancy, active sessions, today's revenue) shall reflect near-real-time data. \[Exact refresh interval/latency TBD\]

## **Scalability**

● System is multi-tenant SaaS and must support many gyms (tenants) concurrently, each with its own members, trainers, and data (per Doc 3, Section 1.1). \[Specific tenant/user volume targets TBD — FitCore business proposal cites an addressable market of \~500 gyms and a Year-1 target of 50 gyms, but this is a market-sizing figure, not a confirmed technical capacity requirement\]

## **Availability**

● \[TBD\] No uptime/SLA target (e.g., 99.9%) is specified in any source document for the core platform.

● FitCore proposal commits to a 4-hour response SLA for Priority Support on its top-tier plan — this is a support-response commitment, not a system-availability target, and its applicability to GymOS is \[To Be Confirmed\].

## **Reliability**

● Biometric access control must fail safely: hardware failure or connectivity loss must not permanently lock members out (FitCore risk analysis proposes offline-capable check-in with sync-on-reconnect, and QR-code fallback — Assumption/Recommendation carried from FitCore business case; not explicitly restated in GymOS technical documents).

● Session billing and pay calculation must be deterministic and auditable — every session must resolve to exactly one billing/pay outcome (Completed, Missed, or Cancelled), per BR-PT/PAY series.

## **Security**

● See Section 20 (dedicated Security Requirements section) for full detail.

## **Authentication**

● Member: email/password or device biometric (FR-002).

● Trainer/Gym Owner: \[authentication mechanism TBD — not specified beyond 'log in to Trainer Portal / Owner Dashboard'\].

● \[TBD\] Multi-factor authentication is not mentioned in any source document.

## **Authorization**

● Role-based access control (RBAC) across the four current roles — Gym Member, Personal Trainer (L1/L2), Gym Owner, SuperAdmin — per the Section 7 permission matrix.

● A delegated "Manager" role documented in source material (BR-USR003 — no billing changes, no pay-rate changes, no financial export) is not part of the current role model; see FR-080.

## **Data Privacy**

● Biometric data is sensitive personal data; FitCore's risk analysis states biometric data should be 'stored encrypted' with a 'GDPR-aligned' policy. This is carried forward as a Recommendation — GDPR itself is an EU regulation and its applicability to a Sri-Lanka-first product is \[To Be Confirmed\]; local data-protection law compliance (e.g., Sri Lanka's Personal Data Protection Act) is not addressed in any source document and should be confirmed with legal counsel.

● AI Agent access to financial data is explicitly read-only (BR-AI-005) — the AI cannot write, modify, or delete records.

● AI Coach conversations may reference health-adjacent topics (injury/pain) even though the AI declines to advise — these flagged conversations are stored, so a data-handling policy for this category should be confirmed.

## **Audit Logging**

● Every Gym Owner/Admin administrative action must be logged with user ID, action type, timestamp, and affected record ID (BR-USR004).

● Access control events (check-ins, denials, overrides) are logged per BR-MEM005, BR-ACC002, BR-ACC003.

## **Maintainability**

● All configurable thresholds referenced throughout this SRS (cancellation window, minimum session duration, streak target, churn thresholds, pay rates, AI anomaly thresholds) must be exposed as gym-level admin settings, not hardcoded, per the explicit developer note in the Project Scope & Workflow Map document.

## **Usability**

● \[TBD\] No measurable usability targets (e.g., task completion time, error rate, SUS score) are specified in source material. Avoid unmeasurable claims such as 'the system should be user-friendly' per instruction — any usability target must be defined and confirmed with the Product Owner before being included as a testable requirement.

## **Accessibility**

● \[TBD\] No accessibility standard (e.g., WCAG 2.1 AA) is specified or referenced in any source document.

## **Compatibility**

● Platform is delivered as: web app (Owner/Admin, Trainer Portal) \+ mobile app (Member; Trainer on-floor use) per Doc 3, Section 1.1.

● \[TBD\] Specific OS/browser version support (iOS/Android minimum versions, browser matrix) is not specified.

## **Backup & Recovery**

● \[TBD\] No backup frequency, retention, or recovery-point/recovery-time objective (RPO/RTO) is specified in any source document.

## **Disaster Recovery**

● \[TBD\] No disaster recovery plan, failover architecture, or multi-region strategy is specified.

## **Monitoring & Logging**

● System audit log (BR-USR004) and access log (BR-MEM005) are functionally required, as documented.

● \[TBD\] Application performance monitoring, error-tracking, and infrastructure-monitoring tooling are not specified.

# **20\. Security Requirements**

| Area | Requirement / Detail |
| :---- | :---- |
| Authentication | Member authentication via email/password or device-level biometric (FR-002). Trainer/Gym Owner authentication mechanism is \[TBD — not detailed beyond 'log in'\]. Password complexity rules, session timeout, and MFA are \[TBD\]. |
| Authorization / Role-Based Access | Confirmed RBAC boundaries exist for the four current roles: Gym Member, Personal Trainer (L1/L2), Gym Owner (tenant-scoped), and SuperAdmin (platform-wide, unrestricted). A delegated "Manager" role documented in source material (BR-USR003) is deferred — see FR-080 and Section 7\. |
| Password / Credential Requirements | \[TBD\] No password policy (minimum length, complexity, rotation) is specified in source material. Credentials for new members/trainers are system-generated and delivered via SMS/email (BR-ACC001, OWN-05) — the security of that delivery channel and any forced first-login password change are \[TBD\]. |
| Data Protection | Biometric data: FitCore proposal recommends encrypted storage; GymOS documents do not explicitly restate an encryption requirement but reference storing a 'biometric token' (implying tokenisation rather than raw biometric image storage — Assumption). Financial and personal data protection approach (encryption at rest/in transit, key management) is \[TBD\]. |
| API Security | \[TBD\] No API authentication scheme (API keys, OAuth2, JWT), rate limiting, or input-sanitisation standard is specified for GymOS's own APIs. Third-party integration security (Stripe/PayHere/Xero/QuickBooks/wearables) should follow each provider's standard security model (e.g., OAuth2, webhook signature verification) — Recommendation, not yet confirmed as implemented. |
| Session Management | \[TBD\] Session timeout, token expiry/refresh strategy, and concurrent-session handling are not specified. |
| Audit Trails | Confirmed requirement: all Gym Owner/Admin actions logged with user ID, action type, timestamp, affected record ID (BR-USR004). Access control events logged per BR-MEM005/ACC002/ACC003. |
| Sensitive Data Handling | Categories of sensitive data present in this system: biometric identifiers, health/medical notes and AI-coach conversations referencing injury/pain, payment card/payment-method data, and financial records. A formal data classification and handling policy is \[TBD\] and should be defined with the Product Owner and, where applicable, legal counsel, before development of these modules. |
| Security Logging | Failed biometric attempts (BR-ACC005), access denials (BR-MEM002/003/004), and AI conversation flags (BR-TRN007) are functionally logged; a dedicated security-event monitoring/alerting capability beyond these functional logs is \[TBD\]. |
| Compliance | No specific compliance regime (PCI-DSS for payment handling, GDPR, HIPAA, or Sri Lanka's Personal Data Protection Act) is explicitly confirmed as a project requirement in the supplied source material, beyond the informal 'GDPR-aligned' aspiration in the FitCore business proposal's risk section. Per instruction, this SRS does not assume any compliance obligation that has not been explicitly stated — compliance scope must be confirmed with the Product Owner (see Open Questions §31.7). |

# **21\. Error Handling & Validation (Phase 1\)**

11 of the full SRS's 14 error scenarios apply to Phase 1 (biometric, wearable, and AI Agent scenarios excluded here).

| Scenario | Required Behaviour |
| :---- | :---- |
| Invalid/incomplete registration data | \[TBD — specific field-level validation rules not defined in source material\]. Recommendation: mandatory-field and format validation (email format, phone format) with inline error messaging before submission is allowed. |
| Payment failure (membership or pack purchase) | Confirmed: error is shown to the user; retry is offered; no membership/pack record is created (BR pattern across MEM-01, MEM-06). |
| 3 consecutive biometric scan failures | Confirmed: member blocked for 5 minutes; incident logged; front desk alerted (BR-ACC005). |
| QR scan does not match booked session | Confirmed: scan rejected; error shown; incident logged (BR-PT002). |
| QR end-scan before minimum session duration | Confirmed: end-scan rejected with an explicit 'minimum duration not reached' message (BR-PT003). |
| Booking attempted with zero session-pack balance | Confirmed: booking blocked; message shown directing the member to purchase a new pack (BR-PT011). |
| Trainer double-booking | Confirmed: booking rejected; conflict shown; alternative slots suggested (BR-TRN001). |
| Financial data export / accounting API push failure (Xero/QuickBooks) | \[TBD — retry policy, error messaging, and partial-failure handling not specified in source material\]. |
| Duplicate member registration (same person registered twice) | \[TBD — no de-duplication rule specified in source material\]. |
| Session timeout / authentication failure during use | \[TBD — not specified\]. |
| GymOS subscription payment failure (Owner-side billing) | Confirmed: features gated per tier; Owner notified; 7-day grace period before further restriction (BR-USR005). \[Exact post-grace-period restriction and reinstatement flow TBD\]. |

# **22\. Technical Requirements**

Per instruction, this SRS does not invent a technology stack. Reproduced in full from the master SRS, including the client-application build-sequencing guidance (22.9), which is central to how Phase 1 should be built.

## **22.1 Frontend**

● \[TBD\] No frontend framework, language, or design system is specified for either client application.

● Confirmed: exactly two client applications — the Web Dashboard (Gym Owner, SuperAdmin, Personal Trainer management views) and the Mobile App (Gym Member, Personal Trainer on-floor views). Confirmed build order: Web Dashboard first, Mobile App second. See Section 22.9 for full guidance.

## **22.2 Backend**

● \[TBD\] No backend language, framework, or architecture (monolith/microservices) is specified.

## **22.3 Database**

● \[TBD\] No database technology is specified. Section 15 (Data Requirements) documents the logical entities and relationships that any chosen database must support.

## **22.4 APIs**

● \[TBD\] No API style (REST/GraphQL/gRPC) or versioning approach is specified for GymOS's own APIs.

● Confirmed external API dependencies: Stripe and/or PayHere (payments), Xero and/or QuickBooks (accounting export), wearable provider APIs (Phase 3\) — see Section 16\.

## **22.5 Hosting / Infrastructure**

● \[TBD\] No cloud provider, region, or hosting model is specified beyond 'cloud-based, multi-tenant SaaS' (Doc 3 §1.1).

## **22.6 Third-Party Services**

● Confirmed named third-party services: Stripe, PayHere, Xero, QuickBooks, Apple Health, Google Fit, Fitbit, Garmin, WHOOP.

● \[To Be Confirmed\] iPay, WhatsApp Business API, SMS gateway, email service provider, biometric hardware vendor (ZKTeco/Suprema referenced only in FitCore) — see Section 16 and Open Questions.

## **22.7 Development Environment**

● \[TBD\] No information on development environment, CI/CD pipeline, or source control standards is provided in source material.

## **22.8 Deployment Requirements**

● \[TBD\] No deployment architecture, environment strategy (dev/staging/prod), or release process is specified — see Section 26\.

## **22.9 Client Applications & Build Sequencing**

This is confirmed product direction: there are exactly two client applications, and they are built in sequence rather than in parallel.

### **22.9.1 The Two Applications**

● Web Dashboard — used by Gym Owner, SuperAdmin, and Personal Trainer (management/planning views). Built first.

● Mobile App — used by Gym Member, and Personal Trainer (on-floor session views: schedule, QR start/end, session notes). Built second.

● Neither application is role-exclusive in the sense of a separate codebase per role — each application serves multiple roles through role-gated views within one codebase.

### **22.9.2 API-First Backend — Why This Matters Given the Build Order**

● Design the backend API surface to serve both applications from day one, even though the Mobile App is not built until after the Web Dashboard ships.

● Concretely: when building any backend endpoint that is a Mobile App function (e.g., PT session QR start/end — FR-015/FR-016; hire-a-trainer — FR-082; plan viewing — FR-021/FR-022), implement and test that endpoint fully even though the Web Dashboard may not have a UI for it. The Web Dashboard can expose a simple admin/testing view purely to allow backend verification before the Mobile App exists (e.g., FR-037's manual session completion).

● Authentication (FR-002, username/password) should be a shared API concern consumed identically by both applications.

### **22.9.3 Recommended Build Order Within Phase 1**

1\. Backend & data model (Section 15\) — built to serve both clients from the start.

2\. Web Dashboard: Gym Owner / SuperAdmin functions — gym configuration (FR-049–FR-055), member management (FR-057/FR-058), trainer management (FR-060), financial management (FR-066–FR-070), dashboard/analytics (FR-071/FR-073).

3\. Web Dashboard: Personal Trainer management views — client list (FR-041), client profile (FR-042), plan builder (FR-084/FR-085), earnings (FR-045/FR-046).

4\. Mobile App: Gym Member functions — authentication (FR-002), hire-a-trainer (FR-082), session booking/lifecycle (FR-014–FR-017), plan viewing (FR-021/FR-022), billing (FR-018–FR-020).

5\. Mobile App: Personal Trainer on-floor functions — daily schedule (FR-036), QR session flow (shared logic with FR-015/FR-016), session notes (FR-038).

### **22.9.4 Known Consequence of Building Web-First**

● Any requirement that is Mobile-only by nature (QR-based session start/end performed by the member, hire-a-trainer performed by the member) cannot be end-to-end tested by an actual member until the Mobile App exists. Include minimal Web Dashboard testing affordances so backend logic can be validated ahead of Mobile App delivery.

● Trainer-side workflows split across both apps should be designed so the trainer's account and data are identical across both apps from day one.

# **23\. Performance Requirements (Phase 1\)**

## **23.1 Known, Confirmed Values**

| Parameter | Confirmed Value |
| :---- | :---- |
| Minimum PT session duration before end-scan is accepted | 20 minutes (default, gym-configurable per BR-PT003) |
| Cancellation policy window (example given) | 24 hours (illustrative default; actual value is gym-configurable per BR-PT005 / FR-052) |
| Trainer response window for Marketplace interest requests | 48 hours (BR-MKT003) |
| Churn score recalculation frequency | Every 7 days, all members (BR-CHU001) |
| Churn score bands | Active 0–39 · At-Risk 40–69 · Lapsed 70–100 (BR-CHU002-004) |
| Session pack low-balance alert threshold | ≤2 sessions remaining (BR-PT007, BR-AI-008) |
| Onboarding journey duration | 30 days, with checkpoints at Day 1, 3, 7, 14, 21, 30 (BR-ONB001-006) |
| Weekly streak target (default) | 3 check-ins per week, gym-configurable (BR-GAM001) |
| Weekly AI management accounts run | Every Monday morning, configurable day (BR-AI-001) |
| GymOS subscription lapse grace period | 7 days (BR-USR005) |
| Session reminder timing | 24 hours and 1 hour before scheduled session (BR-PT009/010) |
| Overtraining alert threshold | 3+ consecutive days of high wearable-reported fatigue (BR-TRN008) |
| Pay period frequency | Weekly or monthly, gym-configurable (BR-PAY008) |

 

## **23.2 Unconfirmed — \[TBD\]**

● Concurrent user targets (per gym and platform-wide) — \[TBD\]

● Expected transaction volumes (check-ins/day, PT sessions/day, payments/day) — \[TBD\]. FitCore's business proposal cites a Year-1 target of \~50 gyms and an addressable market of \~500 gyms, but these are market-sizing figures from a separate business case, not confirmed technical load targets for GymOS.

● Data volume projections (members, sessions, wearable data points) at scale — \[TBD\]

● API/page response-time targets — \[TBD\]

● Batch/scheduled job processing windows (e.g., how long the weekly churn recalculation or AI Agent run may take) — \[TBD\]

# **24\. Acceptance Criteria (Phase 1\)**

4 of the full SRS's 6 acceptance-criteria modules apply to Phase 1 (Access Control and Retention/Churn Engine are Phase 2/3 and excluded here).

## **Overall System**

● A new gym can be fully configured (profile, plans, pay rates, cancellation policy) and made operational without developer intervention.

● A member can complete the full journey — registration → biometric enrolment → app login → PT session booking → QR-based session lifecycle → billing — without manual staff steps beyond initial registration.

● Every completed PT session results in exactly one billing outcome (pack deduction \+ revenue record) and exactly one trainer pay outcome, calculated automatically and correctly per BR-PAY series.

● The Owner Dashboard reflects daily operational and financial data (occupancy, revenue, sessions) without requiring manual data entry beyond configuration and expense logging.

## **PT Session Lifecycle**

● A session cannot be marked Completed before the configured minimum duration has elapsed.

● A no-show is automatically detected and flagged without manual trainer/owner action.

● Cancellation-policy deductions are applied consistently according to the gym's configured window.

## **Financial Management**

● A generated P\&L for any date range reconciles to: Total Revenue − Total Expenses (including trainer payroll) \= Net Profit, matching the sum of underlying revenue/expense/payroll records for that period.

● Exported CSV/Xero/QuickBooks data matches the on-screen report for the same period and filters.

## **Trainer Payroll**

● Every completed session's pay amount matches the formula: fee × (level base rate, or level base rate \+ off-shift premium if outside shift hours).

● No-show and within-window-cancelled sessions generate zero trainer pay.

● A closed pay period's total equals the sum of its constituent session pay records.

# **25\. Testing Requirements**

| Test Type | Scope |
| :---- | :---- |
| Unit Testing | All business-rule calculations (pay-rate formulas, churn scoring, cancellation/no-show deduction logic, minimum-duration checks, streak/milestone logic) should have unit-level coverage given their precise, rule-based nature documented in Section 12\. |
| Integration Testing | Payment gateway flows (Stripe/PayHere), accounting export (Xero/QuickBooks), and — where implemented — wearable provider sync, must be tested against provider sandbox/test environments. |
| System Testing | End-to-end workflows documented in Section 13 (e.g., MEM-01 through OWN-05) should each be exercised as a full system test scenario, including their documented alternative/exception paths. |
| User Acceptance Testing (UAT) | Representative Gym Owner, Trainer, and Member users should validate the acceptance criteria in Section 24 against a staging environment populated with realistic configuration data. \[Formal UAT sign-off process TBD\] |
| Regression Testing | Given the high number of interdependent automated rules (e.g., a session's status affects billing, pay, churn signals, and gamification simultaneously), regression testing should specifically target cross-module side effects whenever any single module changes. |
| Security Testing | Authentication, authorization boundary testing (especially SuperAdmin vs. Gym Owner tenant-isolation boundaries, and the BR-USR003 delegated-admin restrictions if a Manager-style role is reintroduced), and payment-data handling should be tested. \[Formal penetration-testing scope and cadence TBD — no compliance regime has been confirmed, see Section 20.\] |
| Performance Testing | \[TBD — cannot be meaningfully planned until concurrent-user and transaction-volume targets in Section 23 are confirmed with the Product Owner.\] |

# **26\. Deployment & Release Requirements**

## **26.1 Environments**

\[TBD\] No specific dev/staging/production environment strategy is defined in source material.

## **26.2 Deployment Process**

\[TBD\] No deployment/release process (CI/CD, release cadence, feature-flagging approach) is specified.

## **26.3 Configuration**

Gym-level configuration (plans, pay rates, cancellation policy, gamification, templates) is explicitly designed to be admin-configurable at runtime rather than requiring redeployment — this is a confirmed design principle per the Project Scope & Workflow Map developer note.

## **26.4 Data Migration**

For gyms migrating from manual/spreadsheet/WhatsApp-based tracking (the explicit target customer profile per the FitCore business proposal), a member-data import process is implied but not detailed in the GymOS technical documents. FitCore's own onboarding plan describes an 8-step process (site survey → hardware install → system configuration → member data import → staff training → biometric enrolment → go-live → 30-day hypercare) — its applicability to GymOS is \[To Be Confirmed\], as GymOS's own workflow documents (OWN-05) describe only software configuration, not a hardware-installation or data-migration workflow.

## **26.5 Rollback Requirements**

\[TBD\] No rollback strategy is specified.

## **26.6 Release Dependencies (Phasing)**

The product is phased: Phase 1 (Authentication, PT Session Tracker, Private Trainer Hire, Owner Dashboard, Trainer Portal, Member App) → Phase 2 (Member Retention Engine, Gamification, public Trainer Marketplace) → Phase 3 (Access Control/Biometric, Wearable Integration, AI Agent) — see Section 5.0 and Section 5.1 for the current phase mapping, which supersedes the original GymOS source-document phasing where the two conflict. Within Phase 1 specifically, the two client applications are built in sequence, not in parallel: the Web Dashboard first, then the Mobile App (see Section 22.9 for full guidance). This means Phase 1 has an internal sub-sequence (Web Dashboard functionality is releasable/testable before Mobile App functionality exists) that release planning should account for. Specific calendar dates per phase are \[To Be Confirmed\] (the source Development phases row states 'Phase 1: months 1-4, Phase 2: months 5-8, Phase 3: months 9-12' — a separate FitCore proposal cites a 3-month MVP timeline; these two timelines conflict — see Open Questions §31.2).

# **27\. Assumptions**

Reproduced from the full SRS; all remain relevant context for Phase 1 even where they reference later phases.

● GymOS (the detailed Role Function List / Business Rules / Workflow document set) represents the current, authoritative functional scope, and the FitCore business proposal represents an earlier or parallel business-case document covering a related but not identical concept. This SRS treats GymOS as primary and flags material FitCore-only content as Open Questions rather than silently merging it in.

● Biometric data is stored as a non-reversible token/template rather than a raw image, consistent with common industry practice, though this is not explicitly confirmed in source material.

● 'On-time' cancellations (outside the configured cancellation window) do not incur a pack deduction, by inference from the fact that only 'late' cancellations are explicitly documented as deducting a session (BR-PT005). This is not explicitly stated for the on-time case.

● New members register through Gym Owner (or SuperAdmin) assistance rather than a fully self-service app sign-up flow, based on every documented registration workflow (MEM-01, WF-M1, WF-O2, O3) beginning with an Admin action.

● Trainer pay rates and off-shift premiums are expressed as percentages of the session fee, based on the illustrative examples given (e.g., 'Level 1 base rate 40%'); actual default values are explicitly stated in source material to be configurable and are not yet set.

● The GDPR-aligned language in the FitCore risk analysis reflects a general data-protection aspiration/best-practice reference rather than a confirmed legal compliance obligation, since Sri Lanka (the stated initial target market) is not within GDPR's jurisdiction.

● A member has exactly one active private trainer hire (Phase 1, FR-082/FR-083) at a time; the system does not currently need to support concurrent hires with multiple trainers. This is an assumption pending confirmation (Open Questions Q-15).

● Phase 1 attendance streaks (BR-GAM001/002) are calculated from PT session attendance rather than gym check-ins, since biometric check-in is deferred to Phase 3\. This is an assumption pending confirmation (Open Questions Q-14).

# **28\. Dependencies (Phase 1\)**

## **28.1 Internal Dependencies**

● Product Owner / Founder availability to confirm the numerous \[TBD\]/\[To Be Confirmed\] items listed throughout this document, especially Section 31\.

● Development/IT Team capacity aligned to the phased scope (Phase 1 MVP → Phase 2 Engagement → Phase 3 AI & Scale).

## **28.2 External Dependencies**

● Payment gateway providers (Stripe and/or PayHere, and possibly iPay) — account setup, sandbox access, and merchant approval.

● Accounting software providers (Xero, QuickBooks) — API access/developer accounts.

## **28.3 APIs**

● All integrations listed in Section 16\.

## **28.4 Third-Party Services**

● SMS gateway and email service provider — vendor selection is outstanding (see Open Questions).

## **28.5 Teams / Personnel**

● QA/Test team to validate against Sections 24-25 once technical design is complete.

● Legal/compliance input to resolve data-protection and payment-compliance questions (Section 20, Section 31).

## **28.6 Infrastructure**

● Hosting/cloud infrastructure decision (currently \[TBD\], see Section 22).

## **28.7 Data Dependencies**

● Existing member data at gyms migrating from spreadsheets/WhatsApp (for data import, if in scope — see Section 26).

# **29\. Constraints**

| Type | Detail |
| :---- | :---- |
| Technical | No technology stack has been mandated by the Product Owner in source material; the Development Team has latitude here, but must satisfy the data model (Section 15\) and functional requirements (Section 9). |
| Business | The product is explicitly designed around a percentage-of-fee trainer pay model with in-shift/off-shift differentiation — this is a foundational business rule, not a configurable architecture choice, and should be treated as a hard constraint on the payroll module's design. |
| Budget | \[TBD\] No development budget is specified in the GymOS documents. The FitCore business proposal contains pricing/revenue projections for a related but distinct product concept and should not be assumed to apply directly to GymOS's development budget. |
| Timeline | Conflicting timeline signals exist between source documents: GymOS's own Project Scope & Workflow Map states a 12-month, 3-phase plan (Phase 1: months 1-4, Phase 2: months 5-8, Phase 3: months 9-12); the FitCore business proposal separately cites a 3-month MVP timeline for a related concept. These are not reconciled in source material — see Open Questions §31.2. |
| Resource | \[TBD\] No specific team composition, headcount, or role allocation is specified. |
| Platform | Confirmed: exactly two client applications — one Web Dashboard, one Mobile App (see Section 8.5, Section 22.9). Confirmed build order: Web Dashboard first, Mobile App second. This is a hard sequencing constraint on Phase 1 delivery, not just a technical preference. Specific mobile OS support (iOS/Android, minimum versions) is \[TBD\]. |

# **30\. Risks (Phase 1\)**

6 of the full SRS's 8 risks apply to Phase 1 (biometric hardware failure and AI Agent hallucination risk are Phase 3 and excluded here).

| Risk ID | Risk | Probability | Impact | Mitigation | Owner | Status |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| R-01 | Low internet connectivity at some gym locations disrupts payment processing and PT session QR flows (Phase 1); will also affect biometric check-in once built (Phase 3\) | Medium | High | Offline-capable/retry-friendly session and payment flows; QR-code session lifecycle already provides a lighter-weight mechanism than biometric hardware for Phase 1 (carried forward from FitCore risk analysis as a Recommendation — not yet confirmed as a GymOS technical requirement) | Development/IT Team | Open — needs technical design confirmation |
| R-03 | Conflicting source documents (FitCore vs. GymOS) lead to scope ambiguity for developers | High | High | This SRS flags all material conflicts under Open Questions (Section 31\) rather than silently resolving them; Product Owner sign-off required before development of affected areas begins | Product Owner | Open — requires Product Owner confirmation |
| R-04 | Undefined technology stack delays technical design and estimation | Medium | Medium | Early technical design workshop between Product Owner and Development/IT Team to select stack, informed by Sections 9 and 15 of this SRS | Development/IT Team | Open |
| R-05 | Payment gateway downtime or integration failure blocks membership/pack purchases and check-in-adjacent revenue flows | Low | Medium | Confirm whether dual-gateway redundancy (Stripe \+ PayHere) is intended, as suggested (but not confirmed) by their joint appearance in workflow documents | Development/IT Team | Open — see Open Questions §31.3 |
| R-06 | Health-adjacent member data (medical/health notes, FR-003) handled without a confirmed data-protection/compliance policy | Medium | High | Confirm applicable data-protection law (e.g., Sri Lanka's Personal Data Protection Act) and define a formal data classification/handling policy before this data is collected at scale | Product Owner / Legal | Open — see Section 20 and Open Questions Q-07 |
| R-08 | Slow gym-owner adoption of a new system replacing manual/WhatsApp-based processes (a risk explicitly identified in the FitCore business case for the underlying market) | Medium | Medium | Structured onboarding, training, and (per FitCore) trial/demo periods — Recommendation carried from business case, applicability to GymOS's own onboarding process TBD | Product Owner / Gym Owner | Open |

# **31\. Open Questions / Items Requiring Confirmation (Phase 1\)**

13 of the full SRS's 15 open questions are relevant to Phase 1 planning (questions purely about Phase 3 biometric modality/vendor selection are excluded here — see the Phase 3 SRS).

| Q ID | Question / Issue | Related Requirement(s) | Why Confirmation Is Needed | Decision Owner | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Q-01 | Is 'GymOS' a rebrand/evolution of the 'FitCore' business proposal, or are they two distinct products/initiatives? | Project Name (Doc Control), overall scope (Section 5\) | The two document sets describe materially different feature sets, tier names, and branding for what appears to be the same underlying business concept (a Sri-Lanka-first gym management SaaS). Development cannot proceed confidently on a single scope baseline until this is resolved. | Founder / Product Owner | Open — flagged, not resolved |
| Q-02 | What is the confirmed development timeline? | Section 26 (Deployment), Section 29 (Constraints) | GymOS's own Scope document states a 12-month, 3-phase plan; the FitCore proposal separately states a 3-month MVP. These cannot both be the plan for the same deliverable. | Founder / Product Owner | Open |
| Q-03 | Which payment gateway(s) are confirmed for production: Stripe, PayHere, iPay, or a combination? | FR-018, FR-019, Section 16 Integrations | GymOS workflow documents name Stripe and PayHere together in the same flow (MEM-06); the FitCore proposal names PayHere and iPay (no Stripe). It is unclear whether all three, or a subset, are intended. | Founder / Product Owner | Open |
| Q-04 | Is WhatsApp notification integration in scope? | Section 16, Section 17 (Notifications) | WhatsApp integration is a headline feature of the FitCore business proposal ('WhatsApp-first', 'WhatsApp-integrated notifications') but is entirely absent from the GymOS Role Function List, Business Rules, and Workflow documents, which specify only push notifications and SMS. | Founder / Product Owner | Open |
| Q-05 | What are the actual default values for trainer pay rates (Level 1 base %, Level 2 base %, off-shift premium %)? | BR-PAY001-004, FR-051 | Source material explicitly states these are placeholders ('the actual rates for your gym will be set by the owner... and will be confirmed separately'). | Founder / Product Owner | Open — explicitly deferred in source material |
| Q-07 | Does any data-protection compliance regime (Sri Lanka's Personal Data Protection Act, GDPR, or other) formally apply to this system? | Section 20 (Security), Section 29 (Constraints) | FitCore's risk analysis mentions a 'GDPR-aligned' policy aspiration, but GDPR is an EU regulation; no explicit, confirmed compliance obligation is stated anywhere in source material. | Founder / Product Owner | Open |
| Q-08 | Is a hardware installation / data-migration onboarding process (site survey, kiosk install, spreadsheet import, hypercare) part of the GymOS deployment scope? | Section 26 (Deployment & Release) | This detailed 8-step onboarding process appears only in the FitCore business proposal; GymOS's own OWN-05 configuration workflow describes only software-side setup. | Founder / Product Owner | Open |
| Q-09 | What subscription tier names and feature-gating are final: FitCore's Starter/Professional/Elite, or GymOS's Starter/Growth/Pro/Enterprise? | Section 5 (Scope), FR-079 | The two document sets use different tier names and, in places, different feature-to-tier mappings (e.g., multi-branch support, AI features, in-app shop/POS appear only in the FitCore tier table). | Founder / Product Owner | Open |
| Q-10 | What SMS gateway and email service provider will be used? | Section 16, Section 17 | No specific vendor is named in any source document despite SMS/email being functionally required across many notification rules. | Founder / Product Owner / Development Team | Open |
| Q-12 | What technology stack (frontend, backend, database, hosting) will be used? | Section 22 (Technical Requirements) | No source document specifies any technical architecture decision. | Development/IT Team / Product Owner | Open |
| Q-13 | What are target concurrent-user and transaction-volume figures for capacity planning? | Section 23 (Performance) | No technical load targets are specified; FitCore's revenue/gym-count projections are business/market figures, not system-capacity requirements. | Founder / Product Owner / Development Team | Open |
| Q-14 | Now that biometric gym-door check-in is deferred to Phase 3, should Phase 2 attendance streaks (BR-GAM001/002) be based on PT session attendance (FR-013 data) only, or should some other attendance signal be defined? | FR-031, FR-013, Section 12 (Gamification Rules) | The source business rules define the weekly streak target as "check-ins," which originally meant biometric gym-door check-ins. This SRS defaults to PT-session-based streaks for Phase 2 (built on FR-013's session history) as the closest available signal, but this is an assumption, not a confirmed decision. | Founder / Product Owner | Open — new in this revision |
| Q-15 | Can a member have more than one active private trainer at a time (Phase 1 Private Trainer Hire), or exactly one? | FR-082, FR-083 | Source direction introduced this feature in this revision without specifying cardinality; the current build assumes one active hire at a time is the simpler default but does not enforce it. | Founder / Product Owner | Open — new in this revision |

# **32\. Traceability Matrix (Phase 1\)**

Only the Phase 1 objectives (OBJ-01–OBJ-04) are shown. The full SRS's traceability matrix (Section 32 there) covers all ten objectives across all three phases.

| Objective | Description | Functional Requirement(s) | User Story(ies) | Acceptance Criteria Ref. | Test Coverage |
| :---- | :---- | :---- | :---- | :---- | :---- |
| OBJ-01 | Private Trainer Hire (Phase 1\) | FR-082, FR-083, FR-084, FR-085 | US-026, US-027 | (Private Trainer Hire covered under Overall System AC) | UC-16; Unit \+ System Testing |
| OBJ-02 | Automate PT session lifecycle & billing | FR-014 – FR-017 | US-003, US-004, US-005 | PT Session Lifecycle AC (Sec. 24\) | Unit \+ Integration \+ System Testing (UC-03, UC-04) |
| OBJ-03 | Real-time financial visibility | FR-066 – FR-070 | US-020 | Financial Management AC (Sec. 24\) | Integration Testing (Xero/QuickBooks); UAT |
| OBJ-04 | Trainer tools & automated pay | FR-034 – FR-046 | US-011, US-012, US-013, US-014, US-015 | Trainer Payroll AC (Sec. 24\) | Unit Testing (pay formulas); UC-10; Regression Testing |

# **33\. Glossary**

Reproduced in full from the master SRS, including terms for later-phase concepts (e.g., Marketplace, Wearable) that are referenced in this document's Open Questions and Out-of-Scope sections for context.

| Term | Definition |
| :---- | :---- |
| AI Agent | The Owner-facing intelligence layer (Phase 3\) providing natural-language Q\&A, automated weekly management accounts, anomaly detection, and forecasting. |
| AI Coach | The Member-facing chat assistant (Phase 3), enabled per-client by a trainer, constrained to plan-based responses and barred from giving medical/injury advice. |
| At-Risk / Lapsed / Active (churn bands) | The three churn-score bands: Active (0-39), At-Risk (40-69), Lapsed (70-100), each triggering different automated retention behaviour. |
| Biometric Check-in | Gym entry authenticated via face or fingerprint scan at a kiosk device. |
| Churn Score | A 0-100 score recalculated weekly per member from weighted engagement/attendance signals, used to predict and act on attrition risk. |
| Deferred Revenue | The value of a purchased session pack recorded as a liability/deferred item until the corresponding sessions are actually consumed. |
| SuperAdmin | The system owner / super-admin role, currently operated by the internal development team, with unrestricted access across all gyms (tenants) on the platform. |
| In-Shift / Off-Shift | Classification of a PT session based on whether its start time falls within (in-shift) or outside (off-shift) the trainer's configured shift hours; off-shift sessions earn a pay premium. |
| Level 1 / Level 2 (Trainer) | The two trainer pay tiers, each with its own configurable base pay rate. |
| Marketplace (Trainer Marketplace) | The Phase 2, public in-app directory allowing members to discover and request a trainer via browsing/filtering/ratings, independent of Owner assignment. |
| Private Trainer Hire | The Phase 1, simplified hire flow: a member selects a specific trainer from a plain list (no public ratings/filters) and sends a direct hire request, establishing a private trainer-client relationship once accepted. |
| No-Show | A scheduled PT session where the member does not scan the start QR by the scheduled time; results in a pack deduction and no trainer pay. |
| Onboarding Journey | The automated 30-day sequence of welcome content and milestone prompts triggered on membership activation. |
| Pack (Session Pack) | A prepaid bundle of PT sessions purchased by a member, consumed one session at a time. |
| P\&L | Profit & Loss — revenue minus expenses (including trainer payroll) equals net profit, for a given period. |
| PT | Personal Training / Personal Trainer, depending on context. |
| QR Session Lifecycle | The start/end mechanism for a PT session: the member scans a QR code to start (begins timer, notifies trainer) and again to end (subject to a minimum duration, triggers billing). |
| Re-engagement Sequence | The automated, time-staged set of notifications (push/SMS/AI-personalised message) sent to At-Risk or Lapsed members. |
| SaaS | Software as a Service — the commercial delivery model for GymOS, billed on a recurring (monthly/annual) subscription basis per gym (tenant). |
| Streak | A count of consecutive weeks in which a member has met their configured weekly visit target. |
| Tenant | A single gym (or multi-branch group) operating within the shared, multi-tenant GymOS platform, with data isolated from other tenants. |
| Wearable | A connected fitness device (Apple Watch/Health, Google Fit, Fitbit, Garmin, WHOOP) supplying recovery, heart-rate, sleep, and activity data (Phase 3). |
| LKR | Sri Lankan Rupee — the currency referenced throughout the FitCore business proposal for pricing. |
| MVP | Minimum Viable Product. |
| RBAC | Role-Based Access Control. |
| SLA | Service Level Agreement. |
| KPI | Key Performance Indicator. |

# **34\. Appendices**

## **Appendix A — Source Documents**

● FitCore Software Project Proposal (Business Proposal), May 2025 — Document Reference: FTC-BP-2025-001.

● GymOS | Role Function List | v2.0 — Document 1 of 3\.

● GymOS | Business Rules & Logic | v2.0 — Document 2 of 3\.

● GymOS | Project Scope & Workflow Map | v2.0 — Document 3 of 3\.

● GymOS | Role Workflows & Feature Guide | v2.0.

● GymOS | Workflow & Process Flow Document | v2.0.

● The full GymOS SRS v1.0 (all phases) — the master document this Phase 1 document was filtered from.

## **Appendix B — Notation Conventions**

● \[TBD\] — Not specified anywhere in supplied source material; requires a new decision.

● \[To Be Confirmed\] — Referenced or implied in source material, but not stated with enough certainty to treat as final.

● \[Assumption\] — A reasonable inference made to allow the document to proceed; must be validated.

● \[Recommendation\] — A suggested approach that is not yet an agreed GymOS requirement.

## **Appendix C — How This Document Relates to the Full SRS**

This document is generated by filtering the full GymOS SRS (all 35 sections, all phases) down to Phase 1 content only, using each requirement's explicit phase tag. All IDs (FR-XXX, US-XXX, UC-XX, BR-XXX, OBJ-XX, Q-XX, R-XX) are preserved unchanged from the full SRS, so a Phase 2 or Phase 3 companion document — or the full SRS itself — can be cross-referenced by ID without ambiguity. If a requirement's phase status changes, update it in the full SRS first and regenerate this document from it, rather than editing this document independently.

# **35\. Requirements Completeness Review (Phase 1\)**

## **35.1 Missing Information**

● No confirmed technology stack (frontend, backend, database, hosting) exists yet (Section 22).

● No confirmed default values for trainer pay rates or cancellation window (Section 23.1 notes which values are illustrative-only).

● No confirmed SMS gateway or email service provider (Section 16).

● No performance/capacity targets (concurrent users, transaction volume) exist for technical capacity planning (Section 23.2).

● Cardinality of Private Trainer Hire (one trainer at a time vs. multiple) is unconfirmed (Open Questions Q-15).

## **35.2 Ambiguous Requirements**

● Whether SuperAdmin actions taken on behalf of a Gym Owner should be distinguished in the audit log from the Gym Owner's own actions (Section 7, Section 20).

● Exact validation rules, error copy, and success messaging for most screens are not specified in source material (Section 14).

## **35.3 Conflicting Requirements**

● FitCore vs. GymOS naming, tier structure, and payment-gateway conflicts remain unresolved at the source-document level (Section 31, Q-01, Q-03, Q-09) — these affect Phase 1 directly since Phase 1 includes payments and subscription management.

## **35.4 Requirements Needing Confirmation**

See Section 31 (Open Questions) — 13 items are relevant to Phase 1 planning.

## **35.5 Recommended Next Steps Before Phase 1 Development Begins**

● 1\. Confirm default configuration values (pay rates, cancellation window) with the Product Owner.

● 2\. Run a technical design workshop to select the technology stack and confirm the API-first approach described in Section 22.9.

● 3\. Confirm payment gateway(s) (Stripe/PayHere/iPay), SMS/email providers (Section 16).

● 4\. Confirm Private Trainer Hire cardinality (Q-15) before building the client-relationship data model.

● 5\. Begin the Web Dashboard build per the sequencing in Section 22.9.3, with backend endpoints designed to also serve the Mobile App from day one.

