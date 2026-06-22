/*
  Warnings:

  - You are about to drop the column `resale_instagram` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resale_telegram` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resale_whatsapp` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "resale_instagram",
DROP COLUMN "resale_telegram",
DROP COLUMN "resale_whatsapp",
ADD COLUMN     "seller_instagram" TEXT,
ADD COLUMN     "seller_telegram" TEXT,
ADD COLUMN     "seller_whatsapp" TEXT;
