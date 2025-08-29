"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface SlideToConfirmProps {
  onConfirm: () => void;
  disabled?: boolean;
  text?: string;
  confirmText?: string;
  className?: string;
}

export function SlideToConfirm({
  onConfirm,
  disabled = false,
  text = "Deslizar para confirmar",
  confirmText = "Procesando...",
  className = "",
}: SlideToConfirmProps) {
  const [isSliding, setIsSliding] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (x: number, max: number) => {
      const pos = Math.max(0, Math.min(max, x));
      setSlidePosition(pos);
      if (pos >= max * 0.9) {
        setIsComplete(true);
        setIsSliding(false);
        onConfirm();
      }
    };

    const mm = (e: MouseEvent) => {
      if (!isSliding || !containerRef.current || !sliderRef.current || disabled) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sw = sliderRef.current.offsetWidth;
      const max = containerRef.current.offsetWidth - sw;
      move(e.clientX - rect.left - sw / 2, max);
    };
    const mu = () => { if (isSliding && !isComplete) setSlidePosition(0); setIsSliding(false); };

    const tm = (e: TouchEvent) => {
      if (!isSliding || !containerRef.current || !sliderRef.current || disabled) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sw = sliderRef.current.offsetWidth;
      const max = containerRef.current.offsetWidth - sw;
      move(e.touches[0].clientX - rect.left - sw / 2, max);
    };
    const te = () => { if (isSliding && !isComplete) setSlidePosition(0); setIsSliding(false); };

    if (isSliding) {
      document.addEventListener("mousemove", mm);
      document.addEventListener("mouseup", mu);
      document.addEventListener("touchmove", tm);
      document.addEventListener("touchend", te);
    }
    return () => {
      document.removeEventListener("mousemove", mm);
      document.removeEventListener("mouseup", mu);
      document.removeEventListener("touchmove", tm);
      document.removeEventListener("touchend", te);
    };
  }, [isSliding, disabled, onConfirm, isComplete]);

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || isComplete) return;
    e.preventDefault();
    setIsSliding(true);
  };

  const sliderSize = 48;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className={`
          relative h-14 w-full overflow-hidden rounded-xl border 
          border-neutral-800 bg-[#0E0E0E]
          ${disabled ? "cursor-not-allowed opacity-60" : isSliding ? "cursor-grabbing" : "cursor-grab"}
          transition-all
        `}
      >
        {/* Track */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] to-[#111]" />

        {/* Progress */}
        <div
          className="absolute left-0 top-0 h-full rounded-xl bg-neutral-800/60 transition-[width]"
          style={{
            width: `${(slidePosition / ((containerRef.current?.offsetWidth || 1) - sliderSize)) * 100}%`,
          }}
        />

        {/* Text */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-neutral-300">
            {isComplete ? confirmText : text}
          </span>
        </div>

        {/* Knob */}
        <div
          ref={sliderRef}
          className={`
            absolute top-1 left-1 flex h-12 w-12 items-center justify-center rounded-lg 
            border border-neutral-700 bg-neutral-100 text-black shadow-sm transition-all will-change-transform
            ${disabled || isComplete ? "cursor-not-allowed" : isSliding ? "cursor-grabbing" : "cursor-grab hover:bg-white"}
          `}
          style={{ transform: `translateX(${slidePosition}px)`, transition: isSliding ? "none" : "transform 0.2s ease-out" }}
          onMouseDown={start}
          onTouchStart={start}
        >
          {isComplete ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          ) : (
            <ChevronRight size={20} />
          )}
        </div>
      </div>
    </div>
  );
}
