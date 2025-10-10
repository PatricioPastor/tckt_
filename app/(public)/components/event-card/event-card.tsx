import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface EventCardProps {
    artists: string[];
    date: string;
    labelName: string;
    location: string;
    imageUrl: string;
    eventId: number;
    status?: string;
    isSoldOut?: boolean;
}

export const EventCard = ({ artists, date, labelName, location, imageUrl, eventId, status, isSoldOut }: EventCardProps) => {
    const router = useRouter();

    const formatDate = (date: string) => {
        const eventDate = new Date(date);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        };
        return eventDate.toLocaleDateString('es-AR', options);
    };

    const formatTime = (date: string) => {
        const eventDate = new Date(date);
        return eventDate.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleClick = () => {
        // Siempre ir a la página de detalle del evento
        router.push(`/events/${eventId}`);
    };

    return (
        <div 
            onClick={handleClick}
            className="group border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors bg-neutral-900/50 cursor-pointer"
        >
            <div className="flex items-start gap-4">
                {/* Imagen del evento */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                        src={imageUrl || '/placeholder-event.jpg'}
                        alt={labelName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                </div>

                {/* Información del evento */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-medium text-base leading-tight truncate">
                            {labelName}
                        </h3>
                        {isSoldOut ? (
                            <Badge className="ml-2 bg-red-950/50 text-red-400 border-red-900 text-xs">
                                AGOTADO
                            </Badge>
                        ) : status && (
                            <Badge className="ml-2 bg-neutral-800 text-neutral-300 border-neutral-700 text-xs">
                                {status}
                            </Badge>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-neutral-400 mb-1">
                        <span>{formatDate(date)}</span>
                        <span>•</span>
                        <span>{formatTime(date)}</span>
                    </div>
                    
                    <div className="text-sm text-neutral-500 mb-2 truncate">
                        {location}
                    </div>
                    
                    {artists.length > 0 && (
                        <div className="text-sm text-neutral-400 truncate">
                            {artists.join(', ')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
