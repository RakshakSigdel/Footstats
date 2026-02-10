/*
  Warnings:

  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_clubId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_userId_fkey";

-- DropTable
DROP TABLE "Request";

-- DropEnum
DROP TYPE "RequestStatus";
