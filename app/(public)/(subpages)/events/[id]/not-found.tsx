import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-800 bg-[#0E0E0E]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-600"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">
          Evento no encontrado
        </h2>
        <p className="mb-6 text-sm text-neutral-400">
          El evento que buscás no existe o ya no está disponible.
        </p>
        <Link href="/">
          <Button className="bg-neutral-100 text-black hover:bg-neutral-200">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
