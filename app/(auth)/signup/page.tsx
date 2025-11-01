"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type GoogleGlyphProps = {
  className?: string;
};

const GoogleGlyph = ({ className }: GoogleGlyphProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31l3.57 2.77c2.08-1.92 3.28-4.74 3.28-8.09Z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09a6.98 6.98 0 0 1-.35-2.09c0-.73.13-1.43.35-2.09V7.07H2.18A10.01 10.01 0 0 0 2 12c0 1.78.43 3.45 1.18 4.93l2.66-2.06Z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      fill="#EA4335"
    />
  </svg>
);

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => searchParams.get("redirectTo") ?? "/home", [searchParams]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Ingresa nombre y apellido.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contrasenas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authClient.signUp.email(
        {
          email,
          password,
          name: `${firstName} ${lastName}`.trim(),
          callbackURL: redirectTo,
        },
        {
          onSuccess: () => {
            router.push(redirectTo);
          },
          onError: (ctx) => {
            setErrorMessage(ctx.error.message ?? "No se pudo crear la cuenta.");
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
      setErrorMessage(fallback);
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
        fetchOptions: {
          onSuccess: () => {
            router.push(redirectTo);
          },
          onError: (ctx) => {
            setErrorMessage(ctx.error.message ?? "Fallo el registro con Google.");
            setIsSubmitting(false);
          },
        },
      });
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Fallo el registro con Google.";
      setErrorMessage(fallback);
      setIsSubmitting(false);
    }
  };

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
              <CardTitle>Crear cuenta</CardTitle>
              <CardDescription>Registrate para comenzar a usar Tckt.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <Button type="button" variant="outline" className="w-full" disabled={isSubmitting} onClick={handleGoogleRegister}>
                <GoogleGlyph className="mr-2 h-4 w-4" />
                Registrarse con Google
              </Button>

              <div className="grid gap-2 min-[360px]:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="first-name">Nombre</Label>
                  <Input
                    id="first-name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="last-name">Apellido</Label>
                  <Input
                    id="last-name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

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

              <div className="grid gap-2">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="*********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Repeti la contrasena</Label>
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
                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Ya tienes una cuenta?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                  Inicia sesion
                </Link>
              </p>

              <p className="text-xs text-center text-muted-foreground">
                Al continuar aceptas nuestros{" "}
                <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-primary">
                  Terminos y Condiciones
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex w-full flex-1 items-center justify-center">Cargando...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
