-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "last_email_change_at" TIMESTAMP(3),
ADD COLUMN     "last_password_change_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_nova_id_idx" ON "public"."user"("nova_id");
