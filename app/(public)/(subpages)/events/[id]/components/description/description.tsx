"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, InfoCircle } from "@untitledui/icons";
import { cn } from "@/lib/utils";

export function Description({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [needsClamp, setNeedsClamp] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Detecta si hace falta “ver más”
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setNeedsClamp(el.scrollHeight > 120); // ~6-7 líneas
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [description]);

  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-[#0E0E0E] p-4">
      <div className="mb-2 flex items-center gap-2">
        <InfoCircle className="size-5 text-neutral-400" />
        <h2 className="text-lg font-semibold text-neutral-100">Sobre el evento</h2>
      </div>

      <div className="relative">
        <div
          ref={contentRef}
          className={cn(
            "text-sm leading-relaxed text-neutral-300 transition-[max-height] duration-300 ease-in-out",
            expanded ? "max-h-[1000px]" : "max-h-[120px] overflow-hidden"
          )}
        >
          {description || "No hay descripción disponible para este evento."}
        </div>

        {/* Fade bottom cuando está colapsado */}
        {!expanded && needsClamp && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0E0E0E] to-transparent" />
        )}
      </div>

      {needsClamp && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-neutral-200 hover:text-white"
        >
          {expanded ? "Ver menos" : "Ver más"}
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300",
              expanded && "rotate-180"
            )}
          />
        </button>
      )}
    </div>
  );
}
