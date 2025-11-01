"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const error = useMemo(() => searchParams.get("error"), [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    if (error === "INVALID_TOKEN") {
      setErrorMessage("El enlace de recuperaci�n es inv�lido o ha expirado.");
    } else if (!token) {
      setErrorMessage("Falta el token de verificaci�n.");
    }
  }, [error, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contrase�as no coinciden.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("La contrase�a debe tener al menos 8 caracteres.");
      return;
    }

    if (!token) {
      setErrorMessage("Token de verificaci�n faltante.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (error) {
        setErrorMessage(
          error.message ??
            "No se pudo restablecer la contrase�a. Intent� nuevamente.",
        );
        setIsSubmitting(false);
        return;
      }

      setPasswordReset(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : "No se pudo restablecer la contrase�a.";
      setErrorMessage(fallback);
      setIsSubmitting(false);
    }
  };

  if (passwordReset) {
    return (
      <div
        className="flex w-full flex-1 items-center justify-center px-4 py-10 supports-[height:100svh]:py-12"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 2.5rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)",
        }}
      >
        <div className="w-full max-w-sm">
          <Card className="w-full border-border/80 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-950/20 border border-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle>Contrase�a restablecida</CardTitle>
              <CardDescription>
                Tu contrase�a fue restablecida exitosamente. Vas a ser
                redirigido al inicio de sesi�n en 3 segundos...
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex justify-center">
              <Link href="/login">
                <Button>Ir al inicio de sesi�n ahora</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (errorMessage && !token) {
    return (
      <div
        className="flex w-full flex-1 items-center justify-center px-4 py-10 supports-[height:100svh]:py-12"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 2.5rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)",
        }}
      >
        <div className="w-full max-w-sm">
          <Card className="w-full border-border/80 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/20 border border-red-900/20">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle>Enlace inv�lido</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>

            <CardFooter className="flex flex-col gap-2">
              <Link href="/forgot-password" className="w-full">
                <Button className="w-full">Solicitar nuevo enlace</Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Volver al inicio de sesi�n
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-1 items-center justify-center px-4 py-10 supports-[height:100svh]:py-12"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 2.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)",
      }}
    >
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="w-full">
          <Card className="w-full border-border/80 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <Link href="/" className="flex justify-center">
                <Image
                  src="/logo.png"
                  alt="Tckt logo"
                  width={120}
                  height={32}
                  priority
                  className="h-auto w-[120px]"
                />
              </Link>
              <CardTitle>Restablecer contrase�a</CardTitle>
              <CardDescription>
                Ingresa tu nueva contrase�a para continuar.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nueva contrase�a</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="*********"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isSubmitting}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  M�nimo 8 caracteres
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar contrase�a</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="*********"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {errorMessage ? (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              ) : null}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Restableciendo..." : "Restablecer contrase�a"}
              </Button>

              <Link
                href="/login"
                className="text-sm text-center text-muted-foreground hover:text-primary"
              >
                Volver al inicio de sesi�n
              </Link>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-1 items-center justify-center">
          Cargando...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
