"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import { useEventStore } from "@/lib/store/event-store";
import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";
import { type EventWithDetails, type CartItem } from "@/lib/types";




import {
  Calendar,
  Share06,
  Map01,
  MarkerPin01,
  ChevronLeft,
  ShoppingCart02,
} from "@untitledui/icons";
import { TicketCard } from "./components/ticket/ticket-card";
import { Description } from "./components/description/description";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { selectedEvent, loading, error, fetchEventById, clearSelected } =
    useEventStore();

  const { items, getTotal, setEventId } = useCartStore();

  const [showCartSummary, setShowCartSummary] = useState(false);

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );
  const hasItems = totalItems > 0;

  useEffect(() => {
    if (id) {
      fetchEventById(id);
      setEventId(Number(id));
    }
    return () => clearSelected();
  }, [id, fetchEventById, clearSelected, setEventId]);

  const handleBuy = () => {
    if (!hasItems) return;
    router.push("/checkout");
  };

  const scrollToTickets = () => {
    document.getElementById("tickets-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-neutral-300">
        Cargando evento…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-red-400">
        {error}
      </div>
    );
  }
  if (!selectedEvent) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-neutral-300">
        Evento no encontrado.
      </div>
    );
  }

  const { name, date, location, description, bannerUrl, ticketTypes, eventArtists } =
    selectedEvent;
  const artists = eventArtists?.map((ea) => ea.artist.name) ?? [];

  return (
    <div className="relative min-h-screen bg-black text-neutral-300">
      {/* HERO */}
      <div className="relative h-80 w-full sm:h-96">
        <Image
          src={
            bannerUrl ||
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80"
          }
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlays Geist */}
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
                const url = window.location.href;
                if (navigator.share) navigator.share({ title: name, url });
                else navigator.clipboard.writeText(url);
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
          <button
            onClick={scrollToTickets}
            className="mt-3 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Ver tickets
          </button>
        </div>
      </div>

      {/* CART SHEET */}
      {showCartSummary && hasItems && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0E0E0E] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-100">
                Resumen del carrito
              </h3>
              <button
                onClick={() => setShowCartSummary(false)}
                className="text-neutral-400 transition-colors hover:text-white"
                aria-label="Cerrar resumen"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 space-y-3">
              {items.map((item: CartItem) => (
                  <div key={`${item.eventId}-${item.typeId}`} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-100">
                        {item.label.toUpperCase()}
                      </p>
                      <p className="text-sm text-neutral-400">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-neutral-100">
                      ${(item.price * item.quantity).toLocaleString("es-AR")}
                    </p>
                  </div>
                ))}
            </div>

            <div className="border-t border-neutral-800 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-semibold text-neutral-100">Total</p>
                <p className="text-xl font-bold text-neutral-100">
                  ${getTotal().toLocaleString("es-AR")}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCartSummary(false);
                  handleBuy();
                }}
                className="h-11 w-full rounded-md bg-neutral-100 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
              >
                Proceder al checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="relative space-y-8 px-4 pb-28 pt-6">
        {/* Chips info */}
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
            <span className="font-medium">{selectedEvent?.name}</span>
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
            {ticketTypes.map((tt, i: number) => (
              <div
                key={tt.id}
                className="animate-[fadeInUp_300ms_ease] [animation-delay:var(--d)]"
                style={{ "--d": `${i * 80}ms` } as React.CSSProperties}
              >
                <TicketCard ticketType={tt} />
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

          {ticketTypes.length > 0 && (
            <div className="rounded-xl border border-neutral-800 bg-[#0E0E0E] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Precios disponibles
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ticketTypes.map((tt) => (
                  <div
                    key={tt.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-neutral-300">{tt.label.toUpperCase()}</span>
                    <span className="font-medium text-neutral-100">
                      ${Number(tt.price).toLocaleString("es-AR")}
                    </span>

                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-800 bg-black/95 p-4 backdrop-blur-sm">
        <div className="flex gap-3">
          <button className="flex-1 rounded-md bg-[#141414] px-4 py-3 text-sm font-medium text-neutral-200 transition-colors hover:bg-[#191919]">
            Referir evento
          </button>
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

      {/* Animación simple */}
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
