import { useEffect, useState } from 'react';

/**
 * Hook para evitar hydration mismatches con stores persistidos.
 * Retorna `false` durante SSR y primera renderización, `true` después del montaje.
 *
 * Uso:
 * ```tsx
 * const isHydrated = useHydration();
 * const data = usePersistedStore();
 *
 * if (!isHydrated) {
 *   return <Skeleton />; // Renderizado consistente SSR/cliente
 * }
 *
 * return <div>{data}</div>; // Seguro de usar después de hydration
 * ```
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
