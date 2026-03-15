-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'CLUB_JOIN_REQUEST',
  'CLUB_JOIN_APPROVED',
  'CLUB_JOIN_REJECTED',
  'SCHEDULE_CREATED',
  'TOURNAMENT_JOIN_REQUEST',
  'TOURNAMENT_JOIN_APPROVED',
  'TOURNAMENT_JOIN_REJECTED',
  'LINEUP_ADDED',
  'MATCH_EVENT_ADDED',
  'SYSTEM'
);

-- CreateTable
CREATE TABLE "notifications" (
    "notificationId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
