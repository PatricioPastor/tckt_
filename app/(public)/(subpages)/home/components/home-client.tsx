'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import type { EventCardData } from '@/lib/types/event.types';
import { useTicketsStore, Ticket, TicketStatus } from '@/lib/store/tickets-store';

import HomeWelcomeBlock from './home-welcome-block';
import HomeTodayCard from './home-today-card';
import HomeQuickActions from './home-quick-actions';
import HomeRecommendations from './home-recommendations';

type HomeClientProps = {
  userName: string;
  recommendedEvents: EventCardData[];
};

type UpcomingTicket = {
  ticket: Ticket;
  eventDate: Date;
};

const relevantStatuses = [TicketStatus.Paid, TicketStatus.Pending];

export default function HomeClient({ userName, recommendedEvents }: HomeClientProps) {
  const router = useRouter();

  const tickets = useTicketsStore((state) => state.tickets);
  const isLoading = useTicketsStore((state) => state.isLoading);
  const findTickets = useTicketsStore((state) => state.findTickets);

  useEffect(() => {
    findTickets().catch(() => undefined);
  }, [findTickets]);

  const upcomingTicket = useMemo<UpcomingTicket | null>(() => {
    if (!tickets?.length) return null;

    const now = new Date();

    const parsed = tickets
      .filter((ticket) => relevantStatuses.includes((ticket as any).status))
      .map((ticket) => {
        const rawDate = (ticket.event?.date ?? null) as unknown;
        const eventDate = rawDate instanceof Date ? rawDate : new Date(rawDate as string);

        if (Number.isNaN(eventDate.getTime())) {
          return null;
        }

        return { ticket, eventDate };
      })
      .filter(Boolean) as UpcomingTicket[];

    if (!parsed.length) return null;

    parsed.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

    const firstFuture = parsed.find(({ eventDate }) => eventDate.getTime() >= now.getTime());

    return firstFuture ?? parsed[0];
  }, [tickets]);

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const now = new Date();
    return (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate()
    );
  };

  const handleViewTickets = () => router.push('/tickets');
  const handleExploreEvents = () => router.push('/events');
  const handleInviteFriends = () => router.push('/profile?tab=referrals');
  const handleManageProfile = () => router.push('/profile');

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <HomeWelcomeBlock
        userName={userName}
        hasUpcoming={Boolean(upcomingTicket)}
        upcomingName={upcomingTicket?.ticket.event?.name ?? ''}
        upcomingDate={upcomingTicket?.eventDate ?? null}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <HomeTodayCard
          isLoading={isLoading}
          ticket={upcomingTicket?.ticket ?? null}
          eventDate={upcomingTicket?.eventDate ?? null}
          isToday={isToday(upcomingTicket?.eventDate ?? null)}
          onViewTickets={handleViewTickets}
          onExploreEvents={handleExploreEvents}
        />

        <HomeQuickActions
          actions={[
            {
              id: 'explore',
              label: 'Buscar eventos',
              description: 'Descubrí lo que viene.',
              onClick: handleExploreEvents,
            },
            {
              id: 'tickets',
              label: 'Mis tickets',
              description: 'QR y accesos rápidos.',
              onClick: handleViewTickets,
            },
            {
              id: 'friends',
              label: 'Invitar amigos',
              description: 'Compartí tus eventos.',
              onClick: handleInviteFriends,
            },
            {
              id: 'profile',
              label: 'Mi perfil',
              description: 'Datos, pagos, preferencias.',
              onClick: handleManageProfile,
            },
          ]}
        />
      </section>

      <HomeRecommendations events={recommendedEvents} onSelectEvent={(id) => router.push(`/events/${id}`)} />
    </main>
  );
}
