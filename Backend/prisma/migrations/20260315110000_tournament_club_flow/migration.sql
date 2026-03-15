-- Update existing tournament status enum to support FINISHED lifecycle
ALTER TYPE "Status" RENAME VALUE 'COMPLETED' TO 'FINISHED';

-- Add payment status enum for tournament registration flow
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'WAIVED');

-- Add tournament winner metadata and payment placeholder data
ALTER TABLE "tournaments"
  ADD COLUMN "winnerClubId" INTEGER,
  ADD COLUMN "runnerUpClubId" INTEGER,
  ADD COLUMN "paymentInstructions" TEXT,
  ALTER COLUMN "status" SET DEFAULT 'UPCOMING';

ALTER TABLE "tournament_registrations"
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "paymentReference" TEXT,
  ADD COLUMN "paymentAmount" DECIMAL(10, 2);

-- Add FKs for winner/runner-up clubs
ALTER TABLE "tournaments"
  ADD CONSTRAINT "tournaments_winnerClubId_fkey"
  FOREIGN KEY ("winnerClubId") REFERENCES "clubs"("clubId")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tournaments"
  ADD CONSTRAINT "tournaments_runnerUpClubId_fkey"
  FOREIGN KEY ("runnerUpClubId") REFERENCES "clubs"("clubId")
  ON DELETE SET NULL ON UPDATE CASCADE;
