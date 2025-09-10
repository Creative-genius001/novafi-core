/*
  Warnings:

  - You are about to drop the column `is_verified` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `user_kyc_level` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `kyc_level` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."kyc_level" DROP CONSTRAINT "kyc_level_user_id_fkey";

-- DropIndex
DROP INDEX "public"."user_is_verified_idx";

-- AlterTable
ALTER TABLE "public"."notification" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "is_verified",
DROP COLUMN "user_kyc_level",
ADD COLUMN     "is_email_verified" "public"."KycStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "is_kyc_verified" "public"."KycStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- DropTable
DROP TABLE "public"."kyc_level";

-- DropEnum
DROP TYPE "public"."UserKycLevel";

-- CreateTable
CREATE TABLE "public"."Beneficiary" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_code" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "beneficiary_name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "bank_name" TEXT NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Beneficiary_id_idx" ON "public"."Beneficiary"("id");

-- CreateIndex
CREATE INDEX "Beneficiary_user_id_idx" ON "public"."Beneficiary"("user_id");

-- CreateIndex
CREATE INDEX "user_is_email_verified_idx" ON "public"."user"("is_email_verified");

-- CreateIndex
CREATE INDEX "user_is_kyc_verified_idx" ON "public"."user"("is_kyc_verified");
