-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "users"
  ALTER COLUMN "password" DROP NOT NULL,
  ADD COLUMN "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
  ADD COLUMN "googleId" TEXT,
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "emailVerificationCode" TEXT,
  ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
