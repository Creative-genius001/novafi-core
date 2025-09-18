/*
  Warnings:

  - You are about to drop the column `sent_at` on the `notification` table. All the data in the column will be lost.
  - Added the required column `category` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'FAILED', 'SENT');

-- CreateEnum
CREATE TYPE "public"."NotificationCategory" AS ENUM ('TRANSACTION', 'ACTIVITIES');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('DEPOSIT', 'TRANSFER', 'SERVICES');

-- DropIndex
DROP INDEX "public"."notification_user_id_idx";

-- AlterTable
ALTER TABLE "public"."notification" DROP COLUMN "sent_at",
ADD COLUMN     "category" "public"."NotificationCategory" NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "public"."NotificationStatus" NOT NULL DEFAULT 'SENT',
ADD COLUMN     "type" "public"."NotificationType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "notification_user_id_created_at_idx" ON "public"."notification"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notification_category_idx" ON "public"."notification"("category");

-- CreateIndex
CREATE INDEX "notification_type_idx" ON "public"."notification"("type");
