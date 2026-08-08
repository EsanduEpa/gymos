import { PrismaClient, Role, TrainerLevel, MemberStatus, SessionStatus, SessionType, ShiftStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const passwordHash = await bcrypt.hash("password123", 10)

  // 1. Create SuperAdmin
  await prisma.user.upsert({
    where: { email: "admin@gymos.com" },
    update: {},
    create: {
      email: "admin@gymos.com",
      password: passwordHash,
      fullName: "Super Admin",
      role: Role.SUPER_ADMIN,
    },
  })

  // 2. Create Gym
  const gym = await prisma.gym.upsert({
    where: { id: "gym-fitcore-01" },
    update: {},
    create: {
      id: "gym-fitcore-01",
      name: "FitCore Fitness Center",
      address: "123 Fitness Ave, Colombo 03",
      phone: "+94 11 234 5678",
      email: "contact@fitcoregym.com",
      operatingHours: {
        mon: { open: "06:00", close: "22:00" },
        tue: { open: "06:00", close: "22:00" },
        wed: { open: "06:00", close: "22:00" },
        thu: { open: "06:00", close: "22:00" },
        fri: { open: "06:00", close: "22:00" },
        sat: { open: "07:00", close: "20:00" },
        sun: { open: "08:00", close: "18:00" },
      },
      cancellationWindowHours: 24,
      noShowDeduction: true,
      lateCancelDeduction: true,
      minSessionDuration: 20,
      level1BaseRate: 0.4,
      level2BaseRate: 0.5,
      offShiftPremium: 0.1,
      payPeriod: "MONTHLY",
    },
  })

  // 3. Create Gym Owner
  await prisma.user.upsert({
    where: { email: "owner@fitgym.com" },
    update: {},
    create: {
      email: "owner@fitgym.com",
      password: passwordHash,
      fullName: "Alex Rivera (Owner)",
      role: Role.GYM_OWNER,
      gymId: gym.id,
      phone: "+94 77 123 4567",
    },
  })

  // 4. Create Membership Plans
  const basicPlan = await prisma.membershipPlan.create({
    data: {
      gymId: gym.id,
      name: "Monthly Basic",
      description: "Standard gym floor access with basic amenities",
      price: 49.99,
      durationDays: 30,
    },
  })

  const premiumPlan = await prisma.membershipPlan.create({
    data: {
      gymId: gym.id,
      name: "Annual Premium",
      description: "Unlimited access + 4 PT sessions included",
      price: 499.99,
      durationDays: 365,
    },
  })

  // 5. Create Trainers
  const trainer1 = await prisma.user.upsert({
    where: { email: "trainer1@fitgym.com" },
    update: {},
    create: {
      email: "trainer1@fitgym.com",
      password: passwordHash,
      fullName: "Marcus Vance",
      role: Role.PERSONAL_TRAINER,
      gymId: gym.id,
      trainerLevel: TrainerLevel.LEVEL_1,
      specialisations: ["Strength Training", "Bodybuilding"],
      yearsExperience: 4,
      shiftStart: "08:00",
      shiftEnd: "16:00",
      bio: "Certified strength & conditioning coach.",
      phone: "+94 77 234 5678",
    },
  })

  const trainer2 = await prisma.user.upsert({
    where: { email: "trainer2@fitgym.com" },
    update: {},
    create: {
      email: "trainer2@fitgym.com",
      password: passwordHash,
      fullName: "Sarah Jenkins",
      role: Role.PERSONAL_TRAINER,
      gymId: gym.id,
      trainerLevel: TrainerLevel.LEVEL_2,
      specialisations: ["HIIT", "Weight Loss", "Rehabilitation"],
      yearsExperience: 8,
      shiftStart: "10:00",
      shiftEnd: "18:00",
      bio: "Senior personal trainer specializing in functional fitness.",
      phone: "+94 77 345 6789",
    },
  })

  // 6. Create Members
  const memberNames = [
    { name: "John Doe", email: "member1@fitgym.com", status: MemberStatus.ACTIVE },
    { name: "Jane Smith", email: "member2@fitgym.com", status: MemberStatus.ACTIVE },
    { name: "Robert Taylor", email: "member3@fitgym.com", status: MemberStatus.ACTIVE },
    { name: "Emily Clark", email: "member4@fitgym.com", status: MemberStatus.EXPIRED },
    { name: "Michael Brown", email: "member5@fitgym.com", status: MemberStatus.SUSPENDED },
  ]

  const createdMembers = []

  for (const m of memberNames) {
    const member = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        password: passwordHash,
        fullName: m.name,
        role: Role.GYM_MEMBER,
        gymId: gym.id,
        memberStatus: m.status,
        dateOfBirth: new Date("1995-05-15"),
        emergencyContact: "+94 71 999 8888",
        phone: "+94 77 000 1111",
      },
    })
    createdMembers.push(member)

    await prisma.membership.create({
      data: {
        userId: member.id,
        membershipPlanId: m.status === MemberStatus.EXPIRED ? basicPlan.id : premiumPlan.id,
        startDate: new Date("2026-01-01"),
        endDate: m.status === MemberStatus.EXPIRED ? new Date("2026-02-01") : new Date("2027-01-01"),
        status: m.status,
      },
    })
  }

  // 7. Create Session Packs for Members
  await prisma.sessionPack.create({
    data: {
      userId: createdMembers[0].id, // John Doe
      totalSessions: 10,
      remainingSessions: 8,
      status: "ACTIVE",
      expiryDate: new Date("2026-12-31"),
      price: 450.0,
    },
  })

  await prisma.sessionPack.create({
    data: {
      userId: createdMembers[1].id, // Jane Smith
      totalSessions: 5,
      remainingSessions: 4,
      status: "ACTIVE",
      expiryDate: new Date("2026-12-31"),
      price: 250.0,
    },
  })

  // 8. Create Trainer Hire Requests
  await prisma.hireRequest.create({
    data: {
      clientId: createdMembers[0].id,
      trainerId: trainer1.id,
      status: "ACCEPTED",
      message: "Goal: Build upper body muscle strength",
    },
  })

  await prisma.hireRequest.create({
    data: {
      clientId: createdMembers[1].id,
      trainerId: trainer2.id,
      status: "ACCEPTED",
      message: "Goal: Post-rehab mobility and weight loss",
    },
  })

  await prisma.hireRequest.create({
    data: {
      clientId: createdMembers[2].id,
      trainerId: trainer1.id,
      status: "PENDING",
      message: "Looking for 1-on-1 powerlifting coaching",
    },
  })

  // 9. Create Sample PT Sessions
  await prisma.pTSession.create({
    data: {
      gymId: gym.id,
      trainerId: trainer1.id,
      clientId: createdMembers[0].id,
      scheduledAt: new Date(Date.now() + 2 * 3600000), // Today in 2 hrs
      duration: 60,
      type: SessionType.IN_PERSON,
      status: SessionStatus.SCHEDULED,
      shiftStatus: ShiftStatus.IN_SHIFT,
      fee: 50.0,
    },
  })

  await prisma.pTSession.create({
    data: {
      gymId: gym.id,
      trainerId: trainer2.id,
      clientId: createdMembers[1].id,
      scheduledAt: new Date(Date.now() - 24 * 3600000), // Yesterday
      duration: 60,
      type: SessionType.IN_PERSON,
      status: SessionStatus.COMPLETED,
      shiftStatus: ShiftStatus.IN_SHIFT,
      fee: 50.0,
      notes: "Completed 4 sets of squat and deadlift.",
    },
  })

  console.log("Database successfully seeded with Part 3 PT Sessions, Session Packs, and Hire Requests!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
