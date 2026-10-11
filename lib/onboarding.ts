/**
 * lib/onboarding.ts
 *
 * 30-day member onboarding sequence.
 *
 * Responsibilities:
 *   1. Define the milestone schedule (days + copy).
 *   2. Query the DB for members whose account age matches a milestone today.
 *   3. Persist an in-app Notification record for each member.
 *   4. Mock the transactional email (console.log stub — replace with your
 *      mailer of choice: Resend, SendGrid, Postmark, etc.).
 *
 * Intentional design decisions:
 *   - Date math is done purely in UTC so the cron firing at 08:00 UTC maps
 *     cleanly to "start of day" regardless of member timezone.
 *   - We match createdAt in a [start, end) half-open window rather than
 *     exact-equality so a member who joined at 14:37 is still caught by the
 *     midnight → midnight window of exactly N days ago.
 *   - Notifications are written inside a loop rather than a bulk createMany so
 *     that a single bad record does not abort the whole batch.
 *   - Failed email sends are logged but do not throw — the in-app notification
 *     is the source of truth; email is best-effort.
 */

import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Milestone definitions
// ---------------------------------------------------------------------------

export interface OnboardingMilestone {
  /** Calendar day offset from the member's account creation date. */
  day: number;
  /** Short in-app notification title. */
  title: string;
  /** In-app notification body copy. */
  message: string;
  /** Relative URL the notification pill links to inside the dashboard. */
  linkUrl: string;
  /** Email subject line (used by sendOnboardingEmail). */
  emailSubject: string;
  /** Plain-text email body (mock). In production, replace with an HTML template. */
  emailBody: (name: string) => string;
}

export const ONBOARDING_MILESTONES: OnboardingMilestone[] = [
  {
    day: 1,
    title: "Welcome to GymOS! 🎉",
    message:
      "Your account is live. Explore the member dashboard and set your fitness goals for the month.",
    linkUrl: "/member/dashboard",
    emailSubject: "Welcome to GymOS — let's get moving!",
    emailBody: (name) =>
      `Hi ${name},\n\nWelcome to GymOS! Your account is all set up.\n` +
      `Head to your dashboard to explore everything available to you.\n\n` +
      `We're excited to be part of your fitness journey.\n\nThe GymOS Team`,
  },
  {
    day: 3,
    title: "Book Your First PT Session 📅",
    message:
      "Day 3 already! Have you met your trainer yet? Book a Personal Training session to kick-start your routine.",
    linkUrl: "/member/sessions",
    emailSubject: "Day 3: Time to book your first PT session",
    emailBody: (name) =>
      `Hi ${name},\n\nYou've been with us for 3 days — great start!\n\n` +
      `Booking a Personal Training session is the single biggest thing you can do to ` +
      `accelerate your results. Browse available trainers and lock in your first slot.\n\n` +
      `See you on the gym floor!\nThe GymOS Team`,
  },
  {
    day: 7,
    title: "One Week Strong 💪",
    message:
      "You've hit your first week! Check your progress and log this week's body metrics to start tracking your journey.",
    linkUrl: "/member/progress",
    emailSubject: "One week in — here's how to keep the momentum",
    emailBody: (name) =>
      `Hi ${name},\n\nOne week down — that's no small feat.\n\n` +
      `Log your body metrics now so you have a solid baseline to look back on ` +
      `at the end of Month 1. Consistency beats intensity every time.\n\n` +
      `Keep going!\nThe GymOS Team`,
  },
  {
    day: 14,
    title: "Two Weeks In — Check Your Plans 📋",
    message:
      "Halfway through your first month. Review your workout and meal plans — are they still the right fit?",
    linkUrl: "/member/plans",
    emailSubject: "Day 14: Mid-month check-in for you",
    emailBody: (name) =>
      `Hi ${name},\n\nTwo weeks! You're building a real habit.\n\n` +
      `Now is a great time to review your workout and meal plans. Talk to your trainer ` +
      `if anything feels off — that's exactly what they're here for.\n\n` +
      `Proud of you!\nThe GymOS Team`,
  },
  {
    day: 21,
    title: "21 Days — Habit Locked In 🔒",
    message:
      "Science says 21 days builds a habit. Explore the community leaderboard and celebrate with your fellow members!",
    linkUrl: "/member/community",
    emailSubject: "Day 21: Your habit is officially forming",
    emailBody: (name) =>
      `Hi ${name},\n\nResearch suggests it takes about 21 days to form a habit — and you're there!\n\n` +
      `Jump into the GymOS community leaderboard and see how you stack up. ` +
      `Friendly competition is one of the best motivators there is.\n\n` +
      `See you at the top!\nThe GymOS Team`,
  },
  {
    day: 30,
    title: "Month 1 Complete — Your Summary Is Ready 🏆",
    message:
      "30 days done! View your Month 1 progress summary: sessions completed, streaks earned, and body metrics tracked.",
    linkUrl: "/member/progress",
    emailSubject: "Month 1 Summary — look how far you've come",
    emailBody: (name) =>
      `Hi ${name},\n\nWow — 30 days with GymOS. That's a full month!\n\n` +
      `Head to your Progress page to see your Month 1 summary: every session you completed, ` +
      `streaks you earned, and how your body metrics have changed.\n\n` +
      `You've done something most people only talk about. Now let's make Month 2 even better.\n\n` +
      `The GymOS Team`,
  },
];

/** Lookup set of milestone days for fast membership testing. */
export const MILESTONE_DAYS = new Set(ONBOARDING_MILESTONES.map((m) => m.day));

// ---------------------------------------------------------------------------
// Email stub (replace with Resend / SendGrid / Postmark in production)
// ---------------------------------------------------------------------------

/**
 * Mocked transactional email sender.
 *
 * Replace the body of this function with a real API call, for example:
 *
 *   import { Resend } from 'resend';
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({ from: '...', to: email, subject, html: body });
 */
export async function sendOnboardingEmail({
  to,
  name,
  subject,
  body,
  day,
}: {
  to: string;
  name: string;
  subject: string;
  body: string;
  day: number;
}): Promise<void> {
  // ── MOCK ─────────────────────────────────────────────────────────────────
  // body is already interpolated via emailBody(member.fullName) at the call site.
  console.log(
    `[onboarding-email] Day ${day} → ${to} | Subject: "${subject}"\n` +
      `─────────────────────────────────────────\n` +
      body +
      `\n─────────────────────────────────────────`
  );
  // ── END MOCK ─────────────────────────────────────────────────────────────
}

// ---------------------------------------------------------------------------
// Database query
// ---------------------------------------------------------------------------

/**
 * Returns all GYM_MEMBER users whose account was created exactly `daysAgo`
 * calendar days ago (UTC midnight → midnight window).
 *
 * We scope to GYM_MEMBER only — owners and trainers have a different
 * onboarding experience and should not receive these messages.
 */
export async function getMembersJoinedDaysAgo(daysAgo: number) {
  const now = new Date();

  // Build the UTC window: [start of that day, start of the next day)
  const windowStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysAgo,
      0,
      0,
      0,
      0
    )
  );
  const windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000);

  return prisma.user.findMany({
    where: {
      role: "GYM_MEMBER",
      createdAt: {
        gte: windowStart,
        lt: windowEnd,
      },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Core orchestration
// ---------------------------------------------------------------------------

export interface OnboardingRunResult {
  milestone: number;
  processed: number;
  errors: number;
}

/**
 * Processes a single milestone day:
 *   1. Finds all members whose account is exactly `milestone.day` days old.
 *   2. Writes an in-app Notification record for each.
 *   3. Fires the (mocked) transactional email.
 *
 * Returns a summary object for logging / telemetry.
 */
export async function processMilestone(
  milestone: OnboardingMilestone
): Promise<OnboardingRunResult> {
  const members = await getMembersJoinedDaysAgo(milestone.day);

  let processed = 0;
  let errors = 0;

  for (const member of members) {
    try {
      // 1. Persist in-app notification (drives the bell icon in the UI)
      await prisma.notification.create({
        data: {
          recipientId: member.id,
          type: "ONBOARDING",
          title: milestone.title,
          message: milestone.message,
          linkUrl: milestone.linkUrl,
        },
      });

      // 2. Fire transactional email (mocked — swap for real mailer)
      await sendOnboardingEmail({
        to: member.email,
        name: member.fullName,
        subject: milestone.emailSubject,
        body: milestone.emailBody(member.fullName),
        day: milestone.day,
      });

      processed++;
    } catch (err) {
      errors++;
      // Log the individual failure but do not abort the rest of the batch.
      console.error(
        `[onboarding] Failed for member ${member.id} on day ${milestone.day}:`,
        err
      );
    }
  }

  return { milestone: milestone.day, processed, errors };
}

/**
 * Entry point called by the cron route.
 *
 * Iterates every configured milestone, fans out the member queries in
 * parallel, and aggregates results for the response payload.
 */
export async function runOnboardingSequence(): Promise<OnboardingRunResult[]> {
  const results = await Promise.all(
    ONBOARDING_MILESTONES.map((m) => processMilestone(m))
  );

  const total = results.reduce((s, r) => s + r.processed, 0);
  const totalErrors = results.reduce((s, r) => s + r.errors, 0);

  console.log(
    `[onboarding-cron] Run complete — ` +
      `${total} notifications sent, ${totalErrors} errors across ` +
      `${results.length} milestone buckets.`
  );

  return results;
}

