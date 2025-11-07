"use client";

import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Search as SearchIcon, X as ClearIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { EventCardData } from "@/lib/types/event.types";

type EventSearchProps = {
  events: EventCardData[];
};

export function EventSearch({ events }: EventSearchProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = useMemo(() => normalizeText(query), [query]);

  const filteredEvents = useMemo(() => {
    if (!normalizedQuery) return events;

    return events.filter((event) => {
      const haystack = [
        event.name,
        event.location,
        event.labelName,
        event.artists.join(" "),
      ]
        .map(normalizeText)
        .join(" ");

      return haystack.includes(normalizedQuery);
    });
  }, [events, normalizedQuery]);

  const helperText = normalizedQuery
    ? `para "${query.trim()}"`
    : "ordenados por fecha";

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-white/5 bg-[#0f0f0f] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <p className="text-sm font-medium text-white">Buscar eventos</p>
        <p className="text-sm text-neutral-400">
          Filtrá por artista, venue o ciudad.
        </p>

        <div className="relative mt-4">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej: Córdoba, música electrónica, Duki..."
            className="h-12 rounded-2xl border-white/10 bg-black/30 pl-11 pr-11 text-white placeholder:text-neutral-500"
            aria-label="Buscar eventos por nombre, artista o ciudad"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              <ClearIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Mostrando {filteredEvents.length} de {events.length} eventos {helperText}
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#0b0b0b] p-10 text-center text-neutral-400">
          <p className="text-base font-semibold text-white">Sin coincidencias</p>
          <p className="mt-2 text-sm text-neutral-500">
            Ajustá los términos o intentá con otra ciudad/artista.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <EventResultCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

function EventResultCard({ event }: { event: EventCardData }) {
  const router = useRouter();
  const eventDateLabel = formatEventDate(event.date);

  const handleNavigation = () => {
    router.push(`/events/${event.id}`);
  };

  const handleKeyDown = (eventKey: KeyboardEvent<HTMLElement>) => {
    if (eventKey.key === "Enter" || eventKey.key === " ") {
      eventKey.preventDefault();
      handleNavigation();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleNavigation}
      onKeyDown={handleKeyDown}
      className="group flex w-full cursor-pointer gap-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-4 text-left transition hover:border-white/20 hover:bg-[#111112] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      aria-label={`Ver detalles del evento ${event.name}`}
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-white/5">
        <Image
          src={event.imageUrl || "/background.jpeg"}
          alt={event.name}
          fill
          sizes="80px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <p className="text-[13px] uppercase tracking-[0.25em] text-neutral-500">
              {event.labelName || "Evento"}
            </p>
            <h3 className="text-base font-semibold text-white">{event.name}</h3>
          </div>
          {event.isSoldOut && (
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-200">
              Agotado
            </span>
          )}
        </div>

        <p className="text-sm text-neutral-300">{eventDateLabel}</p>
        <p className="text-sm text-neutral-400">{event.location}</p>

        {event.artists.length > 0 && (
          <p className="text-xs text-neutral-500">
            {event.artists.join(" • ")}
          </p>
        )}
      </div>
    </article>
  );
}

function formatEventDate(dateIso: string) {
  try {
    const parsed = parseISO(dateIso);
    if (!isValid(parsed)) return dateIso;
    return format(parsed, "EEEE d 'de' MMMM • HH:mm'h'", { locale: es });
  } catch {
    return dateIso;
  }
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
