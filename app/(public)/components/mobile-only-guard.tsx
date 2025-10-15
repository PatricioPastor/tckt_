"use client";

import { useEffect, useState } from "react";

export function MobileOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth > 500);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // During SSR and first render, show nothing to avoid hydration mismatch
  if (isDesktop === null) {
    return (
      <div className="relative min-h-screen w-full bg-black flex items-center justify-center">
        <div className="animate-pulse text-lg text-neutral-400">
          Cargando...
        </div>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="text-center text-white">
          <p className="text-lg">
            Esta aplicación no soporta computadoras, ingrese desde el teléfono móvil
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
