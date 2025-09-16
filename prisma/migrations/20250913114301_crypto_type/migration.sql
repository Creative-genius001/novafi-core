-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "fireblocks_vault_id" TEXT;

-- AlterTable
ALTER TABLE "public"."wallet" ADD COLUMN     "account_number" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "order_ref" TEXT;

-- CreateTable
CREATE TABLE "public"."deposit_address" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "crypto_type" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bvn_verification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "bvn" TEXT NOT NULL,
    "date_of_birth" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "nin" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "bvn_reference" TEXT NOT NULL,
    "face_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bvn_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deposit_address_address_key" ON "public"."deposit_address"("address");

-- CreateIndex
CREATE INDEX "deposit_address_user_id_idx" ON "public"."deposit_address"("user_id");

-- CreateIndex
CREATE INDEX "deposit_address_crypto_type_idx" ON "public"."deposit_address"("crypto_type");

-- CreateIndex
CREATE INDEX "deposit_address_isActive_idx" ON "public"."deposit_address"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_address_user_id_crypto_type_network_key" ON "public"."deposit_address"("user_id", "crypto_type", "network");

-- CreateIndex
CREATE UNIQUE INDEX "bvn_verification_user_id_key" ON "public"."bvn_verification"("user_id");

-- CreateIndex
CREATE INDEX "bvn_verification_bvn_idx" ON "public"."bvn_verification"("bvn");

-- CreateIndex
CREATE INDEX "bvn_verification_bvn_reference_idx" ON "public"."bvn_verification"("bvn_reference");

-- CreateIndex
CREATE INDEX "bvn_verification_user_id_idx" ON "public"."bvn_verification"("user_id");

-- CreateIndex
CREATE INDEX "bill_transaction_id_idx" ON "public"."bill"("transaction_id");

-- CreateIndex
CREATE INDEX "deposit_transaction_id_idx" ON "public"."deposit"("transaction_id");

-- CreateIndex
CREATE INDEX "transfer_transaction_id_idx" ON "public"."transfer"("transaction_id");

-- CreateIndex
CREATE INDEX "wallet_order_ref_idx" ON "public"."wallet"("order_ref");

-- AddForeignKey
ALTER TABLE "public"."deposit_address" ADD CONSTRAINT "deposit_address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bvn_verification" ADD CONSTRAINT "bvn_verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
