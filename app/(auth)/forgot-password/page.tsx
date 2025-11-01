"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      setEmailSent(true);
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : "No se pudo enviar el correo. Intenta nuevamente.";
      setErrorMessage(fallback);
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
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
              <CardTitle>Revisa tu correo</CardTitle>
              <CardDescription>
                Te enviamos un enlace para restablecer tu contraseña a{" "}
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
              <p>
                El enlace expirará en 1 hora.
              </p>
              <div className="rounded-lg border border-yellow-900/20 bg-yellow-950/20 p-3">
                <p className="text-yellow-500 font-medium">
                  ⚠️ Revisa tu carpeta de spam
                </p>
                <p className="mt-1 text-xs text-yellow-600">
                  Si no ves el correo en tu bandeja principal, verifica la carpeta de correo no deseado o spam.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesion
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
              <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
              <CardDescription>
                Ingresa tu correo electronico y te enviaremos un enlace para
                restablecer tu contraseña.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                {isSubmitting ? "Enviando..." : "Enviar enlace de recuperacion"}
              </Button>

              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesion
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
