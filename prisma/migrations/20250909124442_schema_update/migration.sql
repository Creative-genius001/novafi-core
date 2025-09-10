/*
  Warnings:

  - You are about to drop the `Beneficiary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Beneficiary";

-- CreateTable
CREATE TABLE "public"."beneficiary" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_code" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "beneficiary_name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "bank_name" TEXT NOT NULL,

    CONSTRAINT "beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "beneficiary_id_idx" ON "public"."beneficiary"("id");

-- CreateIndex
CREATE INDEX "beneficiary_user_id_idx" ON "public"."beneficiary"("user_id");
