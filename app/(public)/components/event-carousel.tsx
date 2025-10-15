"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventCardData } from "@/lib/types/event.types";
import { toast } from "sonner";

type DotProps = { active: boolean };
function Dot({ active }: DotProps) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full transition-colors ${
        active ? "bg-neutral-100" : "bg-neutral-700"
      }`}
    />
  );
}

type CtaButtonsProps = {
  primaryAction: (e: React.MouseEvent<HTMLButtonElement>) => void;
  secondaryAction: (e: React.MouseEvent<HTMLButtonElement>) => void;
  primaryActionText: string;
  secondaryActionText: string;
  className?: string;
};

function CtaButtons({
  primaryAction,
  secondaryAction,
  primaryActionText,
  secondaryActionText,
  className,
}: CtaButtonsProps) {
  return (
    <div
      className={cn(
        "w-full px-4 pb-[calc(8px+env(safe-area-inset-bottom))]",
        "pointer-events-none",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-md rounded-2xl p-2",
          "bg-black/30 backdrop-blur-md border border-transparent",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        )}
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        }}
      >
        <div className="grid grid-cols-2 gap-2 pointer-events-auto">
          <Button
            onClick={primaryAction}
            type="button"
            className={cn(
              "h-12 w-full rounded-xl text-sm font-medium",
              "bg-white text-black hover:bg-neutral-100"
            )}
          >
            {primaryActionText}
          </Button>
          <Button
            onClick={secondaryAction}
            type="button"
            variant="ghost"
            className={cn(
              "h-12 w-full rounded-xl text-sm font-medium",
              "bg-white/5 hover:bg-white/10 text-white"
            )}
          >
            {secondaryActionText}
          </Button>
        </div>
      </div>
    </div>
  );
}

type EventCarouselProps = {
  events: EventCardData[];
  isLoggedIn: boolean;
};

export function EventCarousel({ events, isLoggedIn }: EventCarouselProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const formatRelativeDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch {
      return dateString;
    }
  };

  const current = events[index] ?? events[0];

  const handleShare = () => {
    if (!current) return;

    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.tckt.fun'}/events/${current.id}`;
    const artistsText = current.artists?.length > 0
      ? ` - ${current.artists.join(", ")}`
      : "";
    const text = `🎟️ ${current.name}${artistsText}\n📅 ${current.date}\n📍 ${current.location}`;

    if (navigator.share) {
      navigator.share({
        title: `🎟️ ${current.name}`,
        text: text,
        url: url
      })
      .then(() => toast.success("¡Evento compartido!"))
      .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado al portapapeles");
    }
  };

  const handleBuy = () => {
    if (!current) return;
    if (current.isSoldOut) {
      router.push(`/door-sale?eventId=${current.id}`);
      return;
    }
    if (!isLoggedIn) {
      router.push('/login?tab=signup');
      return;
    }
    router.push(`/events/${current.id}`);
  };

  const handleViewTickets = () => {
    if (!current) return;
    if (isLoggedIn) {
      router.push('/tickets');
    } else {
      router.push('/login');
    }
  };

  const go = (next: number) => {
    if (!events.length) return;
    const len = events.length;
    setIndex(((next % len) + len) % len);
  };

  if (!current) return null;

  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="absolute inset-0 z-10">
        <div className="relative h-full w-full">
          <Image
            src={current.imageUrl || "/background.png"}
            alt={current.labelName || "Evento"}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,transparent_35%),linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,transparent_20%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_80%,rgba(0,0,0,0.6),transparent)]" />
        </div>

        <div className="absolute inset-x-0 bottom-[140px] z-20 px-4">
          <div className="mx-auto max-w-lg">
            <div className="mb-3 flex items-center gap-2">
              <p className="text-sm font-medium text-white/70">
                {formatRelativeDate(current.date)} • {current.location}
              </p>
              {current.isSoldOut && (
                <span className="rounded-full bg-red-950/50 px-3 py-1 text-xs font-medium text-red-400 border border-red-900">
                  AGOTADO
                </span>
              )}
            </div>
            <h1 className="mb-2 text-3xl font-semibold leading-tight tracking-tight text-white">
              {current.name}
            </h1>
            {current.artists?.length > 0 && (
              <p className="text-base font-medium text-white/90">
                {current.artists.join(" • ")}
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-[112px] left-0 right-0 z-20 flex items-center justify-center gap-2">
          {events.map((_, i) => (
            <Dot key={i} active={i === index} />
          ))}
        </div>

        <div
          className="absolute inset-0 z-10"
          onTouchStart={(e) => {
            const x = e.touches[0].clientX;
            (e.currentTarget as HTMLElement & { __sx?: number }).__sx = x;
          }}
          onTouchEnd={(e) => {
            const sx = (e.currentTarget as HTMLElement & { __sx?: number }).__sx;
            if (typeof sx !== "number") return;
            const dx = e.changedTouches[0].clientX - sx;
            if (dx > 40) go(index - 1);
            if (dx < -40) go(index + 1);
          }}
          onClick={(e) => {
            const mid = window.innerWidth / 2;
            if ((e.target as HTMLElement).closest("button,a")) return;
            if (e.clientX < mid) go(index - 1);
            else go(index + 1);
          }}
        />

        <div className="absolute inset-x-0 bottom-0 z-30">
          {current.isSoldOut ? (
            <CtaButtons
              primaryAction={handleBuy}
              secondaryAction={handleViewTickets}
              primaryActionText="Comprar en Puerta"
              secondaryActionText="Mis Tickets"
              className="pb-6"
            />
          ) : (
            <CtaButtons
              primaryAction={handleBuy}
              secondaryAction={handleShare}
              primaryActionText="Comprar ahora"
              secondaryActionText="Compartir"
              className="pb-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}
