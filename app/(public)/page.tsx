import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getPublishedEvents } from "@/lib/data/events";
import { SiteHeader } from "@/components/site-header";
import { EventCarousel } from "./components/event-carousel";
import { MobileOnlyGuard } from "./components/mobile-only-guard";

export const metadata: Metadata = {
  title: "tckt_ - Tus eventos, tus entradas",
  description: "Descubrí los mejores eventos y comprá tus entradas de forma rápida y segura.",
};

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  // Get session from server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get events from database (cached)
  const events = await getPublishedEvents();

  // Empty state
  if (!events || events.length === 0) {
    return (
      <div className="relative min-h-screen w-full bg-black">
        <SiteHeader user={session?.user ?? null} />
        <div className="flex h-[calc(100vh-56px)] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-800 bg-[#0E0E0E]">
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-neutral-600">
                <path
                  d="M8 2V5M16 2V5M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-white">No hay eventos programados</h3>
            <p className="text-sm text-neutral-500">Los próximos eventos aparecerán acá</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileOnlyGuard>
      <div className="absolute left-0 right-0 top-0 z-30">
        <SiteHeader user={session?.user ?? null} />
      </div>
      <EventCarousel events={events} isLoggedIn={!!session?.user} />
    </MobileOnlyGuard>
  );
}
