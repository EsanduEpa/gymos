"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditActionType } from "@prisma/client"

export async function getAuditLogs(params?: { actionType?: string; page?: number }) {
  const session = await auth()
  const gymId = session?.user?.gymId

  if (!gymId) {
    throw new Error("Unauthorized or Gym ID missing")
  }

  const page = params?.page || 1
  const pageSize = 20

  const where: any = { gymId }
  if (params?.actionType && params.actionType !== "ALL") {
    where.actionType = params.actionType as AuditActionType
  }

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  }
}
