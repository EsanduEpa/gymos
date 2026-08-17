-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('HIRE_REQUEST', 'SESSION_BOOKED', 'SESSION_CANCELLED', 'SESSION_DECLINED', 'PACK_LOW', 'MEMBERSHIP_EXPIRING', 'BUDGET_EXCEEDED', 'PAYROLL_READY');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "BodyMetric" DROP CONSTRAINT "BodyMetric_userId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryBudget" DROP CONSTRAINT "CategoryBudget_gymId_fkey";

-- DropForeignKey
ALTER TABLE "ExpenseRecord" DROP CONSTRAINT "ExpenseRecord_gymId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlan" DROP CONSTRAINT "MealPlan_clientId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlan" DROP CONSTRAINT "MealPlan_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_membershipPlanId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "MembershipPlan" DROP CONSTRAINT "MembershipPlan_gymId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "PTSession" DROP CONSTRAINT "PTSession_clientId_fkey";

-- DropForeignKey
ALTER TABLE "PTSession" DROP CONSTRAINT "PTSession_gymId_fkey";

-- DropForeignKey
ALTER TABLE "PTSession" DROP CONSTRAINT "PTSession_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "PayPeriod" DROP CONSTRAINT "PayPeriod_gymId_fkey";

-- DropForeignKey
ALTER TABLE "PayRecord" DROP CONSTRAINT "PayRecord_payPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "PayRecord" DROP CONSTRAINT "PayRecord_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressPhoto" DROP CONSTRAINT "ProgressPhoto_userId_fkey";

-- DropForeignKey
ALTER TABLE "RevenueRecord" DROP CONSTRAINT "RevenueRecord_gymId_fkey";

-- DropForeignKey
ALTER TABLE "SessionPack" DROP CONSTRAINT "SessionPack_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_gymId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlan" DROP CONSTRAINT "WorkoutPlan_clientId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlan" DROP CONSTRAINT "WorkoutPlan_trainerId_fkey";

-- DropTable
DROP TABLE "Message";

-- CreateIndex
CREATE INDEX "AuditLog_gymId_createdAt_idx" ON "AuditLog"("gymId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "BodyMetric_userId_idx" ON "BodyMetric"("userId");

-- CreateIndex
CREATE INDEX "ExpenseRecord_gymId_date_idx" ON "ExpenseRecord"("gymId", "date");

-- CreateIndex
CREATE INDEX "ExpenseRecord_gymId_category_idx" ON "ExpenseRecord"("gymId", "category");

-- CreateIndex
CREATE INDEX "MealPlan_trainerId_idx" ON "MealPlan"("trainerId");

-- CreateIndex
CREATE INDEX "MealPlan_clientId_idx" ON "MealPlan"("clientId");

-- CreateIndex
CREATE INDEX "MealPlanEntry_mealPlanId_idx" ON "MealPlanEntry"("mealPlanId");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_membershipPlanId_idx" ON "Membership"("membershipPlanId");

-- CreateIndex
CREATE INDEX "Membership_status_endDate_idx" ON "Membership"("status", "endDate");

-- CreateIndex
CREATE INDEX "MembershipPlan_gymId_idx" ON "MembershipPlan"("gymId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "PTSession_gymId_scheduledAt_idx" ON "PTSession"("gymId", "scheduledAt");

-- CreateIndex
CREATE INDEX "PTSession_gymId_status_idx" ON "PTSession"("gymId", "status");

-- CreateIndex
CREATE INDEX "PTSession_trainerId_status_idx" ON "PTSession"("trainerId", "status");

-- CreateIndex
CREATE INDEX "PTSession_clientId_status_idx" ON "PTSession"("clientId", "status");

-- CreateIndex
CREATE INDEX "PayPeriod_gymId_status_idx" ON "PayPeriod"("gymId", "status");

-- CreateIndex
CREATE INDEX "PayRecord_trainerId_idx" ON "PayRecord"("trainerId");

-- CreateIndex
CREATE INDEX "PayRecord_payPeriodId_idx" ON "PayRecord"("payPeriodId");

-- CreateIndex
CREATE INDEX "PayRecord_sessionId_idx" ON "PayRecord"("sessionId");

-- CreateIndex
CREATE INDEX "ProgressPhoto_userId_idx" ON "ProgressPhoto"("userId");

-- CreateIndex
CREATE INDEX "RevenueRecord_gymId_date_idx" ON "RevenueRecord"("gymId", "date");

-- CreateIndex
CREATE INDEX "RevenueRecord_gymId_category_idx" ON "RevenueRecord"("gymId", "category");

-- CreateIndex
CREATE INDEX "SessionPack_userId_status_expiryDate_idx" ON "SessionPack"("userId", "status", "expiryDate");

-- CreateIndex
CREATE INDEX "User_gymId_role_idx" ON "User"("gymId", "role");

-- CreateIndex
CREATE INDEX "WorkoutExercise_workoutPlanId_idx" ON "WorkoutExercise"("workoutPlanId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_trainerId_idx" ON "WorkoutPlan"("trainerId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_clientId_idx" ON "WorkoutPlan"("clientId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipPlan" ADD CONSTRAINT "MembershipPlan_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_membershipPlanId_fkey" FOREIGN KEY ("membershipPlanId") REFERENCES "MembershipPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionPack" ADD CONSTRAINT "SessionPack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTSession" ADD CONSTRAINT "PTSession_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTSession" ADD CONSTRAINT "PTSession_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTSession" ADD CONSTRAINT "PTSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyMetric" ADD CONSTRAINT "BodyMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayPeriod" ADD CONSTRAINT "PayPeriod_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayRecord" ADD CONSTRAINT "PayRecord_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayRecord" ADD CONSTRAINT "PayRecord_payPeriodId_fkey" FOREIGN KEY ("payPeriodId") REFERENCES "PayPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueRecord" ADD CONSTRAINT "RevenueRecord_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryBudget" ADD CONSTRAINT "CategoryBudget_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

