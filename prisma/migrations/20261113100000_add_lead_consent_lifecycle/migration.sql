-- Add lifecycle and delivery metadata for guide leads.
ALTER TABLE "Lead"
  ADD COLUMN "consentAt" TIMESTAMP(3),
  ADD COLUMN "locale" VARCHAR(5) NOT NULL DEFAULT 'de',
  ADD COLUMN "confirmationTokenHash" TEXT,
  ADD COLUMN "confirmationTokenExpires" TIMESTAMP(3),
  ADD COLUMN "unsubscribeTokenHash" TEXT,
  ADD COLUMN "confirmedAt" TIMESTAMP(3),
  ADD COLUMN "lastEmailSentAt" TIMESTAMP(3),
  ADD COLUMN "emailSendAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "emailLastError" VARCHAR(500);

CREATE UNIQUE INDEX "Lead_confirmationTokenHash_key"
  ON "Lead"("confirmationTokenHash");

CREATE UNIQUE INDEX "Lead_unsubscribeTokenHash_key"
  ON "Lead"("unsubscribeTokenHash");
