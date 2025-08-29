"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { cn } from "@/lib/utils";
import { Lock01, ShieldTick, Camera01 } from "@untitledui/icons";

type Props = {
  onDecoded: (text: string) => Promise<boolean> | boolean;
  cameraFacing?: "environment" | "user";
  torch?: boolean;
  debounceMs?: number;
  sound?: boolean;
  haptics?: boolean;
  onLog?: (level: "info" | "warn" | "error", text: string) => void;
};

type PermState = "unknown" | "granted" | "denied" | "prompt";

export function GeistScanner({
  onDecoded,
  cameraFacing = "environment",
  torch = false,
  debounceMs = 1200,
  sound = true,
  haptics = true,
  onLog,
}: Props) {
  const elId = "geist-qr";
  const qr = useRef<Html5Qrcode | null>(null);
  const lastHit = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const seen = useRef<Map<string, number>>(new Map());
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const curFacing = useRef(cameraFacing);

  const [perm, setPerm] = useState<PermState>("unknown");
  const [requesting, setRequesting] = useState(false);

  // beep/haptics
  const audioCtx = useRef<AudioContext | null>(null);
  const playBeep = (ok: boolean) => {
    if (!sound) return;
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const ctx = audioCtx.current!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = ok ? 880 : 220;
      g.gain.value = ok ? 0.03 : 0.05;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); o.disconnect(); g.disconnect(); }, ok ? 100 : 160);
    } catch {}
  };
  const vibrate = (ok: boolean) => {
    if (!haptics || typeof navigator?.vibrate !== "function") return;
    navigator.vibrate(ok ? 15 : [40, 40, 40]);
  };

  const overlayRef = useRef<HTMLDivElement>(null);
  const flash = (kind: "ok" | "err") => {
    const el = overlayRef.current;
    if (!el) return;
    el.classList.remove("flash-ok", "flash-err");
    void el.offsetWidth;
    el.classList.add(kind === "ok" ? "flash-ok" : "flash-err");
  };

  // -------- PERMISOS ----------
  const checkPermission = async () => {
    try {
      // No todos los browsers soportan Permissions API (iOS viejos)
      const anyNav = navigator as typeof navigator & { permissions?: { query?: (options: { name: string }) => Promise<{ state: string; onchange: () => void }> } };
      if (anyNav?.permissions?.query) {
        const status = await anyNav.permissions.query({ name: "camera" as PermissionName });
        setPerm(status.state as PermState);
        onLog?.("info", `Estado de cámara: ${status.state}`);
        status.onchange = () => {
          setPerm(status.state as PermState);
          onLog?.("info", `Permiso de cámara cambió a: ${status.state}`);
        };
      } else {
        // sin API -> lo tratamos como "prompt" hasta que probemos getUserMedia
        setPerm("prompt");
        onLog?.("info", "Permissions API no disponible; solicitaremos al escanear.");
      }
    } catch {
      setPerm("prompt");
    }
  };

  const requestAccess = async () => {
    setRequesting(true);
    try {
      // Esto dispara el prompt real
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: curFacing.current },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: false,
      });
      // cerramos los tracks para ceder a html5-qrcode
      stream.getTracks().forEach((t) => t.stop());
      setPerm("granted");
      onLog?.("info", "Permiso de cámara concedido.");
      await start(); // arrancamos el escáner
    } catch (e: unknown) {
      setPerm("denied");
      onLog?.("error", e instanceof Error ? e.message : "Acceso a cámara denegado.");
    } finally {
      setRequesting(false);
    }
  };

  // -------- SCANNER ----------
  const start = async () => {
    try {
      if (!document.getElementById(elId)) return;
      if (!qr.current) qr.current = new Html5Qrcode(elId, false);

      const facing = curFacing.current;

      await qr.current.start(
        { 
          facingMode: { ideal: facing },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          aspectRatio: { ideal: 16/9 }
        },
        {
          fps: 15,
          qrbox: ((vw: number, vh: number) => {
            const size = Math.floor(Math.min(vw, vh) * 0.7);
            return { width: size, height: size };
          }),
          aspectRatio: 1.0,
          disableFlip: false,    
      
        },
        async (decodedText: string) => {
          const now = Date.now();
          if (now - lastHit.current.at < debounceMs) return;
          const last = seen.current.get(decodedText) || 0;
          if (now - last < 3000) return;
          seen.current.set(decodedText, now);
          lastHit.current = { text: decodedText, at: now };

          const ok = await onDecoded(decodedText);
          playBeep(ok);
          vibrate(ok);
          flash(ok ? "ok" : "err");
        },
        (err: string) => {
          if (err?.includes("Video stream not ready")) return;
          onLog?.("warn", err);
        }
      );

      // Torch (si existe)
      try {
        await qr.current.applyVideoConstraints({ advanced: [{ torch: !!torch } as MediaTrackConstraintSet] });
      } catch {
        /* ignora si no soporta */
      }

      setActive(true);
      onLog?.("info", "Cámara activa. Escaneando…");
    } catch (e: unknown) {
      setActive(false);
      onLog?.("error", e instanceof Error ? e.message : "No se pudo iniciar la cámara.");
    } finally {
      setReady(true);
    }
  };

  const stop = async () => {
    try {
      await qr.current?.stop();
      await qr.current?.clear();
    } catch {}
    setActive(false);
    onLog?.("info", "Cámara detenida.");
  };

  // lifecycle
  useEffect(() => { checkPermission(); }, []);
  useEffect(() => {
    // si ya está concedido, arrancamos automáticamente
    if (perm === "granted" && !active) start();
    // si denied/prompt, no arrancamos hasta botón
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perm, active, checkPermission]);

  // switch camera
  useEffect(() => {
    const swap = async () => {
      if (!qr.current || perm !== "granted") return;
      curFacing.current = cameraFacing;
      await stop();
      await start();
    };
    swap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraFacing]);

  // toggle torch
  useEffect(() => {
    const applyTorch = async () => {
      if (!qr.current) return;
      try {
        await qr.current.applyVideoConstraints({ advanced: [{ torch: !!torch } as MediaTrackConstraintSet] });
      } catch {}
    };
    applyTorch();
  }, [torch]);

  return (
    <div className="relative h-full w-full">
      {/* video */}
      <div id={elId} className="h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />

      {/* frame geist */}
      <div
        ref={overlayRef}
        className={cn(
          "pointer-events-none absolute inset-0 grid place-items-center",
          "after:block after:h-[70%] after:w-[70%] after:max-w-[560px] after:max-h-[560px]",
          "after:rounded-2xl after:border after:border-neutral-700 after:bg-transparent",
          "after:shadow-[0_0_0_9999px_rgba(0,0,0,0.35)_inset]",
          "after:[outline:2px_solid_rgba(255,255,255,0.06)]",
          "after:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.06)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="h-10 w-10 rounded-md border border-neutral-700/60" />
      </div>

      {/* status chip */}
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-neutral-800 bg-black/60 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur">
        {ready ? (active ? "Escaneando…" : "Cámara detenida") : "Inicializando cámara…"}
      </div>

      {/* PERMISSION OVERLAY */}
      {(perm === "prompt" || perm === "denied" || perm === "unknown") && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-[#0E0E0E] p-5">
            <div className="flex items-center gap-3">
              <ShieldTick className="h-5 w-5 text-neutral-300" />
              <h3 className="text-neutral-100 font-medium">Permitir acceso a la cámara</h3>
            </div>
            <p className="mt-2 text-sm text-neutral-400">
              Para escanear códigos, necesitamos acceso a la cámara del dispositivo.
            </p>

            {perm === "denied" && (
              <div className="mt-3 rounded-md border border-neutral-800 bg-black/40 p-3 text-xs text-neutral-400">
                <div className="flex items-center gap-2 mb-1">
                  <Lock01 className="h-4 w-4" />
                  <span>Acceso denegado</span>
                </div>
                <p>Abrí la configuración del navegador y habilitá “Cámara” para este sitio.</p>
              </div>
            )}

            <button
              onClick={requestAccess}
              disabled={requesting}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-neutral-100 px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              <Camera01 className="h-4 w-4" />
              {requesting ? "Solicitando permiso…" : "Permitir cámara"}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .flash-ok::after {
          outline-color: rgba(16, 185, 129, 0.6) !important;
          box-shadow: inset 0 0 0 1px rgba(16,185,129,0.5), 0 0 32px rgba(16,185,129,0.15) !important;
          transition: box-shadow 300ms ease, outline-color 300ms ease;
        }
        .flash-err::after {
          outline-color: rgba(244, 63, 94, 0.6) !important;
          box-shadow: inset 0 0 0 1px rgba(244,63,94,0.5), 0 0 32px rgba(244,63,94,0.15) !important;
          transition: box-shadow 300ms ease, outline-color 300ms ease;
        }
      `}</style>
    </div>
  );
}
