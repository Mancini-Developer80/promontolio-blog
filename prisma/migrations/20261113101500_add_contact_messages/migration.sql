CREATE TYPE "ContactMessageStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE "ContactMessage" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "message" TEXT NOT NULL,
  "status" "ContactMessageStatus" NOT NULL DEFAULT 'PENDING',
  "deliveryError" VARCHAR(500),
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactMessage_status_createdAt_idx"
  ON "ContactMessage"("status", "createdAt");
