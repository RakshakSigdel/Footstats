-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "preferredFoot" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('KNOCKOUT', 'LEAGUE');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('UPCOMING', 'ONGOING', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchEventType" AS ENUM ('GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION');

-- CreateTable
CREATE TABLE "users" (
    "userId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "Phone" TEXT,
    "location" TEXT,
    "profilePhoto" TEXT,
    "preferredFoot" "preferredFoot",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "clubs" (
    "clubId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "location" TEXT NOT NULL,
    "foundedDate" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("clubId")
);

-- CreateTable
CREATE TABLE "club_requests" (
    "requestId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "message" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "dateRequested" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" INTEGER,

    CONSTRAINT "club_requests_pkey" PRIMARY KEY ("requestId")
);

-- CreateTable
CREATE TABLE "user_clubs" (
    "userClubId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "role" "ClubRole" NOT NULL DEFAULT 'MEMBER',
    "position" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_clubs_pkey" PRIMARY KEY ("userClubId")
);

-- CreateTable
CREATE TABLE "tournaments" (
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

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("tournamentId")
);

-- CreateTable
CREATE TABLE "tournament_admins" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_registrations" (
    "registrationId" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "registeredBy" INTEGER NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" INTEGER,
    "notes" TEXT,

    CONSTRAINT "tournament_registrations_pkey" PRIMARY KEY ("registrationId")
);

-- CreateTable
CREATE TABLE "schedules" (
    "scheduleId" SERIAL NOT NULL,
    "scheduleStatus" "ScheduleStatus" NOT NULL DEFAULT 'UPCOMING',
    "scheduleType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "teamOneId" INTEGER NOT NULL,
    "teamTwoId" INTEGER NOT NULL,
    "createdFromClub" INTEGER,
    "createdFromTournament" INTEGER,
    "createdFromUser" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("scheduleId")
);

-- CreateTable
CREATE TABLE "matches" (
    "matchId" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "teamOneGoals" INTEGER NOT NULL DEFAULT 0,
    "teamTwoGoals" INTEGER NOT NULL DEFAULT 0,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "match_events" (
    "matchEventId" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "assistById" INTEGER,
    "clubId" INTEGER NOT NULL,
    "eventType" "MatchEventType" NOT NULL,
    "minute" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("matchEventId")
);

-- CreateTable
CREATE TABLE "match_lineups" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "isStarter" BOOLEAN NOT NULL,
    "position" TEXT,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "match_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "club_requests_userId_clubId_key" ON "club_requests"("userId", "clubId");

-- CreateIndex
CREATE UNIQUE INDEX "user_clubs_userId_clubId_key" ON "user_clubs"("userId", "clubId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_admins_tournamentId_userId_key" ON "tournament_admins"("tournamentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_registrations_tournamentId_clubId_key" ON "tournament_registrations"("tournamentId", "clubId");

-- CreateIndex
CREATE UNIQUE INDEX "matches_scheduleId_key" ON "matches"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "match_lineups_matchId_userId_key" ON "match_lineups"("matchId", "userId");

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_requests" ADD CONSTRAINT "club_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_requests" ADD CONSTRAINT "club_requests_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("clubId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_clubs" ADD CONSTRAINT "user_clubs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_clubs" ADD CONSTRAINT "user_clubs_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("clubId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_admins" ADD CONSTRAINT "tournament_admins_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("tournamentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("tournamentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("clubId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teamOneId_fkey" FOREIGN KEY ("teamOneId") REFERENCES "clubs"("clubId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teamTwoId_fkey" FOREIGN KEY ("teamTwoId") REFERENCES "clubs"("clubId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_createdFromClub_fkey" FOREIGN KEY ("createdFromClub") REFERENCES "clubs"("clubId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_createdFromTournament_fkey" FOREIGN KEY ("createdFromTournament") REFERENCES "tournaments"("tournamentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_createdFromUser_fkey" FOREIGN KEY ("createdFromUser") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("scheduleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_assistById_fkey" FOREIGN KEY ("assistById") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("clubId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("clubId") ON DELETE CASCADE ON UPDATE CASCADE;
