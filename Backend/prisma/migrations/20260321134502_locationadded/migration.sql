-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "locationLatitude" DOUBLE PRECISION,
ADD COLUMN     "locationLongitude" DOUBLE PRECISION,
ADD COLUMN     "locationPlaceId" TEXT;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "locationLatitude" DOUBLE PRECISION,
ADD COLUMN     "locationLongitude" DOUBLE PRECISION,
ADD COLUMN     "locationPlaceId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "locationLatitude" DOUBLE PRECISION,
ADD COLUMN     "locationLongitude" DOUBLE PRECISION,
ADD COLUMN     "locationPlaceId" TEXT;
