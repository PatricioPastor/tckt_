"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Assume Shadcn UI
import { QrCode02 } from '@untitledui/icons';
import { Badge } from '@/components/ui/badge';
import BackHeader from '@/components/back-header/back-header';


export default function Page() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tickets/my', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // Assume token from Better Auth
        });
        if (!res.ok) throw new Error('Failed to fetch tickets');
        const data = await res.json();
        setTickets(data.data || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen text-white">Cargando tickets...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  const getBadgeVariant = (status: any) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default'; // Verde claro
      case 'paid':
        return 'success'; // Verde
      case 'used':
        return 'secondary'; // Gris
      case 'transferred':
        return 'warning'; // Amarillo
      default:
        return 'default';
    }
  };
  // Filter based on status (per endpoint response)
  const now = new Date();
  const proximos = tickets.filter((t: any) => ['pending', 'paid'].includes(t.status) && new Date(t.event.date) > now);
  const terminados = tickets.filter((t: any) => ['used', 'transferred'].includes(t.status) || new Date(t.event.date) < now);

  return (
    <div className="bg-black min-h-screen text-white">
      <BackHeader className='p-3' title="Mis tickets" />

      <Tabs defaultValue="proximos" className="px-4">
        <TabsList className="bg-black w-full flex border-b border-neutral-800">
          <TabsTrigger value="proximos"  className={`flex-1  border-none border-b  rounded-none text-white ${proximos.length > 0 ? 'border-b' : ''}`}>PRÓXIMOS</TabsTrigger>
          <TabsTrigger value="terminados" className="flex-1 rounded-none text-neutral-400">TERMINADOS</TabsTrigger>
        </TabsList>
        <TabsContent value="proximos" className="mt-4">
          {proximos.map((ticket: any) => {
            const event = ticket.event;
            // const artistsString = event.eventArtists.map((ea:any) => ea.artist.name).join(' B2B ');
            const eventDate = new Date(event.date);

            return (
              <div key={ticket.id} className="bg-neutral-800 rounded-2xl overflow-hidden mb-4">
                <div className="relative p-3 rounded-2xl h-40">
                
                  <Image
                    src={event.bannerUrl || '/placeholder-banner.jpg'}
                    alt={event.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="opacity-80"
                  />
                  <span className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm shadow-sm rounded-full p-2 ">
                    <QrCode02 size={24} />
                  </span>
                  <div className='absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-80 '></div>
                  <div className="absolute bottom-0 flex items-start justify-end gap-1 flex-col left-0 w-full px-3 pb-3">
                    <div className="flex gap-2 flex-row items-center justify-start">
                      <p className="text-gray-300 ">
                        {eventDate.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'numeric' })} • {event.location}
                      </p>
                      <Badge className='text-xs px-1 py-0.5' variant={getBadgeVariant(ticket.status) as any} >
                        {ticket.status.toUpperCase()}
                      </Badge>
                      <Badge className='text-xs px-1 py-0.5' variant="destructive" >
                        {ticket.type.type.toUpperCase()}
                      </Badge>
                      {/* <p className="text-white text-sm">{artistsString}</p> */}

                    </div>
                    <h2 className="text-white text-xl font-bold">{event.name.toUpperCase()}</h2>
                  </div>
                  
                </div>

                {/*  */}
              </div>
            );
          })}
          {proximos.length === 0 && <p className="text-neutral-400 text-center">No hay tickets próximos</p>}
        </TabsContent>
        <TabsContent value="terminados" className="mt-4">
          {terminados.map((ticket: any) => {
            const event = ticket.event;
            const artistsString = event.eventArtists.map((ea: any) => ea.artist.name).join(' B2B ');
            const eventDate = new Date(event.date);

            return (
              <div key={ticket.id} className="bg-neutral-800 rounded-lg overflow-hidden mb-4">
                <div className="relative h-40">
                  <Image
                    src={event.bannerUrl || '/placeholder-banner.jpg'}
                    alt={event.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="opacity-80"
                  />
                  <span className="absolute top-2 right-2 bg-white/10 backdrop-blur-md shadow-lg rounded-full p-2 border border-white/20">
                    <QrCode02 size={24} />
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-neutral-400 text-xs mb-1">{eventDate.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'numeric' })} • {event.location}</p>
                  <h2 className="text-white text-lg font-bold">{event.name.toUpperCase()}</h2>
                  <p className="text-white text-sm">{artistsString}</p>
                  <p className="text-neutral-400 text-xs mt-1">Tipo: {ticket.type.type}, Estado: {ticket.status}</p>
                </div>
              </div>
            );
          })}
          {terminados.length === 0 && <p className="text-neutral-400 text-center">No hay tickets terminados</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}