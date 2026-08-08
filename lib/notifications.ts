import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

interface NotificationParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
}

export async function createNotification(params: NotificationParams) {
  return await prisma.notification.create({
    data: params,
  });
}
