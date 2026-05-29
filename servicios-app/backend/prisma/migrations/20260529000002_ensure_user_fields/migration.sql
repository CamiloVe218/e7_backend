-- Ensures address and suspension fields exist on the users table.
-- Safe on any state: ADD COLUMN IF NOT EXISTS is a no-op when the column exists.
-- Required for databases that were bootstrapped via prisma db push with an
-- older schema and then baselined without executing migration 0001.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "street"      TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "extNumber"   TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state"       TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city"        TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "zipCode"     TEXT;
