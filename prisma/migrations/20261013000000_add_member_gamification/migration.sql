-- Add the database objects required by the member community features.
-- These schema changes were introduced without a migration, which made
-- Prisma's user lookup fail during sign-in on the existing database.
BEGIN;

CREATE TYPE "BadgeType" AS ENUM ('FIRST_VISIT', 'VISITS_10', 'VISITS_50', 'VISITS_100', 'VISITS_250', 'STREAK_7_DAYS', 'STREAK_30_DAYS', 'STREAK_100_DAYS');

ALTER TABLE "User" ADD COLUMN "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'BIOMETRIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttendanceStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "lastCheckInDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AttendanceStreak_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MilestoneBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MilestoneBadge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CheckIn_userId_createdAt_idx" ON "CheckIn"("userId", "createdAt");
CREATE UNIQUE INDEX "AttendanceStreak_userId_key" ON "AttendanceStreak"("userId");
CREATE INDEX "AttendanceStreak_currentStreak_idx" ON "AttendanceStreak"("currentStreak");
CREATE INDEX "MilestoneBadge_userId_idx" ON "MilestoneBadge"("userId");
CREATE UNIQUE INDEX "MilestoneBadge_userId_badgeType_key" ON "MilestoneBadge"("userId", "badgeType");

ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceStreak" ADD CONSTRAINT "AttendanceStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MilestoneBadge" ADD CONSTRAINT "MilestoneBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
