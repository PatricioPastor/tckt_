-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('superadmin', 'head_producer', 'rrpp', 'qr_scanner', 'user');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('draft', 'published', 'finished');

-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('pending', 'paid', 'used', 'transferred', 'refunded');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'in_process');

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "dni" TEXT,
    "birthDate" TIMESTAMP(3),
    "role" "public"."Role" NOT NULL DEFAULT 'user',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "provider" TEXT NOT NULL DEFAULT 'mercadopago',
    "external_reference" TEXT NOT NULL,
    "mp_preference_id" TEXT,
    "mp_payment_id" TEXT,
    "payer_email" TEXT,
    "payer_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "banner_url" TEXT,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'draft',
    "producer_id" INTEGER NOT NULL DEFAULT 1,
    "capacity_total" INTEGER,
    "is_rsvp_allowed" BOOLEAN NOT NULL DEFAULT true,
    "event_genre" TEXT,
    "show_remaining_tickets" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."artist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "image_url" TEXT,
    "social_links" JSONB,

    CONSTRAINT "artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_artist" (
    "event_id" INTEGER NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "order" INTEGER,
    "slot_time" TEXT,
    "is_headliner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "event_artist_pkey" PRIMARY KEY ("event_id","artist_id")
);

-- CreateTable
CREATE TABLE "public"."ticket_type" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "stock_max" INTEGER NOT NULL,
    "stock_current" INTEGER NOT NULL,
    "user_max_per_type" INTEGER NOT NULL DEFAULT 5,
    "scan_expiration" TIMESTAMP(3),
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ticket_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "owner_id" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    "payment_id" INTEGER,
    "qr_code" TEXT NOT NULL,
    "code" TEXT,
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'pending',
    "transferred_from_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rrpp_assignment" (
    "rrpp_user_id" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    "commission_rate" DECIMAL(65,30) NOT NULL DEFAULT 0.10,
    "frees_granted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rrpp_assignment_pkey" PRIMARY KEY ("rrpp_user_id","event_id")
);

-- CreateTable
CREATE TABLE "public"."participant" (
    "user_id" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    "via_rsvp" BOOLEAN NOT NULL DEFAULT false,
    "qr_code" TEXT,

    CONSTRAINT "participant_pkey" PRIMARY KEY ("user_id","event_id")
);

-- CreateTable
CREATE TABLE "public"."log" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message" (
    "id" SERIAL NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_status" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "public"."user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "payment_external_reference_key" ON "public"."payment"("external_reference");

-- CreateIndex
CREATE UNIQUE INDEX "payment_mp_payment_id_key" ON "public"."payment"("mp_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_type_event_id_code_key" ON "public"."ticket_type"("event_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_qr_code_key" ON "public"."ticket"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_code_key" ON "public"."ticket"("code");

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_artist" ADD CONSTRAINT "event_artist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_artist" ADD CONSTRAINT "event_artist_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_type" ADD CONSTRAINT "ticket_type_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."ticket_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_transferred_from_id_fkey" FOREIGN KEY ("transferred_from_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rrpp_assignment" ADD CONSTRAINT "rrpp_assignment_rrpp_user_id_fkey" FOREIGN KEY ("rrpp_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rrpp_assignment" ADD CONSTRAINT "rrpp_assignment_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participant" ADD CONSTRAINT "participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participant" ADD CONSTRAINT "participant_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log" ADD CONSTRAINT "log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
