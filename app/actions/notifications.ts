"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getUserNotifications() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { notifications: [], unreadCount: 0 }
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const unreadCount = await prisma.notification.count({
    where: { recipientId: userId, isRead: false },
  })

  return { notifications, unreadCount }
}

export async function markNotificationAsRead(id: string) {
  const session = await auth()
  if (!session?.user?.id) return

  // Scoped by recipient — updateMany simply affects nothing when the id
  // belongs to someone else, rather than marking another user's alert read.
  await prisma.notification.updateMany({
    where: { id, recipientId: session.user.id },
    data: { isRead: true },
  })
}

export async function markAllNotificationsAsRead() {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, isRead: false },
    data: { isRead: true },
  })
}
