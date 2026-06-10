ALTER TABLE "users"
  ADD COLUMN "cpf" TEXT,
  ADD COLUMN "resale_whatsapp" TEXT,
  ADD COLUMN "resale_instagram" TEXT,
  ADD COLUMN "resale_telegram" TEXT;

CREATE UNIQUE INDEX "users_cpf_idx" ON "users"("cpf");
