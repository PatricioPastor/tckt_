"use client";

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IconArrowRight, IconCalendar, IconMapPin } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import type { Ticket } from '@/lib/store/tickets-store';

type HomeTodayCardProps = {
  ticket: Ticket | null;
  eventDate: Date | null;
  isToday: boolean;
  isLoading: boolean;
  onViewTickets: () => void;
  onExploreEvents: () => void;
};

const formatDay = (date: Date | null) => {
  if (!date) return '';
  return format(date, "EEEE d 'de' MMMM - HH:mm'h'", { locale: es });
};

const Skeleton = () => (
  <article className="flex min-h-[180px] flex-col justify-between rounded-xl border border-white/5 bg-[#111111] p-5 text-neutral-300">
    <div className="space-y-2">
      <div className="h-3 w-24 rounded-md bg-white/10" />
      <div className="h-6 w-40 rounded-md bg-white/10" />
      <div className="h-3 w-28 rounded-md bg-white/10" />
    </div>
    <div className="h-9 w-32 rounded-md bg-white/10" />
  </article>
);

export default function HomeTodayCard({
  ticket,
  eventDate,
  isToday,
  isLoading,
  onViewTickets,
  onExploreEvents,
}: HomeTodayCardProps) {
  if (isLoading) {
    return <Skeleton />;
  }

  if (!ticket || !eventDate) {
    return (
      <article className="flex flex-col justify-between rounded-xl border border-white/5 bg-[#101010] p-5 text-neutral-100">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Sin tickets próximos</p>
          <h2 className="text-lg font-semibold text-white">Elegí tu próximo evento</h2>
          <p className="text-sm text-neutral-400">
            Todavía no registramos tickets activos. Explorá la cartelera y sumalos para verlos acá apenas se acrediten.
          </p>
        </div>
        <Button
          onClick={onExploreEvents}
          className="mt-6 w-fit rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
        >
          Explorar eventos
        </Button>
      </article>
    );
  }

  const { event } = ticket;

  return (
    <article className="flex flex-col justify-between rounded-xl border border-white/5 bg-[#101010] p-5 text-neutral-100">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{isToday ? 'Es hoy' : 'Próximo evento'}</p>
        <h2 className="text-xl font-semibold text-white">{event?.name}</h2>
        <div className="flex flex-col gap-2 text-sm text-neutral-300">
          <span className="inline-flex items-center gap-2">
            <IconCalendar size={16} />
            {formatDay(eventDate)}
          </span>
          {event?.location ? (
            <span className="inline-flex items-center gap-2">
              <IconMapPin size={16} />
              {event.location}
            </span>
          ) : null}
        </div>
      </div>

      <Button
        onClick={onViewTickets}
        className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
      >
        Mostrar QR
        <IconArrowRight size={16} />
      </Button>
    </article>
  );
}
