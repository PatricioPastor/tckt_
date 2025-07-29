"use client"

import { useEventStore } from "@/lib/store/event-store";
import { useEffect } from "react";
import { EventCard } from "./components/event-card/event-card";

export default function Page() {

  const { events, loading, error, fetchEvents } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents])

  if (loading) return <div className="flex justify-center items-center h-screen text-white bg-black">Cargando...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500 bg-black">Error: {error}</div>;
  if (events.length === 0) return <div className="flex justify-center items-center h-screen text-white bg-black">No hay eventos disponibles.</div>;

  // Por ahora, renderizamos solo la primera tarjeta. Más adelante se puede hacer un carrusel.
  const event = events[0];

  // Formateamos la fecha para que coincida con el diseño "Sáb 16/06"
  const formattedDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).replace('.', '');

  return (
    <div className="bg-black h-full  flex items-center justify-center ">

      <EventCard 
        artists={event.artists}
        date={formattedDate}
        labelName={event.labelName}
        location={event.location}
        eventId={event.id}
        imageUrl={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'} // Imagen de fallback
      />
    </div>
  );
}
