/*
  Warnings:

  - You are about to drop the column `kycLevel` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."user_kycLevel_idx";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "kycLevel",
ADD COLUMN     "kyc_level" "public"."KYCLevel" NOT NULL DEFAULT 'L1';

-- CreateIndex
CREATE INDEX "user_kyc_level_idx" ON "public"."user"("kyc_level");
