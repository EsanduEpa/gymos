"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ExpenseCategory, PayPeriodStatus, RevenueCategory } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function verifyOwnerAuth() {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }
  const gymId = session.user.gymId
  if (!gymId) {
    throw new Error("No gym assigned")
  }
  if (session.user.role !== "GYM_OWNER" && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Gym Owner access required")
  }
  return { session, gymId }
}

const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number"),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  isRecurring: z.coerce.boolean().default(false),
})

const budgetSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
  amount: z.coerce.number().min(0, "Budget cannot be negative"),
  month: z.string().optional(),
})

const manualPaymentSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["MEMBERSHIP", "SESSION_PACK", "ADD_ON"]),
  description: z.string().optional(),
})

// 1. REVENUE OVERVIEW & TRENDS
export async function getRevenueOverview(startDateStr?: string, endDateStr?: string) {
  const { gymId } = await verifyOwnerAuth()

  const now = new Date()
  const startDate = startDateStr ? new Date(startDateStr) : new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = endDateStr ? new Date(endDateStr) : new Date()

  const records = await prisma.revenueRecord.findMany({
    where: {
      gymId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  })

  let totalRevenue = 0
  let membershipRevenue = 0
  let ptSessionRevenue = 0
  let addOnRevenue = 0

  records.forEach((r) => {
    totalRevenue += r.amount
    if (r.category === RevenueCategory.MEMBERSHIP) membershipRevenue += r.amount
    else if (r.category === RevenueCategory.PT_SESSION) ptSessionRevenue += r.amount
    else if (r.category === RevenueCategory.ADD_ON) addOnRevenue += r.amount
  })

  // PT Revenue split by Trainer Level & Premiums
  const completedSessions = await prisma.pTSession.findMany({
    where: {
      gymId,
      status: "COMPLETED",
      scheduledAt: { gte: startDate, lte: endDate },
    },
    include: {
      trainer: true,
    },
  })

  let level1Revenue = 0
  let level2Revenue = 0
  let offShiftPremiumTotal = 0

  completedSessions.forEach((s) => {
    if (s.trainer.trainerLevel === "LEVEL_2") {
      level2Revenue += s.fee
    } else {
      level1Revenue += s.fee
    }
    if (s.shiftStatus === "OFF_SHIFT") {
      offShiftPremiumTotal += s.fee * 0.1 // 10% premium
    }
  })

  // Daily Trend Data for Recharts Line/Area Chart
  const trendMap: Record<string, { date: string; membership: number; pt: number; addOn: number; total: number }> = {}

  records.forEach((r) => {
    const dayKey = r.date.toISOString().split("T")[0]
    if (!trendMap[dayKey]) {
      trendMap[dayKey] = { date: dayKey, membership: 0, pt: 0, addOn: 0, total: 0 }
    }
    trendMap[dayKey].total += r.amount
    if (r.category === RevenueCategory.MEMBERSHIP) trendMap[dayKey].membership += r.amount
    else if (r.category === RevenueCategory.PT_SESSION) trendMap[dayKey].pt += r.amount
    else if (r.category === RevenueCategory.ADD_ON) trendMap[dayKey].addOn += r.amount
  })

  const trendData = Object.values(trendMap)

  return {
    totalRevenue,
    membershipRevenue,
    ptSessionRevenue,
    addOnRevenue,
    level1Revenue,
    level2Revenue,
    offShiftPremiumTotal,
    trendData,
  }
}

// 2. EXPENSE LOGGING & MANAGEMENT
export async function createExpense(formData: FormData) {
  const { gymId } = await verifyOwnerAuth()

  const raw = {
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    isRecurring: formData.get("isRecurring") === "true",
  }

  const validated = expenseSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { amount, category, description, date, isRecurring } = validated.data

  try {
    await prisma.expenseRecord.create({
      data: {
        gymId,
        amount,
        category,
        description,
        date: new Date(date),
        isRecurring,
      },
    })

    revalidatePath("/owner/financials")
    return { success: true }
  } catch (err) {
    console.error("Create expense error:", err)
    return { error: "Failed to log expense" }
  }
}

export async function getExpenses(startDateStr?: string, endDateStr?: string, categoryFilter?: ExpenseCategory) {
  const { gymId } = await verifyOwnerAuth()

  const now = new Date()
  const startDate = startDateStr ? new Date(startDateStr) : new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = endDateStr ? new Date(endDateStr) : new Date()

  const expenses = await prisma.expenseRecord.findMany({
    where: {
      gymId,
      date: { gte: startDate, lte: endDate },
      ...(categoryFilter ? { category: categoryFilter } : {}),
    },
    orderBy: { date: "desc" },
  })

  return expenses
}

// 3. BUDGET VS ACTUAL TRACKING
export async function setCategoryBudget(formData: FormData) {
  const { gymId } = await verifyOwnerAuth()

  const raw = {
    category: formData.get("category"),
    amount: formData.get("amount"),
    month: formData.get("month") || undefined,
  }

  const validated = budgetSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { category, amount, month: monthStr } = validated.data
  const month = monthStr ? new Date(monthStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  try {
    await prisma.categoryBudget.upsert({
      where: {
        gymId_category_month: {
          gymId,
          category,
          month,
        },
      },
      update: { amount },
      create: {
        gymId,
        category,
        amount,
        month,
      },
    })

    revalidatePath("/owner/financials")
    return { success: true }
  } catch (err) {
    console.error("Set budget error:", err)
    return { error: "Failed to update category budget" }
  }
}

export async function getBudgetVsActual(monthStr?: string) {
  const { gymId } = await verifyOwnerAuth()

  const now = new Date()
  const monthStart = monthStr ? new Date(monthStr) : new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59)

  const budgets = await prisma.categoryBudget.findMany({
    where: { gymId, month: monthStart },
  })

  const expenses = await prisma.expenseRecord.findMany({
    where: {
      gymId,
      date: { gte: monthStart, lte: monthEnd },
    },
  })

  const categories = Object.values(ExpenseCategory)
  const report = categories.map((cat) => {
    const budgetObj = budgets.find((b) => b.category === cat)
    const budgetAmount = budgetObj ? budgetObj.amount : 0
    const actualAmount = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0)

    const variance = actualAmount - budgetAmount
    const overBudget = actualAmount > budgetAmount && budgetAmount > 0

    return {
      category: cat,
      budget: budgetAmount,
      actual: actualAmount,
      variance,
      overBudget,
    }
  })

  return report
}

// 4. DEFERRED REVENUE & PACK UTILIZATION
export async function getDeferredRevenue() {
  const { gymId } = await verifyOwnerAuth()

  const activePacks = await prisma.sessionPack.findMany({
    where: {
      user: { gymId },
    },
    include: {
      user: true,
    },
    orderBy: { purchaseDate: "desc" },
  })

  let totalDeferred = 0
  let totalRecognized = 0
  let totalPurchasedSessions = 0
  let totalUsedSessions = 0

  const packBreakdown = activePacks.map((pack) => {
    const price = pack.price || 0
    const total = pack.totalSessions
    const remaining = pack.remainingSessions
    const used = total - remaining

    totalPurchasedSessions += total
    totalUsedSessions += used

    const recognizedValue = total > 0 ? (used / total) * price : 0
    const deferredValue = total > 0 ? (remaining / total) * price : 0

    if (pack.status === "ACTIVE") {
      totalDeferred += deferredValue
    }
    totalRecognized += recognizedValue

    return {
      id: pack.id,
      memberName: pack.user.fullName,
      totalSessions: total,
      usedSessions: used,
      remainingSessions: remaining,
      purchaseDate: pack.purchaseDate,
      totalValue: price,
      recognizedValue,
      deferredValue,
      status: pack.status,
    }
  })

  const utilizationRate =
    totalPurchasedSessions > 0 ? Math.round((totalUsedSessions / totalPurchasedSessions) * 100) : 0

  return {
    totalDeferred,
    totalRecognized,
    utilizationRate,
    packBreakdown,
  }
}

// 5. TRAINER PAYROLL & PAY PERIOD
export async function getCurrentPayPeriodInfo() {
  const { gymId } = await verifyOwnerAuth()

  let period = await prisma.payPeriod.findFirst({
    where: { gymId },
    orderBy: { createdAt: "desc" },
    include: {
      payRecords: {
        include: {
          trainer: true,
          session: true,
        },
      },
    },
  })

  if (!period) {
    const now = new Date()
    period = await prisma.payPeriod.create({
      data: {
        gymId,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        status: PayPeriodStatus.OPEN,
      },
      include: {
        payRecords: {
          include: {
            trainer: true,
            session: true,
          },
        },
      },
    })
  }

  // Aggregate stats per trainer
  const trainers = await prisma.user.findMany({
    where: { gymId, role: "PERSONAL_TRAINER" },
  })

  const payrollSummary = trainers.map((tr) => {
    const records = period.payRecords.filter((r) => r.trainerId === tr.id)
    const sessionsCompleted = records.filter((r) => r.sessionId !== null).length

    let inShiftCount = 0
    let offShiftCount = 0

    records.forEach((r) => {
      if (r.session?.shiftStatus === "OFF_SHIFT") {
        offShiftCount++
      } else {
        inShiftCount++
      }
    })

    const grossPay = records.reduce((sum, r) => sum + r.amount, 0)

    return {
      trainerId: tr.id,
      trainerName: tr.fullName,
      level: tr.trainerLevel || "LEVEL_1",
      sessionsCompleted,
      inShiftCount,
      offShiftCount,
      grossPay,
    }
  })

  return {
    payPeriod: period,
    payrollSummary,
  }
}

export async function closePayPeriod(payPeriodId: string) {
  const { gymId } = await verifyOwnerAuth()

  try {
    await prisma.payPeriod.update({
      where: { id: payPeriodId, gymId },
      data: { status: PayPeriodStatus.CLOSED },
    })

    revalidatePath("/owner/financials")
    return { success: true }
  } catch (err) {
    return { error: "Failed to close pay period" }
  }
}

export async function approvePayPeriod(payPeriodId: string) {
  const { gymId } = await verifyOwnerAuth()

  try {
    await prisma.payPeriod.update({
      where: { id: payPeriodId, gymId },
      data: { status: PayPeriodStatus.APPROVED },
    })

    revalidatePath("/owner/financials")
    return { success: true }
  } catch (err) {
    return { error: "Failed to approve pay period" }
  }
}

// 6. PROFIT & LOSS REPORT (P&L)
export async function generatePnL(startDateStr?: string, endDateStr?: string) {
  const { gymId } = await verifyOwnerAuth()

  const now = new Date()
  const startDate = startDateStr ? new Date(startDateStr) : new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = endDateStr ? new Date(endDateStr) : new Date()

  // Revenue
  const revenues = await prisma.revenueRecord.findMany({
    where: { gymId, date: { gte: startDate, lte: endDate } },
  })

  let membershipRev = 0
  let ptRev = 0
  let addOnRev = 0
  revenues.forEach((r) => {
    if (r.category === "MEMBERSHIP") membershipRev += r.amount
    else if (r.category === "PT_SESSION") ptRev += r.amount
    else if (r.category === "ADD_ON") addOnRev += r.amount
  })
  const totalRevenue = membershipRev + ptRev + addOnRev

  // Expenses
  const expenses = await prisma.expenseRecord.findMany({
    where: { gymId, date: { gte: startDate, lte: endDate } },
  })

  const expenseCategoryTotals: Record<string, number> = {
    RENT: 0,
    UTILITIES: 0,
    EQUIPMENT: 0,
    MARKETING: 0,
    SALARIES: 0,
    MAINTENANCE: 0,
    OTHER: 0,
  }

  expenses.forEach((e) => {
    if (expenseCategoryTotals[e.category] !== undefined) {
      expenseCategoryTotals[e.category] += e.amount
    } else {
      expenseCategoryTotals.OTHER += e.amount
    }
  })

  // Add Trainer Payroll from PayRecords in the date range
  const payRecords = await prisma.payRecord.findMany({
    where: {
      payPeriod: {
        gymId,
        startDate: { gte: startDate },
        endDate: { lte: endDate },
      },
    },
  })
  const trainerPayroll = payRecords.reduce((sum, p) => sum + p.amount, 0)
  expenseCategoryTotals["SALARIES"] += trainerPayroll

  const totalExpenses = Object.values(expenseCategoryTotals).reduce((a, b) => a + b, 0)
  const netProfit = totalRevenue - totalExpenses

  // Period comparison (previous period of same duration)
  const durationMs = endDate.getTime() - startDate.getTime()
  const prevStartDate = new Date(startDate.getTime() - durationMs)
  const prevEndDate = new Date(startDate.getTime() - 1)

  const prevRevenues = await prisma.revenueRecord.findMany({
    where: { gymId, date: { gte: prevStartDate, lte: prevEndDate } },
  })
  const prevTotalRev = prevRevenues.reduce((sum, r) => sum + r.amount, 0)

  const prevExpenses = await prisma.expenseRecord.findMany({
    where: { gymId, date: { gte: prevStartDate, lte: prevEndDate } },
  })
  const prevTotalExp = prevExpenses.reduce((sum, e) => sum + e.amount, 0)
  const prevNetProfit = prevTotalRev - prevTotalExp

  const revChangePct = prevTotalRev > 0 ? Math.round(((totalRevenue - prevTotalRev) / prevTotalRev) * 100) : 0
  const profitChangePct = prevNetProfit !== 0 ? Math.round(((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100) : 0

  return {
    revenue: {
      membership: membershipRev,
      pt: ptRev,
      addOn: addOnRev,
      total: totalRevenue,
    },
    expenses: {
      byCategory: expenseCategoryTotals,
      total: totalExpenses,
    },
    netProfit,
    comparison: {
      revChangePct,
      profitChangePct,
      prevNetProfit,
    },
  }
}

// 7. MANUAL DESK PAYMENT RECORDING
export async function recordManualPayment(formData: FormData) {
  const { gymId } = await verifyOwnerAuth()

  const raw = {
    memberId: formData.get("memberId"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
  }

  const validated = manualPaymentSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { memberId, amount, type, description } = validated.data

  const member = await prisma.user.findUnique({ where: { id: memberId } })
  if (!member) return { error: "Member not found" }

  let category: RevenueCategory = RevenueCategory.ADD_ON
  if (type === "MEMBERSHIP") category = RevenueCategory.MEMBERSHIP
  else if (type === "SESSION_PACK") category = RevenueCategory.PT_SESSION

  try {
    await prisma.revenueRecord.create({
      data: {
        gymId,
        amount,
        category,
        description: description || `Manual Desk Payment - ${member.fullName}`,
        date: new Date(),
      },
    })

    revalidatePath("/owner/financials")
    revalidatePath(`/owner/members/${memberId}`)
    return { success: true }
  } catch (err) {
    console.error("Record manual payment error:", err)
    return { error: "Failed to record manual payment" }
  }
}
