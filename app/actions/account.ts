"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword, passwordSchema, verifyPassword } from "@/lib/passwords"
import { z } from "zod"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "The two new passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Choose a password different from your current one.",
    path: ["newPassword"],
  })

/**
 * Changes the signed-in user's own password.
 *
 * The current password is required even when the account is on a temporary
 * one — the user typed it moments ago to get here, and requiring it means a
 * borrowed session cannot lock the real owner out of their account.
 */
export async function changePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You are not signed in." }
  }

  const validated = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  })
  if (!user) return { error: "Account not found." }

  const currentIsValid = await verifyPassword(validated.data.currentPassword, user.password)
  if (!currentIsValid) {
    return { error: "Your current password is incorrect." }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(validated.data.newPassword),
        mustChangePassword: false,
      },
    })

    // The signed-in token still carries mustChangePassword. Rather than patch
    // it, the caller signs out — the next sign-in mints a clean token and
    // rotates the session, which is what a credential change should do anyway.
    return { success: true }
  } catch (err) {
    console.error("Change password error:", err)
    return { error: "Could not update your password. Try again." }
  }
}
