import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authz"
import { CSV_BOM, csvCell, csvNumber, csvRow } from "@/lib/csv"
import { Role } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

function csvResponse(body: string, filename: string) {
  return new NextResponse(CSV_BOM + body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // An export of a gym's finances should never sit in a shared cache.
      "Cache-Control": "no-store",
    },
  })
}

/** Rejects a date that would silently become `Invalid Date` in a query. */
function parseDate(value: string | null, fallback: Date) {
  if (!value) return fallback
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

export async function GET(req: NextRequest) {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) {
    return new NextResponse(auth.error, { status: 403 })
  }
  const { gymId } = auth

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "financials"

  const now = new Date()
  const startDate = parseDate(searchParams.get("startDate"), new Date(now.getFullYear(), now.getMonth(), 1))
  const endDate = parseDate(searchParams.get("endDate"), now)
  const stamp = new Date().toISOString().split("T")[0]

  try {
    if (type === "payroll") {
      const payRecords = await prisma.payRecord.findMany({
        where: {
          payPeriod: {
            gymId,
            startDate: { gte: startDate },
            endDate: { lte: endDate },
          },
        },
        include: { trainer: true, payPeriod: true, session: true },
        orderBy: { createdAt: "desc" },
      })

      let csv = csvRow([
        "Record ID",
        "Trainer Name",
        "Trainer Level",
        "Pay Period Status",
        "Amount",
        "Shift Status",
        "Description",
        "Date",
      ].map(csvCell))

      for (const r of payRecords) {
        csv += csvRow([
          csvCell(r.id),
          csvCell(r.trainer.fullName),
          csvCell(r.trainer.trainerLevel),
          csvCell(r.payPeriod.status),
          csvNumber(r.amount),
          csvCell(r.session?.shiftStatus || "IN_SHIFT"),
          csvCell(r.description),
          csvCell(r.createdAt.toISOString()),
        ])
      }

      return csvResponse(csv, `payroll-report-${stamp}.csv`)
    }

    const [revenues, expenses] = await Promise.all([
      prisma.revenueRecord.findMany({
        where: { gymId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "asc" },
      }),
      prisma.expenseRecord.findMany({
        where: { gymId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "asc" },
      }),
    ])

    let csv = csvRow([csvCell("--- REVENUE RECORDS ---")])
    csv += csvRow(["ID", "Category", "Amount", "Description", "Date"].map(csvCell))
    for (const r of revenues) {
      csv += csvRow([
        csvCell(r.id),
        csvCell(r.category),
        csvNumber(r.amount),
        csvCell(r.description),
        csvCell(r.date.toISOString()),
      ])
    }

    csv += csvRow([])
    csv += csvRow([csvCell("--- EXPENSE RECORDS ---")])
    csv += csvRow(["ID", "Category", "Amount", "Recurring", "Description", "Date"].map(csvCell))
    for (const e of expenses) {
      csv += csvRow([
        csvCell(e.id),
        csvCell(e.category),
        csvNumber(e.amount),
        csvCell(e.isRecurring ? "Yes" : "No"),
        csvCell(e.description),
        csvCell(e.date.toISOString()),
      ])
    }

    return csvResponse(csv, `financial-report-${stamp}.csv`)
  } catch (err) {
    // A database error used to escape as an unhandled rejection, returning a
    // stack trace to the browser.
    console.error("CSV export failed:", err)
    return new NextResponse("Could not generate the export. Try again.", { status: 500 })
  }
}
