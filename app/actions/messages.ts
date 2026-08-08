"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTrainerClients() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Get distinct clients from assigned workout plans, meal plans, or hire requests
  const clients = await prisma.user.findMany({
    where: {
      role: "GYM_MEMBER",
      gymId: session.user.gymId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      photo: true,
    },
  })

  // Get last message for each client
  const clientsWithMessages = await Promise.all(
    clients.map(async (client) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: client.id },
            { senderId: client.id, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "desc" },
      })

      const unreadCount = await prisma.message.count({
        where: {
          senderId: client.id,
          receiverId: userId,
          isRead: false,
        },
      })

      return {
        ...client,
        lastMessage: lastMessage?.content || "No messages yet",
        lastMessageAt: lastMessage?.createdAt || null,
        unreadCount,
      }
    })
  )

  return clientsWithMessages
}

export async function getConversation(clientId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Mark incoming messages as read
  await prisma.message.updateMany({
    where: {
      senderId: clientId,
      receiverId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: clientId },
        { senderId: clientId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  })

  return messages
}

export async function sendMessage(receiverId: string, content: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId || !content.trim()) {
    throw new Error("Invalid request")
  }

  const msg = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId,
      content: content.trim(),
    },
  })

  // Also trigger notification
  await prisma.notification.create({
    data: {
      recipientId: receiverId,
      type: "MESSAGE_RECEIVED",
      title: "New Message",
      message: `You received a message from ${session.user.fullName}`,
      linkUrl: "/trainer/messages",
    },
  })

  revalidatePath("/trainer/messages")
  return msg
}
