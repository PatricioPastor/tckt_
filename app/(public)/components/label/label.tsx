import { CalendarIcon, MapPinIcon, TicketIcon } from 'lucide-react';
import React from 'react'

interface LabelProps {
    date?: string;
    producer?:string
    location?: string;
}

export const Label = ({ date = 'Sin fecha' , producer = "La Juanita", location = "No Aplica" }: LabelProps) => {

  return (
    <div className="flex w-full text-gray-200 whitespace-nowrap font-medium text-sm md:text-base bg-white/10 backdrop-blur-[80px] gap-1 shadow-sm rounded-md p-3 justify-between items-center">
                        <span className='flex items-center justify-start gap-1'>
                            <CalendarIcon className="w-5 h-5" />
                            {date}
                        </span>
                        <span className='flex items-center justify-start gap-1'>
                            <TicketIcon className="w-5 h-5" />
                            {producer}
                        </span>
                        <span className='flex items-center justify-start gap-1'>
                            <MapPinIcon className="w-5 h-5" />
                            {location}
                        </span>
                    </div>
  )
}
