-- AlterTable
-- Existing rows (if any) get an empty hash, which can never match a bcrypt
-- compare, so those accounts simply cannot log in until re-seeded/re-registered.
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;