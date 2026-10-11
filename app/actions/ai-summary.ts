"use server"

/**
 * app/actions/ai-summary.ts
 *
 * Server Action: generateWeeklyFinancialSummary
 *
 * Flow:
 *   1. Authorize — only GYM_OWNER / SUPER_ADMIN may call this.
 *   2. Aggregate last 7 days of revenue (by category) and expenses (by
 *      category) from Prisma, plus PT session counts and totals.
 *   3. Build a structured JSON payload and pass it to gemini-3.8-flash
 *      via the Interactions API with an executive-summary system instruction.
 *   4. Return { markdown } on success or { error } on failure so the UI can
 *      handle both branches without crashing.
 *
 * Design decisions:
 *   - store: false — these are one-shot analytical prompts; we do not want
 *     interaction history to accumulate in the Gemini service.
 *   - We use gemini-3.8-flash: fast, cost-effective, 1M-token context.
 *     Swapping to gemini-3.1-pro-preview is a single string change if you want
 *     deeper reasoning.
 *   - Financial numbers are pre-aggregated here (not sent as raw rows) to
 *     minimize prompt size and keep latency low.
 *   - The gymId param is accepted but the authorize() call re-derives the
 *     gym from the session, so a caller cannot pass an arbitrary gymId to
 *     read another gym's finances.
 */

import { prisma } from "@/lib/prisma"
import { gemini } from "@/lib/gemini"
import { authorizeOrThrow } from "@/lib/authz"
import { Role, RevenueCategory, SessionStatus } from "@prisma/client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FinancialSummaryResult =
  | { markdown: string; generatedAt: string; windowStart: string; windowEnd: string }
  | { error: string }

interface WeeklyFinancialData {
  periodStart: string
  periodEnd: string
  revenue: {
    membership: number
    ptSession: number
    addOn: number
    total: number
  }
  expenses: {
    byCategory: Record<string, number>
    total: number
  }
  ptSessions: {
    completed: number
    cancelled: number
    missed: number
    totalFees: number
    averageFee: number
  }
  netProfit: number
  profitMarginPct: number
}

// ---------------------------------------------------------------------------
// Data aggregation
// ---------------------------------------------------------------------------

async function aggregateWeeklyData(gymId: string): Promise<WeeklyFinancialData> {
  const now = new Date()

  // UTC window: from midnight 7 days ago through end of today (23:59:59.999 UTC)
  const windowEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  )
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7, 0, 0, 0, 0)
  )

  // --- Revenue ---
  const revenues = await prisma.revenueRecord.findMany({
    where: {
      gymId,
      date: { gte: windowStart, lte: windowEnd },
    },
    select: { amount: true, category: true },
  })

  let membershipRev = 0
  let ptSessionRev = 0
  let addOnRev = 0

  for (const r of revenues) {
    if (r.category === RevenueCategory.MEMBERSHIP) membershipRev += r.amount
    else if (r.category === RevenueCategory.PT_SESSION) ptSessionRev += r.amount
    else if (r.category === RevenueCategory.ADD_ON) addOnRev += r.amount
  }

  const totalRevenue = membershipRev + ptSessionRev + addOnRev

  // --- Expenses ---
  const expenses = await prisma.expenseRecord.findMany({
    where: {
      gymId,
      date: { gte: windowStart, lte: windowEnd },
    },
    select: { amount: true, category: true },
  })

  const expensesByCategory: Record<string, number> = {}
  for (const e of expenses) {
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount
  }
  const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0)

  // --- PT Session Counts ---
  const sessions = await prisma.pTSession.findMany({
    where: {
      gymId,
      scheduledAt: { gte: windowStart, lte: windowEnd },
      status: {
        in: [SessionStatus.COMPLETED, SessionStatus.CANCELLED, SessionStatus.MISSED],
      },
    },
    select: { status: true, fee: true },
  })

  let completedCount = 0
  let cancelledCount = 0
  let missedCount = 0
  let completedFees = 0

  for (const s of sessions) {
    if (s.status === SessionStatus.COMPLETED) {
      completedCount++
      completedFees += s.fee
    } else if (s.status === SessionStatus.CANCELLED) {
      cancelledCount++
    } else if (s.status === SessionStatus.MISSED) {
      missedCount++
    }
  }

  const avgFee = completedCount > 0 ? completedFees / completedCount : 0
  const netProfit = totalRevenue - totalExpenses
  const profitMarginPct =
    totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0

  return {
    periodStart: windowStart.toISOString().split("T")[0],
    periodEnd: windowEnd.toISOString().split("T")[0],
    revenue: {
      membership: Math.round(membershipRev * 100) / 100,
      ptSession: Math.round(ptSessionRev * 100) / 100,
      addOn: Math.round(addOnRev * 100) / 100,
      total: Math.round(totalRevenue * 100) / 100,
    },
    expenses: {
      byCategory: Object.fromEntries(
        Object.entries(expensesByCategory).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),
      total: Math.round(totalExpenses * 100) / 100,
    },
    ptSessions: {
      completed: completedCount,
      cancelled: cancelledCount,
      missed: missedCount,
      totalFees: Math.round(completedFees * 100) / 100,
      averageFee: Math.round(avgFee * 100) / 100,
    },
    netProfit: Math.round(netProfit * 100) / 100,
    profitMarginPct,
  }
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(data: WeeklyFinancialData): string {
  return `
You are a senior management accountant preparing a concise executive briefing for a gym owner.

Analyse the following weekly financial data and write a short Management Accounts summary in Markdown.

**Requirements:**
- 3–5 paragraphs maximum.
- Lead with a single-sentence overall verdict (positive, neutral, or concerning).
- Call out any anomalies — e.g. spikes or drops in membership revenue, unusually high PT session cancellations or no-shows, expense categories that look outsized, or a poor profit margin.
- End with 2–3 actionable recommendations the owner should consider this coming week.
- Use Markdown formatting: bold key figures, use bullet points for recommendations.
- Keep the tone professional but direct — no filler phrases.

**Raw Financial Data (last 7 days — ${data.periodStart} to ${data.periodEnd}):**

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
`.trim()
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

// gymId is accepted so the call site is explicit, but the actual gym used
// is always derived from the authenticated session (see authorizeOrThrow).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateWeeklyFinancialSummary(
  gymId: string
): Promise<FinancialSummaryResult> {
  // 1. Authorise — re-derives gymId from the session
  let auth: Awaited<ReturnType<typeof authorizeOrThrow>>
  try {
    auth = await authorizeOrThrow([Role.GYM_OWNER, Role.SUPER_ADMIN])
  } catch {
    return { error: "You are not authorised to generate financial summaries." }
  }

  // 2. Aggregate financial data
  let data: WeeklyFinancialData
  try {
    data = await aggregateWeeklyData(auth.gymId)
  } catch (err) {
    console.error("[ai-summary] DB aggregation failed:", err)
    return { error: "Failed to load financial data from the database." }
  }

  // 3. Guard: GEMINI_API_KEY must be configured
  if (!process.env.GEMINI_API_KEY) {
    console.error("[ai-summary] GEMINI_API_KEY is not set.")
    return {
      error:
        "AI summary is not configured. Ask your administrator to add GEMINI_API_KEY to the environment.",
    }
  }

  // 4. Call Gemini
  try {
    const interaction = await gemini.interactions.create({
      model: "gemini-3.8-flash",
      // Do not persist this interaction — financial data should not be stored
      // in Gemini's servers any longer than necessary.
      store: false,
      system_instruction:
        "You are a senior management accountant. Write concise, professional executive summaries in Markdown. Never invent numbers — only reference the data provided.",
      input: buildPrompt(data),
    })

    const markdown = interaction.output_text

    if (!markdown) {
      return {
        error:
          "The AI returned an empty response. Please try again in a moment.",
      }
    }

    return {
      markdown,
      generatedAt: new Date().toISOString(),
      windowStart: data.periodStart,
      windowEnd: data.periodEnd,
    }
  } catch (err) {
    // Distinguish API quota / network errors from unexpected crashes
    const message =
      err instanceof Error ? err.message : "Unknown error communicating with the AI service."

    console.error("[ai-summary] Gemini API call failed:", err)

    // Surface a user-friendly message; keep the technical detail in the log.
    if (message.toLowerCase().includes("quota")) {
      return { error: "AI quota exceeded. Please try again later." }
    }
    if (message.toLowerCase().includes("api key")) {
      return { error: "Invalid Gemini API key. Check your GEMINI_API_KEY environment variable." }
    }

    return {
      error: `AI summary could not be generated: ${message}`,
    }
  }
}

