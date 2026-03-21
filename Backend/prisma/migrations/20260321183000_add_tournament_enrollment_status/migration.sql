-- Add enrollment status enum and column for tournament join control
CREATE TYPE "EnrollmentStatus" AS ENUM ('OPEN', 'CLOSED');

ALTER TABLE "tournaments"
ADD COLUMN "enrollmentStatus" "EnrollmentStatus" NOT NULL DEFAULT 'OPEN';
