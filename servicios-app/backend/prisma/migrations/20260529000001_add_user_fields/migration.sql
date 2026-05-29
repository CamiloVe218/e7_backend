-- Add fields that were applied via prisma db push and missing from the init migration.
-- Uses IF NOT EXISTS so this migration is safe to run on both fresh and existing databases.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "street"      TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "extNumber"   TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state"       TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city"        TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "zipCode"     TEXT;
