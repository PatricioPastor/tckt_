"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Camera01,
  Flash,
  VolumeMax,
  VolumeX,
  RefreshCcw01,
  Download01,
  CheckCircle,
  AlertCircle,
} from "@untitledui/icons";

import { ResultItem } from "./components/scanner/result-item";
import { GeistScanner } from "./components/scanner/scanner";

type ScanResult = {
  id: string;
  status: "success" | "error";
  message: string;
  at: number;
  meta?: {
    owner?: {
      username?: string;
    };
    ticket?: unknown;
  };
};

export default function ScanPage() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [hapticsOn] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [logs, setLogs] = useState<{ level: "info" | "warn" | "error"; text: string; at: number }[]>([]);

  const successCount = useMemo(() => results.filter((r) => r.status === "success").length, [results]);
  const errorCount = results.length - successCount;

  const pushLog = useCallback((level: "info" | "warn" | "error", text: string) => {
    setLogs((prev) => [{ level, text, at: Date.now() }, ...prev].slice(0, 10));
  }, []);

  const onScan = useCallback(async (qrCode: string) => {
  try {
    const res = await fetch("/api/tickets/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode }),
    });

    const data = await res.json();
    const ok = data?.status === "success";

    // Normalizá message a string
    const message: string =
      typeof data?.message === "string"
        ? data.message
        : ok
        ? "Ticket válido"
        : "Ticket inválido";

    // Tipá explícitamente el item como ScanResult
    const newItem: ScanResult = {
      id: qrCode,
      status: ok ? "success" : "error",
      message,
      meta: data?.ticket ?? null,
      at: Date.now(),
    };

    setResults((prev) => [newItem, ...prev].slice(0, 50));

    return ok;
  } catch {
    const errorItem: ScanResult = {
      id: qrCode,
      status: "error",
      message: "Error de red o servidor",
      at: Date.now(),
    };
    setResults((prev) => [errorItem, ...prev].slice(0, 50));
    return false;
  }
  }, []);


  const handleClear = () => setResults([]);
  const exporting = useRef(false);

  const handleExport = async () => {
    if (exporting.current) return;
    exporting.current = true;
    try {
      const rows = results.map((r) => ({
        qr: r.id,
        status: r.status,
        message: r.message,
        at: new Date(r.at).toISOString(),
      }));
      const csv = [
        ["qr", "status", "message", "at"].join(","),
        ...rows.map((r) => [JSON.stringify(r.qr), r.status, JSON.stringify(r.message), r.at].join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scans-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      exporting.current = false;
    }
  };

  return (
    <div className="min-h-[100svh] bg-black text-neutral-200 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/80 backdrop-blur px-4">
        <div className="mx-auto max-w-5xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-semibold tracking-tight text-neutral-100">tckt_</span>
            <span className="text-sm text-neutral-400">Scanner</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCameraFacing((p) => (p === "environment" ? "user" : "environment"))}
              className="h-9 w-9 rounded-md border border-neutral-800 bg-[#0E0E0E] hover:bg-[#151515] grid place-items-center"
              title="Cambiar cámara"
            >
              <Camera01 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTorchOn((t) => !t)}
              className={cn(
                "h-9 rounded-md px-3 border border-neutral-800 bg-[#0E0E0E] hover:bg-[#151515] text-sm font-medium"
              )}
              title="Linterna"
            >
              <div className="flex items-center gap-2">
                <Flash className="h-4 w-4" />
                <span className="hidden sm:inline">{torchOn ? "Linterna ON" : "Linterna OFF"}</span>
              </div>
            </button>
            <button
              onClick={() => setSoundOn((s) => !s)}
              className="h-9 w-9 rounded-md border border-neutral-800 bg-[#0E0E0E] hover:bg-[#151515] grid place-items-center"
              title={soundOn ? "Sonido: ON" : "Sonido: OFF"}
            >
              {soundOn ? <VolumeMax className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Scanner + panel */}
      <main className="mx-auto w-full max-w-5xl flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 pb-[calc(88px+env(safe-area-inset-bottom))]">
        <section className="relative rounded-xl border border-neutral-800 bg-[#0E0E0E] overflow-hidden">
          <GeistScanner
            onDecoded={onScan}
            cameraFacing={cameraFacing}
            torch={torchOn}
            sound={soundOn}
            haptics={hapticsOn}
            debounceMs={1200}
            onLog={pushLog}
          />
        </section>

        <section className="flex flex-col rounded-xl border border-neutral-800 bg-[#0E0E0E]">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-neutral-300">OK</span>
                <span className="text-sm font-semibold text-neutral-100">{successCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span className="text-sm text-neutral-300">Errores</span>
                <span className="text-sm font-semibold text-neutral-100">{errorCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="h-9 rounded-md px-3 border border-neutral-800 bg-[#121212] hover:bg-[#171717] text-sm"
                title="Exportar CSV"
              >
                <div className="flex items-center gap-2">
                  <Download01 className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </div>
              </button>
              <button
                onClick={handleClear}
                className="h-9 w-9 rounded-md border border-neutral-800 bg-[#121212] hover:bg-[#171717] grid place-items-center"
                title="Limpiar lista"
              >
                <RefreshCcw01 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {results.length === 0 ? (
              <div className="h-full grid place-items-center">
                <p className="text-sm text-neutral-500">Aún no hay lecturas. Escaneá un QR para comenzar.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {results.map((r, idx) => (
                  <ResultItem key={`${r.id}-${r.at}-${idx}`} result={r} />
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      {/* Log bar del scanner (fachera) */}
      <div className="fixed left-4 right-4 bottom-20 z-30 mx-auto max-w-5xl">
        {logs.length > 0 && (
          <div className="rounded-lg border border-neutral-800 bg-black/80 backdrop-blur p-3">
            <p className="text-xs font-medium text-neutral-400 mb-2">Logs de cámara</p>
            <ul className="space-y-1 max-h-36 overflow-auto">
              {logs.map((l, i) => (
                <li key={i} className="text-xs">
                  <span
                    className={cn(
                      "inline-block w-14 text-center mr-2 rounded border px-1",
                      l.level === "info" && "border-neutral-700 text-neutral-400",
                      l.level === "warn" && "border-yellow-700/40 text-yellow-400",
                      l.level === "error" && "border-rose-700/40 text-rose-400"
                    )}
                  >
                    {l.level.toUpperCase()}
                  </span>
                  <span className="text-neutral-300">{l.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
