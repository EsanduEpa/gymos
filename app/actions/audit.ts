"use server"

import { prisma } from "@/lib/prisma"
import { authorizeOrThrow } from "@/lib/authz"
import { AuditActionType, Role } from "@prisma/client"

export async function getAuditLogs(params?: { actionType?: string; page?: number }) {
  const { gymId } = await authorizeOrThrow([Role.GYM_OWNER, Role.SUPER_ADMIN])

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
