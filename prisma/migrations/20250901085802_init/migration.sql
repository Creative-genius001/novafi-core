-- CreateEnum
CREATE TYPE "public"."KYCLevel" AS ENUM ('L1', 'L2', 'L3');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('DEPOSIT', 'TRANSFER', 'AIRTIME', 'ELECTRICITY', 'DATA');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REVERSED');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "is_kyc_verified" BOOLEAN NOT NULL DEFAULT false,
    "kycLevel" "public"."KYCLevel" NOT NULL DEFAULT 'L1',
    "two_fa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_fa_secret" TEXT,
    "referral_code" TEXT,
    "referred_by" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallet" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nova_id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transfer" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "bank" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "reference_id" TEXT,
    "session_id" TEXT,

    CONSTRAINT "transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deposit" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "naira_amount" DECIMAL(65,30) NOT NULL,
    "network" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,

    CONSTRAINT "deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bill" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "biller" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,

    CONSTRAINT "bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kyc_document" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "public"."user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_referral_code_key" ON "public"."user"("referral_code");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "user_is_kyc_verified_idx" ON "public"."user"("is_kyc_verified");

-- CreateIndex
CREATE INDEX "user_kycLevel_idx" ON "public"."user"("kycLevel");

-- CreateIndex
CREATE INDEX "user_phone_idx" ON "public"."user"("phone");

-- CreateIndex
CREATE INDEX "user_referral_code_idx" ON "public"."user"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_user_id_key" ON "public"."wallet"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_nova_id_key" ON "public"."wallet"("nova_id");

-- CreateIndex
CREATE INDEX "wallet_user_id_idx" ON "public"."wallet"("user_id");

-- CreateIndex
CREATE INDEX "transaction_user_id_created_at_idx" ON "public"."transaction"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "transaction_type_idx" ON "public"."transaction"("type");

-- CreateIndex
CREATE INDEX "transaction_status_idx" ON "public"."transaction"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_transaction_id_key" ON "public"."transfer"("transaction_id");

-- CreateIndex
CREATE INDEX "transfer_reference_id_idx" ON "public"."transfer"("reference_id");

-- CreateIndex
CREATE INDEX "transfer_session_id_idx" ON "public"."transfer"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_transaction_id_key" ON "public"."deposit"("transaction_id");

-- CreateIndex
CREATE INDEX "deposit_network_idx" ON "public"."deposit"("network");

-- CreateIndex
CREATE INDEX "deposit_tx_hash_idx" ON "public"."deposit"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "bill_transaction_id_key" ON "public"."bill"("transaction_id");

-- CreateIndex
CREATE INDEX "bill_reference_id_idx" ON "public"."bill"("reference_id");

-- CreateIndex
CREATE INDEX "kyc_document_user_id_idx" ON "public"."kyc_document"("user_id");

-- CreateIndex
CREATE INDEX "notification_user_id_idx" ON "public"."notification"("user_id");

-- AddForeignKey
ALTER TABLE "public"."wallet" ADD CONSTRAINT "wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfer" ADD CONSTRAINT "transfer_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deposit" ADD CONSTRAINT "deposit_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bill" ADD CONSTRAINT "bill_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kyc_document" ADD CONSTRAINT "kyc_document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
