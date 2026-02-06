-- CreateEnum
CREATE TYPE "preferredFoot" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('KNOCKOUT', 'LEAGUE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "assist" INTEGER,
ADD COLUMN     "goalsScored" INTEGER,
ADD COLUMN     "matchesPlayed" INTEGER,
ADD COLUMN     "preferredFoot" "preferredFoot";

-- CreateTable
CREATE TABLE "Tournament" (
    "tournamentId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "location" TEXT NOT NULL,
    "entryFee" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "format" "Format" NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("tournamentId")
);

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
