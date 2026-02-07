-- CreateTable
CREATE TABLE "Club" (
    "clubId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "location" TEXT NOT NULL,
    "foundedDate" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("clubId")
);

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
