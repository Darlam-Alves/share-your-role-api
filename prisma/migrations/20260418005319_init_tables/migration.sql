-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('public', 'institutional', 'admin');

-- CreateEnum
CREATE TYPE "member_role" AS ENUM ('member', 'admin', 'aggregate');

-- CreateEnum
CREATE TYPE "invite_status" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "visibility_type" AS ENUM ('public', 'institutional_only', 'private');

-- CreateEnum
CREATE TYPE "presence_status" AS ENUM ('confirmed', 'cancelled', 'maybe');

-- CreateEnum
CREATE TYPE "resale_status" AS ENUM ('open', 'sold', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email_personal" TEXT,
    "email_institutional" TEXT,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_institutional_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "verification_token_expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "republics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "republics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "republic_members" (
    "user_id" UUID NOT NULL,
    "republic_id" UUID NOT NULL,
    "role" "member_role" NOT NULL DEFAULT 'member',

    CONSTRAINT "republic_members_pkey" PRIMARY KEY ("user_id","republic_id")
);

-- CreateTable
CREATE TABLE "republic_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "republic_id" UUID NOT NULL,
    "invited_user_id" UUID NOT NULL,
    "invited_by_user_id" UUID NOT NULL,
    "status" "invite_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "republic_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "ended_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_by_republic_id" UUID,
    "ticket_platform" TEXT,
    "ticket_url" TEXT,
    "instagram" TEXT,
    "visibility_type" "visibility_type" NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_location" (
    "event_id" UUID NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "address" TEXT,
    "release_at" TIMESTAMPTZ(6),

    CONSTRAINT "event_location_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "event_promoters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "telegram" TEXT,

    CONSTRAINT "event_promoters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_lots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "lot_number" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6),
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "event_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_presence" (
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "presence_status" NOT NULL DEFAULT 'confirmed',

    CONSTRAINT "event_presence_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "resales" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "resale_status" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resale_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reviewer_user_id" UUID NOT NULL,
    "resale_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resale_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_promoters_event_id_whatsapp_key" ON "event_promoters"("event_id", "whatsapp");

-- CreateIndex
CREATE UNIQUE INDEX "event_promoters_event_id_instagram_key" ON "event_promoters"("event_id", "instagram");

-- CreateIndex
CREATE UNIQUE INDEX "event_promoters_event_id_telegram_key" ON "event_promoters"("event_id", "telegram");

-- CreateIndex
CREATE UNIQUE INDEX "event_lots_event_id_lot_number_key" ON "event_lots"("event_id", "lot_number");

-- CreateIndex
CREATE UNIQUE INDEX "resale_reviews_reviewer_user_id_resale_id_key" ON "resale_reviews"("reviewer_user_id", "resale_id");

-- AddForeignKey
ALTER TABLE "republic_members" ADD CONSTRAINT "republic_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "republic_members" ADD CONSTRAINT "republic_members_republic_id_fkey" FOREIGN KEY ("republic_id") REFERENCES "republics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "republic_invites" ADD CONSTRAINT "republic_invites_republic_id_fkey" FOREIGN KEY ("republic_id") REFERENCES "republics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "republic_invites" ADD CONSTRAINT "republic_invites_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "republic_invites" ADD CONSTRAINT "republic_invites_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_republic_id_fkey" FOREIGN KEY ("created_by_republic_id") REFERENCES "republics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_location" ADD CONSTRAINT "event_location_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_promoters" ADD CONSTRAINT "event_promoters_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_lots" ADD CONSTRAINT "event_lots_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_presence" ADD CONSTRAINT "event_presence_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_presence" ADD CONSTRAINT "event_presence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resales" ADD CONSTRAINT "resales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resales" ADD CONSTRAINT "resales_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resale_reviews" ADD CONSTRAINT "resale_reviews_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resale_reviews" ADD CONSTRAINT "resale_reviews_resale_id_fkey" FOREIGN KEY ("resale_id") REFERENCES "resales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
