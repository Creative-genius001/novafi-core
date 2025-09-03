/*
  Warnings:

  - You are about to drop the `kyc_document` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."KYCStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

-- DropForeignKey
ALTER TABLE "public"."kyc_document" DROP CONSTRAINT "kyc_document_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "kyc_status" "public"."KYCStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "public"."kyc_document";
