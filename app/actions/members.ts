"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { authorize, findUserInGym } from "@/lib/authz"
import { generateTemporaryPassword, hashPassword } from "@/lib/passwords"
import { MemberStatus, Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createMemberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  emergencyContact: z.string().optional(),
  healthNotes: z.string().optional(),
  membershipPlanId: z.string().min(1, "Membership plan selection is required"),
})

export async function createMember(formData: FormData) {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    emergencyContact: (formData.get("emergencyContact") as string) || undefined,
    healthNotes: (formData.get("healthNotes") as string) || undefined,
    membershipPlanId: formData.get("membershipPlanId") as string,
  }

  const validated = createMemberSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { fullName, email, phone, dateOfBirth, emergencyContact, healthNotes, membershipPlanId } =
    validated.data

  // Check unique email
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "A member with this email already exists." }
  }

  // Scoped to this gym — a plan id from another gym must not be attachable.
  const plan = await prisma.membershipPlan.findFirst({
    where: { id: membershipPlanId, gymId },
  })
  if (!plan) return { error: "Invalid membership plan selected." }

  try {
    // Every account used to be created with the same literal password. Now
    // each gets its own single-use one, surfaced to the owner exactly once so
    // they can hand it over — there is no email delivery until M2-2.
    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await hashPassword(temporaryPassword)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + plan.durationDays)

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        mustChangePassword: true,
        fullName,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        emergencyContact,
        healthNotes,
        role: Role.GYM_MEMBER,
        gymId,
        memberStatus: MemberStatus.ACTIVE,
        memberships: {
          create: {
            membershipPlanId: plan.id,
            startDate,
            endDate,
            status: MemberStatus.ACTIVE,
          },
        },
      },
    })

    // Record revenue for membership purchase
    await prisma.revenueRecord.create({
      data: {
        gymId,
        amount: plan.price,
        category: "MEMBERSHIP",
        description: `New Member Registration: ${fullName} (${plan.name})`,
      },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "MEMBER_CREATED",
      affectedRecordId: user.id,
      details: { message: `Registered new member ${fullName} (${email}) under plan ${plan.name}` },
    })

    revalidatePath("/owner/members")
    return { success: true, memberId: user.id, temporaryPassword }
  } catch (err) {
    console.error("Failed to create member:", err)
    return { error: "Failed to create member record." }
  }
}

export async function updateMemberStatus(memberId: string, status: MemberStatus) {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  // Confirm the member is ours before touching them. Without this, an owner
  // could suspend or reactivate a member belonging to any other gym.
  const member = await findUserInGym(gymId, memberId, Role.GYM_MEMBER)
  if (!member) return { error: "Member not found at your gym." }

  try {
    const user = await prisma.user.update({
      where: { id: member.id },
      data: { memberStatus: status },
    })

    // Update active membership status as well
    await prisma.membership.updateMany({
      where: { userId: member.id, status: { not: MemberStatus.EXPIRED } },
      data: { status },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: status === "SUSPENDED" ? "MEMBER_SUSPENDED" : "MEMBER_UPDATED",
      affectedRecordId: member.id,
      details: { message: `Changed member ${user.fullName} (${user.email}) status to ${status}` },
    })

    revalidatePath(`/owner/members/${memberId}`)
    revalidatePath("/owner/members")
    return { success: true }
  } catch (err) {
    console.error("Update member status error:", err)
    return { error: "Failed to update member status" }
  }
}

export async function checkMembershipExpiries() {
  const auth = await authorize([Role.GYM_OWNER, Role.SUPER_ADMIN])
  if (!auth.ok) return { error: auth.error }
  const { gymId } = auth

  const now = new Date()

  // Find expired memberships
  const expiredMemberships = await prisma.membership.findMany({
    where: {
      user: { gymId },
      status: MemberStatus.ACTIVE,
      endDate: { lt: now },
    },
    include: { user: true },
  })

  let count = 0
  for (const m of expiredMemberships) {
    await prisma.membership.update({
      where: { id: m.id },
      data: { status: MemberStatus.EXPIRED },
    })

    await prisma.user.update({
      where: { id: m.userId },
      data: { memberStatus: MemberStatus.EXPIRED },
    })

    await logAudit({
      userId: auth.userId,
      gymId,
      actionType: "MEMBER_UPDATED",
      affectedRecordId: m.userId,
      details: { message: `Membership expired for ${m.user.fullName} (${m.user.email})` },
    })
    count++
  }

  revalidatePath("/owner/members")
  return { success: true, count }
}
