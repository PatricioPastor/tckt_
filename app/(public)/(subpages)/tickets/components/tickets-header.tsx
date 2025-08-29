"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketsHeaderProps {
  totalTickets: number;
  proximosCount: number;
  terminadosCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const TicketsHeader = ({
  totalTickets,
  proximosCount,
  terminadosCount,
  isRefreshing,
  onRefresh
}: TicketsHeaderProps) => {
  return (
    <div className="px-4 py-4 border-b border-neutral-800/50 bg-gradient-to-r from-neutral-900/20 to-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalTickets}</p>
            <p className="text-xs text-neutral-400">Total</p>
          </div>
          
          <div className="text-center">
            <p className="text-xl font-semibold text-emerald-400">{proximosCount}</p>
            <p className="text-xs text-neutral-400">Próximos</p>
          </div>
          
          <div className="text-center">
            <p className="text-xl font-semibold text-neutral-500">{terminadosCount}</p>
            <p className="text-xs text-neutral-400">Usados</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            "p-2 rounded-full border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-700/50 transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isRefreshing && "animate-pulse"
          )}
          title="Actualizar tickets"
        >
          <RefreshCw 
            className={cn(
              "h-4 w-4 text-neutral-300",
              isRefreshing && "animate-spin"
            )} 
          />
        </button>
      </div>

      {proximosCount === 0 && terminadosCount === 0 && totalTickets === 0 && (
        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-200">
            ¡Aún no tienes tickets! Explora eventos disponibles y compra tus entradas.
          </p>
        </div>
      )}
    </div>
  );
};