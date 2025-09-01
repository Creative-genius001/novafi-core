/*
  Warnings:

  - You are about to drop the column `is_kyc_verified` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."user_is_kyc_verified_idx";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "is_kyc_verified",
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "user_is_verified_idx" ON "public"."user"("is_verified");
