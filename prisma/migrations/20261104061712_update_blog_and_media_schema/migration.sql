/*
  Warnings:

  - You are about to drop the column `keywords` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_authorId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "keywords",
ADD COLUMN     "language" VARCHAR(5) NOT NULL DEFAULT 'de',
ADD COLUMN     "readingTime" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "title" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "excerpt" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "authorId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Article_language_idx" ON "Article"("language");

-- CreateIndex
CREATE INDEX "Article_status_language_idx" ON "Article"("status", "language");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
