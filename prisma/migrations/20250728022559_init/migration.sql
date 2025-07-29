/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'jefe_productora', 'rrpp', 'escaner_qr', 'usuario_convencional');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('draft', 'published', 'finished');

-- CreateEnum
CREATE TYPE "TicketTypeEnum" AS ENUM ('general', 'vip', 'ultra', 'free');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('pending', 'paid', 'used', 'transferred');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "dni" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'usuario_convencional',
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "bannerUrl" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'draft',
    "producerId" INTEGER NOT NULL DEFAULT 1,
    "capacityTotal" INTEGER,
    "isRsvpAllowed" BOOLEAN NOT NULL DEFAULT true,
    "eventGenre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "socialLinks" JSONB,

    CONSTRAINT "artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventArtist" (
    "eventId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "order" INTEGER,
    "slotTime" TEXT,
    "isHeadliner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "eventArtist_pkey" PRIMARY KEY ("eventId","artistId")
);

-- CreateTable
CREATE TABLE "ticketType" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "type" "TicketTypeEnum" NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "stockMax" INTEGER NOT NULL,
    "stockCurrent" INTEGER NOT NULL,
    "userMaxPerType" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "ticketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "qrCode" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'pending',
    "paymentId" TEXT,
    "transferredFromId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrppAssignment" (
    "rrppUserId" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "commissionRate" DECIMAL(65,30) NOT NULL DEFAULT 0.10,
    "freesGranted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rrppAssignment_pkey" PRIMARY KEY ("rrppUserId","eventId")
);

-- CreateTable
CREATE TABLE "participant" (
    "userId" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "viaRsvp" BOOLEAN NOT NULL DEFAULT false,
    "qrCode" TEXT,

    CONSTRAINT "participant_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateTable
CREATE TABLE "log" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readStatus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticketType_eventId_type_key" ON "ticketType"("eventId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_qrCode_key" ON "ticket"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "eventArtist" ADD CONSTRAINT "eventArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventArtist" ADD CONSTRAINT "eventArtist_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticketType" ADD CONSTRAINT "ticketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ticketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_transferredFromId_fkey" FOREIGN KEY ("transferredFromId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrppAssignment" ADD CONSTRAINT "rrppAssignment_rrppUserId_fkey" FOREIGN KEY ("rrppUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrppAssignment" ADD CONSTRAINT "rrppAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant" ADD CONSTRAINT "participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant" ADD CONSTRAINT "participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
