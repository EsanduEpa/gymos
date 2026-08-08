import { prisma } from "@/lib/prisma";
import { AuditActionType } from "@prisma/client";

interface AuditLogParams {
  userId: string;
  gymId: string;
  actionType: AuditActionType;
  affectedRecordId: string;
  details?: Record<string, any>;
}

export async function logAudit(params: AuditLogParams) {
  return await prisma.auditLog.create({
    data: {
      userId: params.userId,
      gymId: params.gymId,
      actionType: params.actionType,
      affectedRecordId: params.affectedRecordId,
      details: params.details ? JSON.stringify(params.details) : null,
    },
  });
}
