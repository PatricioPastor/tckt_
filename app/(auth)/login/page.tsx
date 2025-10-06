import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <Suspense fallback={<div className="text-center text-neutral-400">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
