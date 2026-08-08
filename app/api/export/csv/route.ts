import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user || (session.user.role !== "GYM_OWNER" && session.user.role !== "SUPER_ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const gymId = session.user.gymId
  if (!gymId) {
    return new NextResponse("No gym assigned", { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "financials"
  const startDateStr = searchParams.get("startDate")
  const endDateStr = searchParams.get("endDate")

  const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endDate = endDateStr ? new Date(endDateStr) : new Date()

  if (type === "payroll") {
    const payRecords = await prisma.payRecord.findMany({
      where: {
        payPeriod: {
          gymId,
          startDate: { gte: startDate },
          endDate: { lte: endDate },
        },
      },
      include: {
        trainer: true,
        payPeriod: true,
        session: true,
      },
      orderBy: { createdAt: "desc" },
    })

    let csv = "Record ID,Trainer Name,Trainer Level,Pay Period Status,Amount,Shift Status,Description,Date\n"
    payRecords.forEach((r) => {
      const shift = r.session?.shiftStatus || "IN_SHIFT"
      csv += `"${r.id}","${r.trainer.fullName}","${r.trainer.trainerLevel}","${r.payPeriod.status}",${r.amount},"${shift}","${r.description || ""}","${r.createdAt.toISOString()}"\n`
    })

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="payroll-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  // Financials Export (Revenues & Expenses)
  const revenues = await prisma.revenueRecord.findMany({
    where: { gymId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  })

  const expenses = await prisma.expenseRecord.findMany({
    where: { gymId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  })

  let csv = "--- REVENUE RECORDS ---\n"
  csv += "ID,Category,Amount,Description,Date\n"
  revenues.forEach((r) => {
    csv += `"${r.id}","${r.category}",${r.amount},"${r.description || ""}","${r.date.toISOString()}"\n`
  })

  csv += "\n--- EXPENSE RECORDS ---\n"
  csv += "ID,Category,Amount,Recurring,Description,Date\n"
  expenses.forEach((e) => {
    csv += `"${e.id}","${e.category}",${e.amount},${e.isRecurring},"${e.description || ""}","${e.date.toISOString()}"\n`
  })

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="financial-report-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
