"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "../ui/alert";
import { Terminal } from "lucide-react";
import { IconLoader } from "@tabler/icons-react";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  // 🔹 Todos los hooks al tope
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // 🔹 Redirección como efecto, no con return condicional
  useEffect(() => {
    if (session?.user) router.replace("/tickets");
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/",
        rememberMe: false,
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => router.push("/"),
        onError: (ctx) => {
          setErrorMsg(ctx.error.message);
          setLoading(false);
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>hola de nuevo</CardTitle>
          <CardDescription>ingresá con tu correo</CardDescription>
        </CardHeader>
        <CardContent>
          {(isPending || loading) && (
            <div className="mb-4 flex items-center gap-2 text-neutral-400">
              <IconLoader className="animate-spin" />
              cargando...
            </div>
          )}

          {errorMsg && (
            <Alert className="mb-4 border border-red-500" variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Correo</Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  type="password"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button disabled={loading || isPending} type="submit" className="w-full">
                  {loading ? <IconLoader className="animate-spin" stroke={2} /> : "Ingresar"}
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              primera vez?
              <a href="/signup" className="underline ml-1 underline-offset-4">
                ingresá acá
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
