-- Migration: add ONBOARDING value to the NotificationType enum
--
-- Prisma enums in PostgreSQL are native PG enum types. The safe way to extend
-- them is ALTER TYPE ... ADD VALUE. This is an append-only, non-transactional
-- DDL statement — it cannot be run inside an explicit transaction block, and
-- IF NOT EXISTS guards against a repeated run.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ONBOARDING';

