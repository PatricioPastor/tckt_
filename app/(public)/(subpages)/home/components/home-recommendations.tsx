'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { EventCardData } from '@/lib/types/event.types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type HomeRecommendationsProps = {
  events: EventCardData[];
  onSelectEvent: (id: number) => void;
};

const formatDate = (dateIso: string) => {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, "d MMM - HH:mm'h'", { locale: es });
};

export default function HomeRecommendations({ events, onSelectEvent }: HomeRecommendationsProps) {
  if (!events?.length) {
    return (
      <section className="rounded-xl border border-white/5 bg-[#0f0f0f] p-5 text-neutral-300">
        <p className="text-sm">
          No encontramos recomendaciones en este momento. Volvé más tarde o explorá la cartelera completa.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Recomendado para vos</p>
          <h2 className="text-lg font-semibold text-white">Seguimos tu ritmo y te sugerimos lo próximo.</h2>
        </div>
        <Button
          variant="ghost"
          onClick={() => onSelectEvent(events[0].id)}
          className="hidden rounded-lg border border-white/5 bg-[#131313] px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-white/15 hover:bg-[#181818] sm:inline-flex"
        >
          Ver más
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <article
            key={event.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#101010]"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <Image
                src={event.imageUrl || '/background.jpeg'}
                alt={event.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 flex flex-col text-sm text-neutral-100">
                <span className="font-semibold">{event.name}</span>
                <span className="text-xs text-neutral-300">{formatDate(event.date)}</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3 p-4 text-sm text-neutral-300">
              <p className="line-clamp-2">{event.location}</p>
              <Button
                variant="ghost"
                onClick={() => onSelectEvent(event.id)}
                className="inline-flex justify-between rounded-lg border border-white/5 bg-[#131313] px-3 py-2 text-sm font-medium text-neutral-100 hover:border-white/15 hover:bg-[#181818]"
              >
                Ver detalles
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
