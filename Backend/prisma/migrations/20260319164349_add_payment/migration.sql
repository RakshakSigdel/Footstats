-- CreateEnum
CREATE TYPE "PaymentGatewayType" AS ENUM ('ESEWA', 'KHALTI');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "payments" (
    "paymentId" SERIAL NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentGateway" "PaymentGatewayType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "userId" INTEGER,
    "tournamentId" INTEGER,
    "gatewayTransactionId" TEXT,
    "gatewayResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("paymentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_gatewayTransactionId_key" ON "payments"("gatewayTransactionId");

-- CreateIndex
CREATE INDEX "payments_customerEmail_idx" ON "payments"("customerEmail");

-- CreateIndex
CREATE INDEX "payments_productId_idx" ON "payments"("productId");

-- CreateIndex
CREATE INDEX "payments_gatewayTransactionId_idx" ON "payments"("gatewayTransactionId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("tournamentId") ON DELETE SET NULL ON UPDATE CASCADE;
