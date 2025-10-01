import prisma from "@/lib/prisma";
import { Metadata } from "next";


type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        eventArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!event) {
      return {
        title: "Evento no encontrado | tckt_",
        description: "El evento que buscás no existe o ya no está disponible.",
      };
    }

    const artists = event.eventArtists.map((ea) => ea.artist.name).join(", ");
    const description = event.description || `${event.name} - ${artists || "Evento en vivo"}`;
    const title = `${event.name} | tckt_`;

    // URL del evento
    const eventUrl = `https://www.tckt.fun/events/${event.id}`;

    // Imagen del evento (usa bannerUrl si existe, sino una imagen por defecto)
    const imageUrl = event.bannerUrl || "https://www.tckt.fun/background.jpg";

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
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "tckt_",
      description: "Plataforma de venta de tickets",
    };
  }
}

export default function EventLayout({ children }: Props) {
  return <>{children}</>;
}
