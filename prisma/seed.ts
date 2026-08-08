import { PrismaClient, Role, TrainerLevel, MemberStatus } from "@prisma/client"
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
      operatingHours: JSON.stringify({
        mon: { open: "06:00", close: "22:00" },
        tue: { open: "06:00", close: "22:00" },
        wed: { open: "06:00", close: "22:00" },
        thu: { open: "06:00", close: "22:00" },
        fri: { open: "06:00", close: "22:00" },
        sat: { open: "07:00", close: "20:00" },
        sun: { open: "08:00", close: "18:00" },
      }),
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
  await prisma.user.upsert({
    where: { email: "trainer1@fitgym.com" },
    update: {},
    create: {
      email: "trainer1@fitgym.com",
      password: passwordHash,
      fullName: "Marcus Vance",
      role: Role.PERSONAL_TRAINER,
      gymId: gym.id,
      trainerLevel: TrainerLevel.LEVEL_1,
      specialisations: JSON.stringify(["Strength Training", "Bodybuilding"]),
      yearsExperience: 4,
      shiftStart: "08:00",
      shiftEnd: "16:00",
      bio: "Certified strength & conditioning coach.",
      phone: "+94 77 234 5678",
    },
  })

  await prisma.user.upsert({
    where: { email: "trainer2@fitgym.com" },
    update: {},
    create: {
      email: "trainer2@fitgym.com",
      password: passwordHash,
      fullName: "Sarah Jenkins",
      role: Role.PERSONAL_TRAINER,
      gymId: gym.id,
      trainerLevel: TrainerLevel.LEVEL_2,
      specialisations: JSON.stringify(["HIIT", "Weight Loss", "Rehabilitation"]),
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

    // Attach membership record
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

  console.log("Database successfully seeded with SuperAdmin, Gym Owner, 2 Trainers, 5 Members, and 2 Membership Plans!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
