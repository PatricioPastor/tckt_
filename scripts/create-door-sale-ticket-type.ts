/**
 * Script to create DOOR-SALE ticket type for an event
 * Usage: npx tsx scripts/create-door-sale-ticket-type.ts <eventId>
 */

import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function createDoorSaleTicketType(eventId: number) {
  try {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, name: true },
    });

    if (!event) {
      console.error(`❌ Event with ID ${eventId} not found`);
      process.exit(1);
    }

    console.log(`✅ Found event: ${event.name} (ID: ${event.id})`);

    // Check if DOOR-SALE ticket type already exists
    const existingTicketType = await prisma.ticketType.findFirst({
      where: {
        eventId: eventId,
        code: "DOOR-SALE",
      },
    });

    if (existingTicketType) {
      console.log(`⚠️  DOOR-SALE ticket type already exists for this event (ID: ${existingTicketType.id})`);
      console.log(`   Label: ${existingTicketType.label}`);
      console.log(`   Price: $${existingTicketType.price}`);
      console.log(`   Stock: ${existingTicketType.stockCurrent}/${existingTicketType.stockMax}`);
      return;
    }

    // Create DOOR-SALE ticket type
    const ticketType = await prisma.ticketType.create({
      data: {
        eventId: eventId,
        code: "DOOR-SALE",
        label: "At-the-door Ticket",
        price: 34200, // $34,200 ARS (base 30k + 8% app fee + 6% MP fee)
        stockMax: 1000, // Adjust as needed
        stockCurrent: 1000,
        userMaxPerType: 10,
        isVisible: true,
        isDisabled: false,
      },
    });

    console.log(`✅ Successfully created DOOR-SALE ticket type`);
    console.log(`   ID: ${ticketType.id}`);
    console.log(`   Code: ${ticketType.code}`);
    console.log(`   Label: ${ticketType.label}`);
    console.log(`   Price: $${ticketType.price}`);
    console.log(`   Stock: ${ticketType.stockMax}`);
    console.log(`\n🎟️  Door sale page URL: /door-sale?eventId=${eventId}`);
  } catch (error) {
    console.error("❌ Error creating ticket type:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const eventIdArg = process.argv[2];

if (!eventIdArg) {
  console.error("❌ Usage: npx tsx scripts/create-door-sale-ticket-type.ts <eventId>");
  console.error("   Example: npx tsx scripts/create-door-sale-ticket-type.ts 1");
  process.exit(1);
}

const eventId = parseInt(eventIdArg);

if (isNaN(eventId)) {
  console.error("❌ Event ID must be a number");
  process.exit(1);
}

createDoorSaleTicketType(eventId)
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });
