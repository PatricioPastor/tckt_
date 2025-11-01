import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen w-screen justify-center overflow-hidden bg-background supports-[min-height:100svh]:min-h-[100svh]"
    >
      {children}
    </div>
  );
}
