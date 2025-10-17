import { Metadata } from "next";
import { getEventForMetadata } from "@/lib/data/events";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const eventId = parseInt(id, 10);

  // Validate ID
  if (isNaN(eventId) || eventId <= 0) {
    return {
      title: "Evento no encontrado | tckt_",
      description: "El evento que buscás no existe o ya no está disponible.",
    };
  }

  try {
    // Use cached query specifically for metadata
    const event = await getEventForMetadata(eventId);

    if (!event) {
      return {
        title: "Evento no encontrado | tckt_",
        description: "El evento que buscás no existe o ya no está disponible.",
      };
    }

    const artists = event.eventArtists.map((ea) => ea.artist.name).join(", ");
    const description = event.description || `${event.name} - ${artists || "Evento en vivo"}`;
    const title = `${event.name} | tckt_`;

    // Base URL from env
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.tckt.fun";
    const eventUrl = `${baseUrl}/events/${event.id}`;
    const imageUrl = event.bannerUrl || `${baseUrl}/background.jpeg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: eventUrl,
        siteName: "tckt_",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: event.name,
          },
        ],
        locale: "es_AR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: eventUrl,
      },
    };
  } catch (error) {
    console.error("[Metadata Error]", error);
    return {
      title: "tckt_",
      description: "Plataforma de venta de tickets",
    };
  }
}

export default function EventLayout({ children }: Props) {
  return <>{children}</>;
}
