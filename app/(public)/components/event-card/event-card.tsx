import React from 'react';
import Image from 'next/image';
import { Label } from '../label/label';
import { CalendarIcon, MapPinIcon, TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CtaButtons } from '@/components/cta-buttons/cta-buttons';


interface EventCardProps {
    artists: string[];
    date: string;
    labelName: string;
    location: string;
    imageUrl: string;
    eventId: number;
}

export const EventCard = ({ artists, date, labelName, location, imageUrl, eventId }: EventCardProps) => {
    
    const router = useRouter();
    
    const buyEvent = () => {
        router.push(`/events/${eventId}`);
    }

    return (
        <div className="relative rounded-2xl overflow-hidden w-full h-full mx-auto font-sans shadow-lg bg-black flex flex-col">
            {/* Background image covers the entire card */}
            <Image
                src={imageUrl}
                alt="Event Background"
                layout="fill"
                objectFit="cover"
                className="absolute z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 z-10"></div>
            
            {/* Content wrapper */}
            <div className="relative z-20 flex flex-col h-full">
                {/* Header section with artists */}
                <div className="p-4">
                    
                </div>
                
                {/* Middle section for tags and carousel */}
                <div className="flex-grow p-4 gap-3 items-start flex flex-col justify-end">
                    
                    <div className="flex flex-col items-start justify-end gap-[6px]">
                    {artists.map((artist, index) => (
                        <h2 key={index} className="md:text-4xl text-2xl font-bold tracking-tighter uppercase leading-tight text-white">
                            {artist}
                        </h2>
                    ))}
                    </div>
                    
                    
                    <Label date={date} location={location} />
                </div>
                
                {/* Footer with CTAs */}
                <CtaButtons 
                  primaryAction={buyEvent} 
                  secondaryAction={() => {}} 
                  primaryActionText="Comprar ahora" 
                  secondaryActionText="Referir evento" 
                />
            </div>
        </div>
    );
};
