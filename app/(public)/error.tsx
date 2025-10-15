"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error("[Public Error]", error);
  }, [error]);

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-900 bg-red-950/20">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">
          Algo salió mal
        </h2>
        <p className="mb-6 text-sm text-neutral-400">
          {error.message || "Ocurrió un error inesperado. Por favor, intentá nuevamente."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-neutral-100 text-black hover:bg-neutral-200"
          >
            Reintentar
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="ghost"
            className="text-white hover:bg-neutral-800"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
