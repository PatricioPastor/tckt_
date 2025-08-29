'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/lib/store/user-store';


export function TicketsHeader() {
  const router = useRouter();
  const { user } = useUserStore();

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between px-4 py-6 pt-14">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-neutral-800 rounded-md transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-400" />
          </button>
          <h1 className="text-xl tracking-wide font-medium text-white">Mis tickets</h1>
        </div>
        
        <Avatar className="w-8 h-8">
          <AvatarImage 
            src={user?.image || ''} 
            alt={user?.username || 'Usuario'} 
          />
          <AvatarFallback className="bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-700">
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}