export default function Loading() {
  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-neutral-100 mx-auto" />
        <p className="text-lg text-neutral-400 animate-pulse">Cargando...</p>
      </div>
    </div>
  );
}
