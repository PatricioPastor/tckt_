import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getEventById } from "@/lib/data/events";
import { EventDetailClient } from "./components/event-detail-client";
import { CartInitializer } from "./components/cart-initializer";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const eventId = parseInt(id, 10);

  // Validate ID
  if (isNaN(eventId) || eventId <= 0) {
    notFound();
  }

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get event from database (cached)
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  return (
    <>
      <CartInitializer eventId={eventId} />
      <EventDetailClient event={event} isLoggedIn={!!session?.user} />
    </>
  );
}
