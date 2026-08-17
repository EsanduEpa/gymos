import { PrismaClient, Role, TrainerLevel, MemberStatus, SessionStatus, SessionType, ShiftStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clean existing seed data for idempotency
  await prisma.auditLog.deleteMany()
  await prisma.payRecord.deleteMany()
  await prisma.payPeriod.deleteMany()
  await prisma.categoryBudget.deleteMany()
  await prisma.expenseRecord.deleteMany()
  await prisma.revenueRecord.deleteMany()
  await prisma.pTSession.deleteMany()
  await prisma.sessionPack.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.membershipPlan.deleteMany()
  await prisma.user.deleteMany()
  await prisma.gym.deleteMany()

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

  // 8. Create PT Sessions establishing trainer-client relationships directly
  // (the request -> accept/decline flow on PTSession is now the hire mechanism)
  await prisma.pTSession.create({
    data: {
      gymId: gym.id,
      clientId: createdMembers[0].id,
      trainerId: trainer1.id,
      scheduledAt: new Date(Date.now() - 3 * 86400000),
      duration: 60,
      status: "COMPLETED",
      fee: 45.0,
      notes: "Goal: Build upper body muscle strength",
      startedAt: new Date(Date.now() - 3 * 86400000),
      endedAt: new Date(Date.now() - 3 * 86400000 + 60 * 60000),
    },
  })

  await prisma.pTSession.create({
    data: {
      gymId: gym.id,
      clientId: createdMembers[1].id,
      trainerId: trainer2.id,
      scheduledAt: new Date(Date.now() + 2 * 86400000),
      duration: 60,
      status: "SCHEDULED",
      fee: 50.0,
      notes: "Goal: Post-rehab mobility and weight loss",
    },
  })

  await prisma.pTSession.create({
    data: {
      gymId: gym.id,
      clientId: createdMembers[2].id,
      trainerId: trainer1.id,
      scheduledAt: new Date(Date.now() + 1 * 86400000),
      duration: 60,
      status: "PENDING_CONFIRMATION",
      fee: 50.0,
      notes: "Looking for 1-on-1 powerlifting coaching",
    },
  })

  // 10. Financial Records (Revenue, Expenses, Category Budgets, Pay Period)
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Revenue Records
  await prisma.revenueRecord.createMany({
    data: [
      {
        gymId: gym.id,
        amount: 499.99,
        category: "MEMBERSHIP",
        date: new Date(Date.now() - 15 * 86400000),
        description: "Annual Premium Membership - John Doe",
      },
      {
        gymId: gym.id,
        amount: 499.99,
        category: "MEMBERSHIP",
        date: new Date(Date.now() - 10 * 86400000),
        description: "Annual Premium Membership - Jane Smith",
      },
      {
        gymId: gym.id,
        amount: 450.0,
        category: "PT_SESSION",
        date: new Date(Date.now() - 8 * 86400000),
        description: "10 PT Session Pack - John Doe",
      },
      {
        gymId: gym.id,
        amount: 250.0,
        category: "PT_SESSION",
        date: new Date(Date.now() - 5 * 86400000),
        description: "5 PT Session Pack - Jane Smith",
      },
      {
        gymId: gym.id,
        amount: 35.0,
        category: "ADD_ON",
        date: new Date(Date.now() - 2 * 86400000),
        description: "Whey Protein & Gym Towel - Member Retail",
      },
      {
        gymId: gym.id,
        amount: 60.0,
        category: "ADD_ON",
        date: new Date(Date.now() - 1 * 86400000),
        description: "BCAA Powder & FitCore Shaker Bottle",
      },
    ],
  })

  // Expense Records
  await prisma.expenseRecord.createMany({
    data: [
      {
        gymId: gym.id,
        amount: 2500.0,
        category: "RENT",
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        description: "Monthly Facility Lease - Colombo 03",
        isRecurring: true,
      },
      {
        gymId: gym.id,
        amount: 480.0,
        category: "UTILITIES",
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        description: "Electricity & Water Bill",
        isRecurring: true,
      },
      {
        gymId: gym.id,
        amount: 650.0,
        category: "MARKETING",
        date: new Date(now.getFullYear(), now.getMonth(), 8),
        description: "Social Media Ads & Local Gym Promotion",
        isRecurring: false,
      },
      {
        gymId: gym.id,
        amount: 320.0,
        category: "MAINTENANCE",
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        description: "Treadmill Belt Servicing & Cable Machine Lubrication",
        isRecurring: false,
      },
      {
        gymId: gym.id,
        amount: 1500.0,
        category: "EQUIPMENT",
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        description: "New Dumbbell Rack & Rubber Plates",
        isRecurring: false,
      },
    ],
  })

  // Category Budgets
  const categories = ["RENT", "UTILITIES", "EQUIPMENT", "MARKETING", "SALARIES", "MAINTENANCE", "OTHER"] as const
  const budgetAmounts: Record<typeof categories[number], number> = {
    RENT: 2500.0,
    UTILITIES: 500.0,
    EQUIPMENT: 1000.0,
    MARKETING: 500.0, // Spent 650 -> Over budget!
    SALARIES: 4000.0,
    MAINTENANCE: 400.0,
    OTHER: 300.0,
  }

  for (const cat of categories) {
    await prisma.categoryBudget.upsert({
      where: {
        gymId_category_month: {
          gymId: gym.id,
          category: cat,
          month: currentMonthStart,
        },
      },
      update: { amount: budgetAmounts[cat] },
      create: {
        gymId: gym.id,
        category: cat,
        amount: budgetAmounts[cat],
        month: currentMonthStart,
      },
    })
  }

  // Pay Period
  const payPeriod = await prisma.payPeriod.create({
    data: {
      gymId: gym.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      status: "OPEN",
    },
  })

  await prisma.payRecord.create({
    data: {
      trainerId: trainer1.id,
      payPeriodId: payPeriod.id,
      amount: 20.0,
      description: "PT Session completion pay (40% Level 1 base rate)",
    },
  })

  await prisma.payRecord.create({
    data: {
      trainerId: trainer2.id,
      payPeriodId: payPeriod.id,
      amount: 25.0,
      description: "PT Session completion pay (50% Level 2 base rate)",
    },
  })

  console.log("Database successfully seeded with Part 4 Financials, Expenses, Budgets, and Payroll!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
