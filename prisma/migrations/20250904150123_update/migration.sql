/*
  Warnings:

  - You are about to drop the column `kyc_level` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `kyc_status` on the `user` table. All the data in the column will be lost.
  - Added the required column `amount` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fee` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."KycStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'FAILED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "public"."UserKycLevel" AS ENUM ('ONE', 'TWO', 'THREE');

-- DropIndex
DROP INDEX "public"."user_kyc_level_idx";

-- AlterTable
ALTER TABLE "public"."transaction" ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "fee" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "kyc_level",
DROP COLUMN "kyc_status",
ADD COLUMN     "user_kyc_level" "public"."UserKycLevel" NOT NULL DEFAULT 'ONE';

-- DropEnum
DROP TYPE "public"."KYCLevel";

-- DropEnum
DROP TYPE "public"."KYCStatus";

-- CreateTable
CREATE TABLE "public"."kyc_level" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level_1_status" "public"."KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "level_2_status" "public"."KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "level_3_status" "public"."KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_level_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_level_user_id_key" ON "public"."kyc_level"("user_id");

-- CreateIndex
CREATE INDEX "kyc_level_level_1_status_idx" ON "public"."kyc_level"("level_1_status");

-- CreateIndex
CREATE INDEX "kyc_level_level_2_status_idx" ON "public"."kyc_level"("level_2_status");

-- CreateIndex
CREATE INDEX "kyc_level_level_3_status_idx" ON "public"."kyc_level"("level_3_status");

-- CreateIndex
CREATE INDEX "kyc_level_user_id_idx" ON "public"."kyc_level"("user_id");

-- AddForeignKey
ALTER TABLE "public"."kyc_level" ADD CONSTRAINT "kyc_level_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
