"use client";

import { CheckCircle, AlertCircle } from "@untitledui/icons";

type ScanResult = {
  id: string;
  status: "success" | "error";
  message: string;
  at: number;
  meta?: {
    owner?: {
      username?: string;
    };
  };
};

export function ResultItem({ result }: { result: ScanResult }) {
  const dt = new Date(result.at);
  const hh = dt.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <li className="rounded-lg border border-neutral-800 bg-[#0F0F0F] px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {result.status === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            )}
            <span className="text-xs text-neutral-500">{hh}</span>
          </div>
          <p className="mt-1 text-sm text-neutral-200 break-all">{result.message}</p>
          <p className="mt-1 text-[11px] text-neutral-500 break-all">{result.id}</p>
          {result.meta?.owner?.username && (
            <p className="mt-1 text-xs text-neutral-300">
              Titular: <span className="text-neutral-100">{result.meta.owner.username}</span>
            </p>
          )}
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            result.status === "success"
              ? "border border-emerald-700/40 bg-emerald-900/20 text-emerald-300"
              : "border border-rose-700/40 bg-rose-900/20 text-rose-300",
          ].join(" ")}
        >
          {result.status === "success" ? "VÁLIDO" : "INVÁLIDO"}
        </span>
      </div>
    </li>
  );
}
