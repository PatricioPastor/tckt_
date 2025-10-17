"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { AlertCircle, Eye, EyeOff } from "@untitledui/icons";
import { Checkbox } from "../ui/checkbox";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    tabParam === "login" ? "login" : "signup"
  ); // Default: signup o según query param
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session?.user) router.replace("/");
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (activeTab === "login") {
      await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: "/tickets",
          rememberMe: false,
        },
        {
          onSuccess: () => router.push("/tickets"),
          onError: (ctx) => {
            setError(ctx.error.message || "Error al iniciar sesión");
            setIsLoading(false);
          },
        }
      );
    } else {
      // Signup
      await authClient.signUp.email(
        {
          email,
          password,
          name: `${firstName} ${lastName}`.trim(),
          callbackURL: "/",
        },
        {
          onSuccess: () => router.push("/"),
          onError: (ctx) => {
            setError(ctx.error.message || "Error al crear cuenta");
            setIsLoading(false);
          },
        }
      );
    }
  }

  const googleLogin = async () => {

    setIsLoading(true)

    const data = await authClient.signIn.social({
      provider: "google",
      fetchOptions:{
        onSuccess: () => {
          setIsLoading(false)
        },
        onError: (ctx) => {
          setError(ctx.error.message)
          setIsLoading(false)
        }
      }
    });
  };

  return (
    <div className="flex h-full w-full bg-background">
      {/* Left Side - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image src="/logo.png" alt="tckt logo" width={120} height={28} className="h-auto w-[120px]" />
          </div>

          {/* Heading */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              {activeTab === "login" ? "Bienvenido de nuevo" : "Crear una cuenta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <>
                  ¿No tenés cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Registrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tenés cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Iniciá sesión
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 w-full relative rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Nombre
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Juan"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Pérez"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresá tu contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {activeTab === "signup" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los{" "}
                  <a href="#" className="text-primary underline-offset-4 hover:underline">
                    Términos y Condiciones
                  </a>
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (activeTab === "signup" && !agreedToTerms)}
            >
              {isLoading ? "Cargando..." : activeTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </Button>

            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O continuar con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={googleLogin} type="button" variant="outline" className="w-full bg-transparent">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button type="button" variant="outline" className="w-full bg-transparent" disabled>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>
            </div> */}
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/design-mode/pexels-wendywei-1306791.jpg"
          alt="Event atmosphere"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-12">
          <div className="max-w-md space-y-4"></div>
        </div>
      </div>
    </div>
  );
}
