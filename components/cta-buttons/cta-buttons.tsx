import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type CtaButtonsProps = {
  primaryAction: (e: React.MouseEvent<HTMLButtonElement>) => void;
  secondaryAction: (e: React.MouseEvent<HTMLButtonElement>) => void;
  primaryActionText: string;
  secondaryActionText: string;
  className?: string;
};

/**
 * Geist-style: vidrio fino, borde transparente, redondeado grande.
 * Pensado para montarse SOBRE la imagen (hero).
 */
export const CtaButtons = ({
  primaryAction,
  secondaryAction,
  primaryActionText,
  secondaryActionText,
  className,
}: CtaButtonsProps) => {
  return (
    <div
      className={cn(
        "w-full px-4 pb-[calc(8px+env(safe-area-inset-bottom))]",
        "pointer-events-none", // el contenedor ignora clicks
        className
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-md",
          "rounded-2xl p-2",
          "bg-black/30 backdrop-blur-md",
          "border border-transparent", // borde “transparente”
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        )}
        style={{
          // “halo” muy sutil con gradient — puro Geist
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
};
