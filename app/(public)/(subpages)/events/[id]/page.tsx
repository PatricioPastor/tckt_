"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventStore, EventWithDetails } from '@/lib/store/event-store';
import { IconArrowLeft, IconShare, IconCalendar, IconMapPin, IconBuilding, IconChevronDown, IconPlus, IconMinus } from '@tabler/icons-react';
import Image from 'next/image';
import { CtaButtons } from '@/components/cta-buttons/cta-buttons';
import { Label } from '../../components/label/label';
import { TicketCard } from './components/ticket/ticket-card';

import { Calendar, Share06, Map01, MarkerPin01, ChevronLeft, ChevronDown  } from "@untitledui/icons";
import { Description } from './components/description/description';

import { useCartStore } from '@/lib/store/cart-store';



// Componente principal de la página
export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; 

  const {
    selectedEvent,
    loading,
    error,
    fetchEventById,
    clearSelected,
  } = useEventStore();

  const { eventId, items, addItem, updateQuantity, getTotal, setEventId } = useCartStore();

  useEffect(() => {
    if (id) {
      fetchEventById(id);
      setEventId(Number(id || 0));
    }
    
    return () => {
      clearSelected();
    };
  }, [id, fetchEventById, clearSelected]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Cargando evento...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!selectedEvent) {
    return <div className="flex justify-center items-center h-screen text-white">Evento no encontrado.</div>;
  }

  // const isAdult = birthDate && new Date(user.birthDate) <= new Date(new Date().setFullYear(new Date().getFullYear() - 18));

  const handleBuy = () => {
    // if (!isAdult) {
    //   alert('Verifica +18 en perfil para comprar.');
    //   return;
    // }
    if (getTotal() === 0) {
      alert('Selecciona al menos un ticket.');
      return;
    }
    router.push('/checkout'); // Navega a checkout
  };

  const { name, date, location, description, bannerUrl, ticketTypes, eventArtists } = selectedEvent;
  const eventDate = new Date(date);

  return (
    <div className="bg-black min-h-screen text-neutral-300"> 
      <div className="relative h-80">
        <Image
          src={bannerUrl || '/background1.jpg'} 
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-60"
        />
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 flex justify-between items-center">
          <button onClick={() => router.back()} className="text-white p-2 bg-white/10 backdrop-blur-[4px] rounded-full"><ChevronLeft /></button>
          <button className="text-white p-2 bg-white/10 backdrop-blur-[4px] rounded-full"><Share06 /></button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h1 className="text-white text-2xl font-bold">{name.toUpperCase()}</h1>
          <p className="text-white text-sm">{eventArtists.map(ea => ea.artist.name).join(' • ')}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col items-start justify-start gap-6">
        <div className="flex w-full text-wihte/70  whitespace-nowrap font-medium text-sm md:text-base gap-6 justify-start items-center">
                        <span className='flex items-center justify-start gap-1'>
                            <Calendar className="size-5" />
                            {'Vie 16/08'}
                        </span>
                        <span className='flex items-center justify-start gap-1'>
                            <Map01 className="size-5" />
                            {'La Juanita'}
                        </span>
                        <span className='flex items-center justify-start gap-1'>
                            <MarkerPin01 className="size-5" />
                            {location}
                        </span>
        </div>

        <Description description={description || 'No hay descripción disponible para este evento.'} />

        <div className='flex pb-[72px] items-start flex-col justify-start gap-6'>
          <h2 className="text-white font-semibold font-mono ">tckts_</h2>
          {ticketTypes.map(tt => (
            <TicketCard key={tt.id} ticketType={tt} />
          ))}
        </div>
      </div>

      <CtaButtons 
        className="fixed bottom-0 left-0 right-0 bg-black p-4 flex gap-4 border-t border-neutral-800"
        primaryAction={handleBuy} 
        secondaryAction={() => {}} 
        primaryActionText="Comprar ahora" 
        secondaryActionText="Referir evento" 
        />
    </div>
  );
}