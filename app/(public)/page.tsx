"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

import { useEventStore } from "@/lib/store/event-store";
import { useUserStore } from "@/lib/store/user-store";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function HomePage() {
  const { events, loading, error, fetchEvents } = useEventStore();
  const { user } = useUserStore();
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth > 500);
    };
    
    checkViewport();
    window.addEventListener("resize", checkViewport);
    
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  if (isDesktop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="text-center text-white">
          <p className="text-lg">Esta aplicación no soporta computadoras, ingrese desde el teléfono móvil</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const sorted = useMemo(() => {
    return [...events]
      .map((e) => ({
        ...e,
        dateIso:
          new Date(e.date).toString() === "Invalid Date"
            ? null
            : new Date(e.date).toISOString(),
      }))
      .sort((a, b) => {
        const da = a.dateIso
          ? new Date(a.dateIso).getTime()
          : Number.MAX_SAFE_INTEGER;
        const db = b.dateIso
          ? new Date(b.dateIso).getTime()
          : Number.MAX_SAFE_INTEGER;
        return da - db;
      });
  }, [events]);

  const formatRelativeDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return dateString;
    }
  };

  const current = sorted[index] ?? sorted[0];

  const handleShare = () => {
    if (!current) return;
    const url = `${window.location.origin}/events/${current.id}`;
    if (navigator.share) {
      navigator.share({ title: current.labelName, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleBuy = () => {
    if (!current) return;
    router.push(`/events/${current.id}`);
  };

  const go = (next: number) => {
    if (!sorted.length) return;
    const len = sorted.length;
    setIndex(((next % len) + len) % len);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-black">
        <SiteHeader user={user} />
        <div className=" w-full h-full relative flex items-center justify-center animate-pulse text-lg">docargan...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full bg-black">
        <SiteHeader user={user} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-neutral-800 bg-[#0E0E0E] p-4 text-center">
            <p className="text-sm text-red-400">Error al cargar eventos</p>
            <p className="mt-1 text-xs text-neutral-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="relative min-h-screen w-full bg-black">
        <SiteHeader user={user} />
        <div className="flex h-[calc(100vh-56px)] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-800 bg-[#0E0E0E]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="text-neutral-600"
              >
                <path
                  d="M8 2V5M16 2V5M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-white">
              No hay eventos programados
            </h3>
            <p className="text-sm text-neutral-500">
              Los próximos eventos aparecerán acá
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="absolute left-0 right-0 top-0 z-30">
        <SiteHeader user={user} />
      </div>

      <div className="absolute inset-0 z-10">
        <div className="relative h-full w-full">
          <Image
            src={
              current?.imageUrl ||
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80"
            }
            alt={current?.labelName || "Evento"}
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
            <p className="mb-2 text-sm font-medium text-white/70">
              {current.dateIso
                ? formatRelativeDate(current.dateIso)
                : current.date}{" "}
              • {current.location}
            </p>
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
          {sorted.map((_, i) => (
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

        {/* CTA EMBEBIDO SOBRE LA IMAGEN */}
        <div className="absolute inset-x-0 bottom-0 z-30">
          <CtaButtons
            primaryAction={handleBuy}
            secondaryAction={handleShare}
            primaryActionText="Comprar ahora"
            secondaryActionText="Compartir"
            className="pb-6"
          />
        </div>
      </div>
    </div>
  );
}
