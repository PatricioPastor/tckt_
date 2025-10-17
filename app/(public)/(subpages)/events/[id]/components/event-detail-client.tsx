"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Share06,
  Map01,
  MarkerPin01,
  ChevronLeft,
  ShoppingCart02
} from "@untitledui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import type { EventWithDetails } from "@/lib/types/event.types";
import { TicketCard } from "./ticket/ticket-card";
import { Description } from "./description/description";
import { toast } from "sonner";
import { ReferralBadge } from "@/components/referral-badge/referral-badge";

type EventDetailClientProps = {
  event: EventWithDetails;
  isLoggedIn: boolean;
};

export function EventDetailClient({ event, isLoggedIn }: EventDetailClientProps) {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const [showCartSummary, setShowCartSummary] = useState(false);

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );
  const hasItems = totalItems > 0;

  const { name, date, location, description, bannerUrl, ticketTypes, eventArtists, isSoldOut } = event;
  const artists = eventArtists?.map((ea) => ea.artist.name) ?? [];

  const handleBuy = () => {
    if (isSoldOut) {
      router.push(`/door-sale?eventId=${event.id}`);
      return;
    }
    if (!hasItems) return;
    router.push("/checkout");
  };

  const handleViewTickets = () => {
    if (isLoggedIn) {
      router.push("/tickets");
    } else {
      router.push("/login");
    }
  };

  const handleDoorSale = () => {
    router.push(`/door-sale?eventId=${event.id}`);
  };

  const scrollToTickets = () => {
    document.getElementById("tickets-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="relative min-h-screen bg-black text-neutral-300">
      {/* HERO */}
      <div className="relative h-80 w-full sm:h-96">
        <Image
          src={bannerUrl || "/background.jpeg"}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlays */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,transparent_35%),linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,transparent_20%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_80%,rgba(0,0,0,0.6),transparent)]" />

        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Volver"
          >
            <ChevronLeft />
          </button>
          <div className="flex gap-2">
            {hasItems && (
              <button
                onClick={() => setShowCartSummary((v) => !v)}
                className="relative rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Abrir carrito"
              >
                <ShoppingCart02 />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-black">
                  {totalItems}
                </span>
              </button>
            )}
            <button
              onClick={() => {
                const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.tckt.fun'}/events/${event.id}`;
                const artistsText = artists.length > 0 ? ` - ${artists.join(", ")}` : "";
                const text = `🎟️ ${name}${artistsText}\n📅 ${date}\n📍 ${location}`;
                
                if (navigator.share) {
                  navigator.share({ 
                    title: `🎟️ ${name}`, 
                    text: text,
                    url: url 
                  })
                  .then(() => toast.success("¡Evento compartido!"))
                  .catch(() => {});
                } else {
                  navigator.clipboard.writeText(url);
                  toast.success("Link copiado al portapapeles");
                }
              }}
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Compartir"
            >
              <Share06 />
            </button>
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
            {name.toUpperCase()}
          </h1>
          {artists.length > 0 && (
            <p className="mt-1 text-sm text-white/90">{artists.join(" • ")}</p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 flex-wrap">
            {isSoldOut && (
              <span className="rounded-full bg-red-950/50 px-4 py-2 text-sm text-red-400 border border-red-900">
                AGOTADO
              </span>
            )}

            {isSoldOut ? (
              <>
                <button
                  onClick={handleViewTickets}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Ver Tickets
                </button>
                <button
                  onClick={handleDoorSale}
                  className="rounded-full bg-white px-4 py-2 text-sm text-black transition-colors hover:bg-neutral-200 font-medium"
                >
                  Comprar en Puerta
                </button>
              </>
            ) : (
              <button
                onClick={scrollToTickets}
                className="rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Ver tickets
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CART SHEET */}
      {showCartSummary && hasItems && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setShowCartSummary(false)}
        >
          <div 
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-neutral-800 bg-[#0A0A0A] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 p-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Tu carrito
                </h3>
                <p className="text-sm text-neutral-400 mt-0.5">
                  {totalItems} {totalItems === 1 ? 'ticket' : 'tickets'} seleccionado{totalItems !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowCartSummary(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                aria-label="Cerrar carrito"
              >
                <ChevronLeft className="size-5 rotate-180" />
              </button>
            </div>

            {/* Items */}
            <div className="max-h-[50vh] overflow-y-auto p-6 space-y-3">
              {items.map((item) => (
                <div 
                  key={item.code} 
                  className="group rounded-lg border border-neutral-800 bg-[#0E0E0E] p-4 transition-colors hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white mb-1 truncate">
                        {item.label}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-neutral-500">
                          ${item.price.toLocaleString("es-AR")} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-base font-bold text-white">
                        ${(item.price * item.quantity).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-800 bg-[#0E0E0E] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-neutral-400">Total</span>
                <span className="font-mono text-2xl font-bold text-white">
                  ${getTotal().toLocaleString("es-AR")}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCartSummary(false);
                  handleBuy();
                }}
                className="w-full h-12 rounded-lg bg-white text-black text-sm font-semibold transition-all hover:bg-neutral-100 active:scale-[0.98]"
              >
                Continuar al checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="relative space-y-8 px-4 pb-28 pt-6">
        {/* Referral Badge */}
        <ReferralBadge />

        {/* Info chips */}
        <div className="flex flex-wrap gap-4 text-neutral-300">
          <span className="inline-flex items-center gap-2 text-sm">
            <Calendar className="size-5 text-neutral-400" />
            <span className="font-medium">
              {new Date(date).toLocaleDateString("es-AR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <Map01 className="size-5 text-neutral-400" />
            <span className="font-medium">{name}</span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <MarkerPin01 className="size-5 text-neutral-400" />
            <span className="font-medium">{location}</span>
          </span>
        </div>

        <Description description={description || ""} />

        {/* Tickets */}
        <section id="tickets-section" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono text-xl font-semibold text-white">tckts_</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Seleccioná tus tickets para {name}
              </p>
            </div>

            {hasItems && (
              <button
                onClick={() => setShowCartSummary(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-[#191919]"
              >
                <ShoppingCart02 className="size-4" />
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {ticketTypes.map((tt, i) => (
              <div
                key={tt.id}
                className="animate-[fadeInUp_300ms_ease] [animation-delay:var(--d)]"
                style={{ "--d": `${i * 80}ms` } as React.CSSProperties}
              >
                <TicketCard ticketType={tt as any} />
              </div>
            ))}
          </div>

          {ticketTypes.length === 0 && (
            <div className="rounded-xl border border-neutral-800 bg-[#0E0E0E] py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#141414]">
                <ShoppingCart02 className="size-8 text-neutral-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Sin tickets disponibles</h3>
              <p className="text-sm text-neutral-400">
                No hay tipos de tickets disponibles para este evento.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-800 bg-black/95 p-4 backdrop-blur-sm">
        <div className="flex gap-3">
          <button
            onClick={handleBuy}
            disabled={!hasItems}
            className={cn(
              "flex-1 rounded-md px-4 py-3 text-sm font-semibold transition-all",
              hasItems
                ? "bg-neutral-100 text-black hover:bg-neutral-200"
                : "cursor-not-allowed bg-[#151515] text-neutral-500"
            )}
          >
            {hasItems ? `Comprar (${totalItems})` : "Seleccioná tickets"}
          </button>
        </div>

        {hasItems && (
          <p className="mt-2 text-center text-sm text-neutral-400">
            Total:{" "}
            <span className="font-semibold text-neutral-100">
              ${getTotal().toLocaleString("es-AR")}
            </span>
          </p>
        )}
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
