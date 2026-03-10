/*
  Warnings:

  - You are about to drop the column `message` on the `club_requests` table. All the data in the column will be lost.
  - Added the required column `preferredPosition` to the `club_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "club_requests" DROP COLUMN "message",
ADD COLUMN     "additionalMessage" TEXT,
ADD COLUMN     "preferredPosition" TEXT NOT NULL,
ADD COLUMN     "whyJoin" TEXT;
